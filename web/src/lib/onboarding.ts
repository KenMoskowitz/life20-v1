import type Stripe from 'stripe';
import { CircleApiError, isSignupComplete, type CircleClient } from './circle.ts';

// Post-purchase onboarding: paid Life 2.0 checkout → Circle invitation.
//
// One record per purchaser email (not per checkout), because everyone gets
// the same access to the whole community. A second purchase, a subscription
// renewal, or a replayed webhook all land on the same record and find the
// person already onboarded.
//
// Stages are kept apart on purpose:
//   invited           Circle accepted the invite and sent its invitation email
//   signup_completed  the person finished Circle signup (profile confirmed)
// Only Circle sends email. This module never emails anyone itself.
//
// Dependencies are injected so the whole flow can be tested without Stripe,
// Circle or Sanity. See tests/onboarding.test.ts.

export type OnboardingStatus =
  | 'awaiting_payment' // checkout done, delayed payment method still processing
  | 'payment_failed' // delayed payment failed; nobody is invited
  | 'processing' // an invite attempt is in flight (short-lived lock)
  | 'invited'
  | 'signup_completed'
  | 'failed' // Circle error that a retry could fix
  | 'needs_attention'; // Circle keeps rejecting this one; a person should look

export type OnboardingRecord = {
  id: string;
  rev: string;
  email: string;
  name?: string | null;
  status: OnboardingStatus;
  stripeSessionIds: string[];
  circleMemberId?: number | null;
  // 'website' = this integration sent the invite; 'existing' = the person was
  // already a member or already had a pending invite, so nothing was sent.
  inviteSource?: 'website' | 'existing' | null;
  invitedAt?: string | null;
  signupCompletedAt?: string | null;
  attempts: number;
  lastError?: string | null;
  lockedAt?: string | null;
  lastCheckedAt?: string | null;
};

export type RecordFields = Partial<Omit<OnboardingRecord, 'id' | 'rev' | 'email' | 'stripeSessionIds'>>;

export interface OnboardingStore {
  // Creates the record if it doesn't exist yet (never overwrites), then
  // returns the current version.
  ensure(email: string, name: string | null | undefined): Promise<OnboardingRecord>;
  // Compare-and-set against `record.rev`. Returns false if someone else
  // changed the record first, which is how concurrent deliveries of the same
  // webhook are kept from both inviting.
  claim(record: OnboardingRecord, fields: RecordFields): Promise<boolean>;
  update(record: OnboardingRecord, fields: RecordFields, addSessionId?: string): Promise<void>;
  listForSync(opts: { staleLockBefore: string; invitedSince: string; limit: number }): Promise<OnboardingRecord[]>;
}

type StripeLike = {
  checkout: {
    sessions: {
      retrieve(id: string, params: { expand: string[] }): Promise<Stripe.Checkout.Session>;
    };
  };
};

export type OnboardingDeps = {
  stripe: StripeLike;
  circle: CircleClient | null;
  store: OnboardingStore;
  // Price IDs that count as a Life 2.0 purchase (full pay + installment).
  qualifyingPriceIds: string[];
  now?: () => Date;
  log?: Pick<Console, 'info' | 'warn' | 'error'>;
};

export type OnboardingOutcome =
  | 'ignored_event'
  | 'ignored_unrelated'
  | 'no_email'
  | 'awaiting_payment'
  | 'payment_failed'
  | 'invited'
  | 'already_invited'
  | 'already_member'
  | 'already_onboarded'
  | 'in_progress'
  | 'circle_failed'
  | 'circle_rejected'
  | 'circle_not_configured';

export type OnboardingResult = {
  outcome: OnboardingOutcome;
  // True when the caller should report failure so Stripe redelivers the
  // event. The record is already marked `failed`, so the daily sync would
  // also pick it up; Stripe's retries are just faster.
  retry: boolean;
};

export const CHECKOUT_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
]);

// A crashed function can leave a record in `processing`; after this long
// another attempt is allowed to take over.
const LOCK_TTL_MS = 2 * 60 * 1000;
// How long to keep checking whether an invited person has signed up.
// Circle's Business plan allows 5,000 API requests a month, so this is capped.
const SIGNUP_WATCH_DAYS = 45;

