// Run with: npm test (from web/)
// No network: Stripe is mocked, Circle's HTTP API is faked behind the real
// Circle client, and the store is in-memory with the same compare-and-set
// behavior as the Sanity store.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { createCircleClient, type CircleMember } from '../src/lib/circle.ts';
import {
  handleCheckoutEvent,
  syncOnboarding,
  type OnboardingDeps,
  type OnboardingRecord,
  type OnboardingStore,
} from '../src/lib/onboarding.ts';

const FULL = 'price_full_test';
const INSTALLMENT = 'price_installment_test';
const TOKEN = 'circle_secret_token_do_not_log';

// ---------- fakes ----------

function memoryStore() {
  const docs = new Map<string, OnboardingRecord>();
  let revCounter = 0;
  const nextRev = () => `r${++revCounter}`;
  const store: OnboardingStore & { docs: typeof docs } = {
    docs,
    async ensure(email, name) {
      if (!docs.has(email)) {
        docs.set(email, { id: email, rev: nextRev(), email, name: name ?? null, status: 'awaiting_payment', stripeSessionIds: [], attempts: 0 });
      }
      return structuredClone(docs.get(email)!);
    },
    async claim(record, fields) {
      const cur = docs.get(record.id)!;
      if (cur.rev !== record.rev) return false;
      Object.assign(cur, fields, { rev: nextRev() });
      return true;
    },
    async update(record, fields, addSessionId) {
      const cur = docs.get(record.id)!;
      Object.assign(cur, fields, { rev: nextRev() });
      if (addSessionId && !cur.stripeSessionIds.includes(addSessionId)) cur.stripeSessionIds.push(addSessionId);
    },
    async listForSync({ staleLockBefore, invitedSince, limit }) {
      return [...docs.values()]
        .filter(
          (d) =>
            d.status === 'failed' ||
            (d.status === 'processing' && (d.lockedAt ?? '') < staleLockBefore) ||
            (d.status === 'invited' && (d.invitedAt ?? '') > invitedSince),
        )
        .slice(0, limit)
        .map((d) => structuredClone(d));
    },
  };
  return store;
}

// Fake Circle Admin API v2 behind the real client.
function fakeCircle() {
  const members = new Map<string, CircleMember>();
  const calls: { method: string; path: string; body?: any; auth: string | null }[] = [];
  let nextId = 100;
  // Queue of forced responses for the next matching calls: [status, body].
  const failNext: { match: 'search' | 'invite'; status: number; body: any }[] = [];

  const fetchImpl = (async (url: string, init: RequestInit = {}) => {
    const u = new URL(url);
    const method = init.method ?? 'GET';
    const path = u.pathname.replace('/api/admin/v2', '');
    const auth = new Headers(init.headers).get('authorization');
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path, body, auth });
    const kind = path === '/community_members/search' ? 'search' : 'invite';
    const forced = failNext.findIndex((f) => f.match === kind);
    if (forced >= 0) {
      const [f] = failNext.splice(forced, 1);
      return Response.json(f.body, { status: f.status });
    }
    if (kind === 'search') {
      const m = members.get(u.searchParams.get('email')!);
      return m ? Response.json(m) : Response.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    if (members.has(body.email)) return Response.json({ success: false, message: 'Email has already been taken' }, { status: 422 });
    const m: CircleMember = { id: nextId++, email: body.email, name: body.name, profile_confirmed_at: null, active: false };
    members.set(body.email, m);
    return Response.json({ message: 'This user has been invited to the community', community_member: m }, { status: 201 });
  }) as typeof fetch;

  return {
    client: createCircleClient({ token: TOKEN, fetchImpl }),
    members,
    calls,
    failNext,
    invites: () => calls.filter((c) => c.method === 'POST'),
  };
}

type SessionOpts = { id?: string; price?: string; payment_status?: Stripe.Checkout.Session.PaymentStatus; email?: string | null; name?: string };

function fakeStripe() {
  const sessions = new Map<string, Stripe.Checkout.Session>();
  let retrieves = 0;
  return {
    get retrieves() {
      return retrieves;
    },
    put(o: SessionOpts = {}) {
      const s = {
        id: o.id ?? 'cs_test_1',
        object: 'checkout.session',
        payment_status: o.payment_status ?? 'paid',
        customer_details: { email: o.email === undefined ? 'Buyer@Example.com' : o.email, name: o.name ?? 'Jane Buyer' },
        customer_email: null,
        line_items: { data: [{ price: { id: o.price ?? FULL } }] },
      } as unknown as Stripe.Checkout.Session;
      sessions.set(s.id, s);
      return s;
    },
    client: {
      checkout: {
        sessions: {
          async retrieve(id: string) {
            retrieves++;
            const s = sessions.get(id);
            if (!s) throw new Error('No such checkout session');
            return structuredClone(s);
          },
        },
      },
    },
  };
}

