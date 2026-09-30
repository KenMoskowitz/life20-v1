import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { syncOnboarding } from '../../lib/onboarding';
import { getOnboardingDeps } from '../../lib/onboardingDeps';

export const prerender = false;

// Retries failed Circle invites and marks invited people who have finished
// Circle signup. Vercel Cron calls this daily (see vercel.json) and sends
// `Authorization: Bearer $CRON_SECRET` automatically. It can also be run by
// hand with the same header to retry right away.
const cronSecret = import.meta.env.CRON_SECRET as string | undefined;

function authorized(header: string | null) {
  if (!cronSecret || !header) return false;
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const GET: APIRoute = async ({ request }) => {
  if (!authorized(request.headers.get('authorization'))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const deps = getOnboardingDeps();
  if (!deps) {
    console.error('[circle-onboarding-sync] Onboarding not configured (Stripe or SANITY_TOKEN missing).');
    return new Response('Onboarding not configured', { status: 500 });
  }

  const summary = await syncOnboarding(deps);
  console.info('[circle-onboarding-sync]', JSON.stringify(summary));
  return Response.json(summary);
};

export const POST = GET;
