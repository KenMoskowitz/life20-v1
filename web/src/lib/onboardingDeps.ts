import { createCircleClient } from './circle';
import { createDashboardClient } from './dashboard';
import type { OnboardingDeps } from './onboarding';
import { createSanityOnboardingStore } from './onboardingStore';
import { sanityWriteClient } from './sanity';
import { stripeClient, stripePriceIds } from './stripe';

// Wires the onboarding flow to the real services from env vars. Returns null
// (and the caller logs) when a required piece isn't configured. Circle being
// missing is not fatal: invites are recorded as failed and retried once the
// token is added.
const circleToken = import.meta.env.CIRCLE_API_TOKEN as string | undefined;
// The client dashboard (portal.thelife20.com): told about each paid checkout.
const dashboardUrl = import.meta.env.DASHBOARD_URL as string | undefined;
const purchaseSecret = import.meta.env.PURCHASE_WEBHOOK_SECRET as string | undefined;

export function getOnboardingDeps(): OnboardingDeps | null {
  if (!stripeClient || !sanityWriteClient) return null;
  return {
    stripe: stripeClient,
    circle: circleToken ? createCircleClient({ token: circleToken }) : null,
    dashboard: dashboardUrl && purchaseSecret ? createDashboardClient({ url: dashboardUrl, secret: purchaseSecret }) : null,
    store: createSanityOnboardingStore(sanityWriteClient),
    qualifyingPriceIds: [stripePriceIds.full, stripePriceIds.installment].filter((id): id is string => Boolean(id)),
  };
}