function event(type: string, sessionId = 'cs_test_1', id = `evt_${Math.random()}`) {
  return { id, type, data: { object: { id: sessionId } } } as unknown as Stripe.Event;
}

function setup(opts: { circle?: boolean } = {}) {
  const store = memoryStore();
  const circle = fakeCircle();
  const stripe = fakeStripe();
  const logs: string[] = [];
  let clock = new Date('2026-09-29T12:00:00Z');
  const log = { info: (...a: unknown[]) => logs.push(a.join(' ')), warn: (...a: unknown[]) => logs.push(a.join(' ')), error: (...a: unknown[]) => logs.push(a.join(' ')) };
  const deps: OnboardingDeps = {
    stripe: stripe.client,
    circle: opts.circle === false ? null : circle.client,
    store,
    qualifyingPriceIds: [FULL, INSTALLMENT],
    now: () => clock,
    log,
  };
  return { store, circle, stripe, deps, logs, advance: (ms: number) => (clock = new Date(clock.getTime() + ms)) };
}

const EMAIL = 'buyer@example.com';

// ---------- tests ----------

test('successful payment invites the buyer once, with Circle invitation email on', async () => {
  const t = setup();
  t.stripe.put();
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'invited');
  assert.equal(r.retry, false);
  const invites = t.circle.invites();
  assert.equal(invites.length, 1);
  assert.deepEqual(invites[0].body, { email: EMAIL, name: 'Jane Buyer', skip_invitation: false });
  assert.equal(invites[0].auth, `Bearer ${TOKEN}`);
  const rec = t.store.docs.get(EMAIL)!;
  assert.equal(rec.status, 'invited');
  assert.equal(rec.inviteSource, 'website');
  assert.equal(rec.signupCompletedAt, null, 'invited is not signed up');
  assert.deepEqual(rec.stripeSessionIds, ['cs_test_1']);
});

test('installment (subscription) checkout also qualifies', async () => {
  const t = setup();
  t.stripe.put({ price: INSTALLMENT });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'invited');
});

test('unrelated purchase is ignored: no record, no Circle calls', async () => {
  const t = setup();
  t.stripe.put({ price: 'price_some_other_product' });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'ignored_unrelated');
  assert.equal(t.store.docs.size, 0);
  assert.equal(t.circle.calls.length, 0);
});

test('subscription renewal and other events are ignored without touching Stripe or Circle', async () => {
  const t = setup();
  for (const type of ['invoice.paid', 'invoice.payment_succeeded', 'customer.subscription.updated', 'payment_intent.succeeded']) {
    const r = await handleCheckoutEvent(event(type), t.deps);
    assert.equal(r.outcome, 'ignored_event');
  }
  assert.equal(t.stripe.retrieves, 0);
  assert.equal(t.circle.calls.length, 0);
});

test('pending delayed payment waits, then invites when the payment clears', async () => {
  const t = setup();
  t.stripe.put({ payment_status: 'unpaid' });
  const r1 = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r1.outcome, 'awaiting_payment');
  assert.equal(t.circle.calls.length, 0);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'awaiting_payment');

  t.stripe.put({ payment_status: 'paid' });
  const r2 = await handleCheckoutEvent(event('checkout.session.async_payment_succeeded'), t.deps);
  assert.equal(r2.outcome, 'invited');
  assert.equal(t.circle.invites().length, 1);
});

test('failed delayed payment never invites', async () => {
  const t = setup();
  t.stripe.put({ payment_status: 'unpaid' });
  await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  const r = await handleCheckoutEvent(event('checkout.session.async_payment_failed'), t.deps);
  assert.equal(r.outcome, 'payment_failed');
  assert.equal(t.store.docs.get(EMAIL)!.status, 'payment_failed');
  assert.equal(t.circle.calls.length, 0);
  // The daily sync must not pick it up either.
  await syncOnboarding(t.deps);
  assert.equal(t.circle.calls.length, 0);
});

test('stale event payload is not trusted: session is re-read from Stripe', async () => {
  const t = setup();
  // Event says completed, but Stripe says still unpaid.
  t.stripe.put({ payment_status: 'unpaid' });
  const r = await handleCheckoutEvent(event('checkout.session.async_payment_succeeded'), t.deps);
  assert.equal(r.outcome, 'awaiting_payment');
  assert.equal(t.circle.calls.length, 0);
});