const DONE: OnboardingStatus[] = ['invited', 'signup_completed'];
const PAYMENT_STATES: OnboardingStatus[] = ['awaiting_payment', 'payment_failed'];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function handleCheckoutEvent(event: Stripe.Event, deps: OnboardingDeps): Promise<OnboardingResult> {
  if (!CHECKOUT_EVENTS.has(event.type)) return { outcome: 'ignored_event', retry: false };
  const log = deps.log ?? console;

  // Re-read the session instead of trusting the event payload: it's the
  // current state (the payload can be stale on a retry) and gives us the
  // line items, which the event doesn't include.
  const sessionId = (event.data.object as Stripe.Checkout.Session).id;
  const session = await deps.stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });

  const priceIds = new Set(deps.qualifyingPriceIds.filter(Boolean));
  const qualifies = (session.line_items?.data ?? []).some((item) => item.price?.id && priceIds.has(item.price.id));
  if (!qualifies) return { outcome: 'ignored_unrelated', retry: false };

  const rawEmail = session.customer_details?.email ?? session.customer_email;
  if (!rawEmail) {
    log.error(`[onboarding] Life 2.0 checkout ${session.id} has no email; cannot invite to Circle.`);
    return { outcome: 'no_email', retry: false };
  }
  const email = normalizeEmail(rawEmail);
  const name = session.customer_details?.name ?? null;

  if (event.type === 'checkout.session.async_payment_failed') {
    await recordPaymentState(email, name, session.id, 'payment_failed', deps);
    return { outcome: 'payment_failed', retry: false };
  }

  // 'paid', or 'no_payment_required' for a 100%-off code. 'unpaid' means a
  // delayed method (bank debit etc.) is still processing; Stripe sends
  // async_payment_succeeded when it clears and we invite then.
  if (session.payment_status === 'unpaid') {
    await recordPaymentState(email, name, session.id, 'awaiting_payment', deps);
    return { outcome: 'awaiting_payment', retry: false };
  }

  return inviteToCircle(email, name, session.id, deps);
}

async function recordPaymentState(
  email: string,
  name: string | null,
  sessionId: string,
  status: OnboardingStatus,
  deps: OnboardingDeps,
) {
  const record = await deps.store.ensure(email, name);
  // Never downgrade someone who is already invited or mid-invite because a
  // different checkout of theirs is pending or failed.
  const fields = PAYMENT_STATES.includes(record.status) ? { status } : {};
  await deps.store.update(record, fields, sessionId);
}

