import { createCircleClient } from './circle';
import type { OnboardingDeps } from './onboarding';
import { createSanityOnboardingStore } from './onboardingStore';
import { sanityWriteClient } from './sanity';
import { stripeClient, stripePriceIds } from './stripe';

// Wires the onboarding flow to the real services from env vars. Returns null
// (and the caller logs) when a required piece isn't configured. Circle being
// missing is not fatal: invites are recorded as failed and retried once the
// token is added.
const circleToken = import.meta.env.CIRCLE_API_TOKEN as string | undefined;

export function getOnboardingDeps(): OnboardingDeps | null {
  if (!stripeClient || !sanityWriteClient) return null;
  return {
    stripe: stripeClient,
    circle: circleToken ? createCircleClient({ token: circleToken }) : null,
    store: createSanityOnboardingStore(sanityWriteClient),
    qualifyingPriceIds: [stripePriceIds.full, stripePriceIds.installment].filter((id): id is string => Boolean(id)),
  };
}