test('duplicate webhook delivery does not re-invite', async () => {
  const t = setup();
  t.stripe.put();
  const e = event('checkout.session.completed', 'cs_test_1', 'evt_same');
  await handleCheckoutEvent(e, t.deps);
  const callsAfterFirst = t.circle.calls.length;
  const r2 = await handleCheckoutEvent(e, t.deps);
  const r3 = await handleCheckoutEvent(e, t.deps);
  assert.equal(r2.outcome, 'already_onboarded');
  assert.equal(r3.outcome, 'already_onboarded');
  assert.equal(t.circle.calls.length, callsAfterFirst, 'no Circle calls on replays');
  assert.equal(t.circle.invites().length, 1);
});

test('concurrent deliveries of the same event invite exactly once', async () => {
  const t = setup();
  t.stripe.put();
  const e = event('checkout.session.completed');
  const results = await Promise.all([1, 2, 3, 4].map(() => handleCheckoutEvent(e, t.deps)));
  assert.equal(t.circle.invites().length, 1);
  assert.equal(results.filter((r) => r.outcome === 'invited').length, 1);
  assert.ok(results.every((r) => ['invited', 'in_progress', 'already_onboarded'].includes(r.outcome)));
  assert.ok(results.every((r) => !r.retry));
});

test('second purchase by the same person (any email casing) does not re-invite', async () => {
  const t = setup();
  t.stripe.put({ id: 'cs_a', email: 'buyer@example.com' });
  t.stripe.put({ id: 'cs_b', email: '  BUYER@example.COM ', price: INSTALLMENT });
  await handleCheckoutEvent(event('checkout.session.completed', 'cs_a'), t.deps);
  const r = await handleCheckoutEvent(event('checkout.session.completed', 'cs_b'), t.deps);
  assert.equal(r.outcome, 'already_onboarded');
  assert.equal(t.circle.invites().length, 1);
  assert.deepEqual(t.store.docs.get(EMAIL)!.stripeSessionIds, ['cs_a', 'cs_b']);
});

test('existing community member is not invited again', async () => {
  const t = setup();
  t.circle.members.set(EMAIL, { id: 7, email: EMAIL, profile_confirmed_at: '2026-01-01T00:00:00Z', active: true });
  t.stripe.put();
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'already_member');
  assert.equal(t.circle.invites().length, 0);
  const rec = t.store.docs.get(EMAIL)!;
  assert.equal(rec.status, 'signup_completed');
  assert.equal(rec.inviteSource, 'existing');
  assert.equal(rec.circleMemberId, 7);
});

test('person with a pending Circle invitation is not invited again', async () => {
  const t = setup();
  t.circle.members.set(EMAIL, { id: 8, email: EMAIL, profile_confirmed_at: null, active: false });
  t.stripe.put();
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'already_invited');
  assert.equal(t.circle.invites().length, 0);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');
});

test('Circle outage: payment untouched, record marked failed, Stripe redelivery succeeds', async () => {
  const t = setup();
  t.stripe.put();
  t.circle.failNext.push({ match: 'search', status: 503, body: { message: 'Service unavailable' } });
  const e = event('checkout.session.completed');
  const r1 = await handleCheckoutEvent(e, t.deps);
  assert.equal(r1.outcome, 'circle_failed');
  assert.equal(r1.retry, true, 'webhook should return non-2xx so Stripe retries');
  const rec = t.store.docs.get(EMAIL)!;
  assert.equal(rec.status, 'failed');
  assert.match(rec.lastError!, /503/);
  assert.equal(rec.lockedAt, null);

  const r2 = await handleCheckoutEvent(e, t.deps);
  assert.equal(r2.outcome, 'invited');
  assert.equal(t.circle.invites().length, 1);
  assert.equal(t.store.docs.get(EMAIL)!.attempts, 2);
});

test('failed invite is retried by the scheduled sync', async () => {
  const t = setup();
  t.stripe.put();
  t.circle.failNext.push({ match: 'invite', status: 500, body: {} });
  await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'failed');
  const summary = await syncOnboarding(t.deps);
  assert.equal(summary.retried, 1);
  assert.equal(summary.invited, 1);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');
  assert.equal(t.circle.invites().length, 2, 'one failed attempt + one successful');
});

test('rate limit (429) and Circle daily member cap (403) are retryable', async () => {
  for (const [status, message] of [[429, 'Too many requests'], [403, 'Daily member limit exceeded.']] as const) {
    const t = setup();
    t.stripe.put();
    t.circle.failNext.push({ match: 'invite', status, body: { success: false, errors: message } });
    const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
    assert.equal(r.outcome, 'circle_failed', `status ${status}`);
    assert.equal(r.retry, true);
  }
});

test('permanent Circle rejection is flagged for a person, not retried forever', async () => {
  const t = setup();
  t.stripe.put();
  t.circle.failNext.push({ match: 'invite', status: 422, body: { success: false, message: 'Invalid email address.' } });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'circle_rejected');
  assert.equal(r.retry, false);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'needs_attention');
  await syncOnboarding(t.deps);
  assert.equal(t.circle.invites().length, 1, 'sync does not retry needs_attention');
});