export async function inviteToCircle(
  email: string,
  name: string | null | undefined,
  sessionId: string | undefined,
  deps: OnboardingDeps,
): Promise<OnboardingResult> {
  const log = deps.log ?? console;
  const now = deps.now ?? (() => new Date());

  const record = await deps.store.ensure(email, name);

  if (DONE.includes(record.status)) {
    await deps.store.update(record, {}, sessionId);
    return { outcome: 'already_onboarded', retry: false };
  }

  if (record.status === 'processing' && record.lockedAt && now().getTime() - Date.parse(record.lockedAt) < LOCK_TTL_MS) {
    return { outcome: 'in_progress', retry: false };
  }

  if (!deps.circle) {
    log.error('[onboarding] CIRCLE_API_TOKEN not configured; invite recorded as failed for retry.');
    await deps.store.update(record, { status: 'failed', lastError: 'Circle API token not configured' }, sessionId);
    return { outcome: 'circle_not_configured', retry: true };
  }

  const attemptAt = now().toISOString();
  const claimed = await deps.store.claim(record, {
    status: 'processing',
    lockedAt: attemptAt,
    attempts: record.attempts + 1,
    ...(name && !record.name ? { name } : {}),
  });
  if (!claimed) return { outcome: 'in_progress', retry: false };
  // claim() bumped the revision; later updates are plain patches.

  try {
    // Look first: an existing member, or someone with a pending invite,
    // must not get a second invitation email.
    let member = await deps.circle.findMemberByEmail(email);
    let outcome: OnboardingOutcome;

    if (member) {
      outcome = isSignupComplete(member) ? 'already_member' : 'already_invited';
    } else {
      try {
        member = await deps.circle.inviteMember({ email, name: name ?? record.name });
        outcome = 'invited';
      } catch (err) {
        // A 422 can mean they were added between our search and the invite
        // (e.g. an admin did it by hand). Check again before calling it a failure.
        if (err instanceof CircleApiError && err.status === 422) {
          member = await deps.circle.findMemberByEmail(email);
          if (!member) throw err;
          outcome = isSignupComplete(member) ? 'already_member' : 'already_invited';
        } else {
          throw err;
        }
      }
    }

    const signedUp = isSignupComplete(member);
    await deps.store.update(
      record,
      {
        status: signedUp ? 'signup_completed' : 'invited',
        circleMemberId: member.id ?? null,
        inviteSource: outcome === 'invited' ? 'website' : 'existing',
        invitedAt: outcome === 'invited' ? attemptAt : (record.invitedAt ?? attemptAt),
        signupCompletedAt: signedUp ? (member.profile_confirmed_at ?? attemptAt) : null,
        lockedAt: null,
        lastError: null,
        lastCheckedAt: attemptAt,
      },
      sessionId,
    );
    log.info(`[onboarding] Circle ${outcome} for checkout ${sessionId ?? '(sync)'}.`);
    return { outcome, retry: false };
  } catch (err) {
    const retryable = !(err instanceof CircleApiError) || err.retryable;
    const message = err instanceof Error ? err.message : String(err);
    log.error(`[onboarding] Circle invite failed for checkout ${sessionId ?? '(sync)'}: ${message}`);
    await deps.store.update(
      record,
      { status: retryable ? 'failed' : 'needs_attention', lockedAt: null, lastError: message.slice(0, 500) },
      sessionId,
    );
    return { outcome: retryable ? 'circle_failed' : 'circle_rejected', retry: retryable };
  }
}

export type SyncSummary = {
  retried: number;
  invited: number;
  signupsCompleted: number;
  stillPending: number;
  errors: number;
};

// Run on a schedule (Vercel Cron) and on demand:
//   1. retries invites that failed or were left mid-flight
//   2. checks invited people and marks the ones who finished Circle signup
export async function syncOnboarding(deps: OnboardingDeps, limit = 40): Promise<SyncSummary> {
  const log = deps.log ?? console;
  const now = (deps.now ?? (() => new Date()))();
  const summary: SyncSummary = { retried: 0, invited: 0, signupsCompleted: 0, stillPending: 0, errors: 0 };

  const records = await deps.store.listForSync({
    staleLockBefore: new Date(now.getTime() - LOCK_TTL_MS).toISOString(),
    invitedSince: new Date(now.getTime() - SIGNUP_WATCH_DAYS * 86_400_000).toISOString(),
    limit,
  });

  for (const record of records) {
    if (record.status === 'failed' || record.status === 'processing') {
      summary.retried++;
      const result = await inviteToCircle(record.email, record.name, undefined, deps);
      if (['invited', 'already_invited', 'already_member'].includes(result.outcome)) summary.invited++;
      else summary.errors++;
      continue;
    }

    // status === 'invited': has the person finished signing up yet?
    if (!deps.circle) break;
    try {
      const member = await deps.circle.findMemberByEmail(record.email);
      const checkedAt = now.toISOString();
      if (member && isSignupComplete(member)) {
        await deps.store.update(record, {
          status: 'signup_completed',
          signupCompletedAt: member.profile_confirmed_at ?? checkedAt,
          lastCheckedAt: checkedAt,
        });
        summary.signupsCompleted++;
      } else if (!member) {
        // Invite was revoked or the member deleted in Circle.
        await deps.store.update(record, {
          status: 'needs_attention',
          lastError: 'Invited, but no longer found in Circle (invite revoked or member removed?)',
          lastCheckedAt: checkedAt,
        });
        summary.errors++;
      } else {
        await deps.store.update(record, { lastCheckedAt: checkedAt });
        summary.stillPending++;
      }
    } catch (err) {
      summary.errors++;
      log.error(`[onboarding] Signup check failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return summary;
}