test('wrong plan / bad token (403) is not retried', async () => {
  const t = setup();
  t.stripe.put();
  t.circle.failNext.push({ match: 'search', status: 403, body: { success: false, message: 'The community is not eligible for admin API v2 access.' } });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'circle_rejected');
  assert.match(t.store.docs.get(EMAIL)!.lastError!, /not eligible/);
});

test('invite race: 422 because they were just added counts as already invited', async () => {
  const t = setup();
  t.stripe.put();
  // Search says not found, but someone adds them before our POST lands.
  t.circle.failNext.push({ match: 'search', status: 404, body: {} });
  t.circle.members.set(EMAIL, { id: 9, email: EMAIL, profile_confirmed_at: null });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'already_invited');
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');
});

test('missing Circle token: recorded as failed and retried once configured', async () => {
  const t = setup({ circle: false });
  t.stripe.put();
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'circle_not_configured');
  assert.equal(r.retry, true);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'failed');
  t.deps.circle = t.circle.client;
  await syncOnboarding(t.deps);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');
});

test('crashed attempt (stuck in processing) is recovered after the lock expires', async () => {
  const t = setup();
  t.stripe.put();
  // Simulate a function that claimed the record, then died.
  const rec = await t.store.ensure(EMAIL, 'Jane Buyer');
  await t.store.claim(rec, { status: 'processing', lockedAt: new Date('2026-09-29T12:00:00Z').toISOString(), attempts: 1 });

  const r1 = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r1.outcome, 'in_progress', 'fresh lock is respected');
  assert.equal(t.circle.calls.length, 0);

  t.advance(3 * 60 * 1000);
  const summary = await syncOnboarding(t.deps);
  assert.equal(summary.retried, 1);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');
});

test('sync marks signup completed only once the person finishes Circle signup', async () => {
  const t = setup();
  t.stripe.put();
  await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  t.advance(60_000);

  let s = await syncOnboarding(t.deps);
  assert.equal(s.stillPending, 1);
  assert.equal(t.store.docs.get(EMAIL)!.status, 'invited');

  t.circle.members.get(EMAIL)!.profile_confirmed_at = '2026-09-30T09:00:00Z';
  s = await syncOnboarding(t.deps);
  assert.equal(s.signupsCompleted, 1);
  const rec = t.store.docs.get(EMAIL)!;
  assert.equal(rec.status, 'signup_completed');
  assert.equal(rec.signupCompletedAt, '2026-09-30T09:00:00Z');

  // Completed records drop out of the sync (saves Circle API quota).
  const calls = t.circle.calls.length;
  await syncOnboarding(t.deps);
  assert.equal(t.circle.calls.length, calls);
  assert.equal(t.circle.invites().length, 1, 'sync never re-invites');
});

test('sync stops watching invites after 45 days', async () => {
  const t = setup();
  t.stripe.put();
  await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  t.advance(46 * 86_400_000);
  const calls = t.circle.calls.length;
  await syncOnboarding(t.deps);
  assert.equal(t.circle.calls.length, calls);
});

test('checkout without an email is logged and skipped', async () => {
  const t = setup();
  t.stripe.put({ email: null });
  const r = await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  assert.equal(r.outcome, 'no_email');
  assert.equal(t.circle.calls.length, 0);
});

test('Circle token never appears in records or logs', async () => {
  const t = setup();
  t.stripe.put();
  t.circle.failNext.push({ match: 'invite', status: 500, body: { message: 'boom' } });
  await handleCheckoutEvent(event('checkout.session.completed'), t.deps);
  await syncOnboarding(t.deps);
  const everything = JSON.stringify([...t.store.docs.values()]) + t.logs.join('\n');
  assert.ok(!everything.includes(TOKEN));
  assert.ok(!t.logs.join('\n').includes(EMAIL), 'emails stay out of logs');
});

test('Stripe signature: verified against the raw body, tampering rejected', () => {
  const stripe = new Stripe('sk_test_unused');
  const secret = 'whsec_test_secret';
  const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_test_1' } } });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });

  const ok = stripe.webhooks.constructEvent(payload, header, secret);
  assert.equal(ok.type, 'checkout.session.completed');

  // Re-serialized JSON (what a parsed-then-stringified body looks like) fails.
  const reserialized = JSON.stringify(JSON.parse(payload), null, 2);
  assert.throws(() => stripe.webhooks.constructEvent(reserialized, header, secret));
  assert.throws(() => stripe.webhooks.constructEvent(payload.replace('cs_test_1', 'cs_evil'), header, secret));
  assert.throws(() => stripe.webhooks.constructEvent(payload, header, 'whsec_wrong'));
  assert.throws(() => stripe.webhooks.constructEvent(payload, '', secret));
});
