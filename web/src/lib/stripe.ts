import Stripe from 'stripe';

// Stripe is not configured until STRIPE_SECRET_KEY is set, same fail-soft
// pattern as src/lib/sanity.ts. Checkout routes check for null and redirect
// back with an error instead of throwing during build or at request time.
const secretKey = import.meta.env.STRIPE_SECRET_KEY as string | undefined;

export const stripeClient = secretKey ? new Stripe(secretKey) : null;

export const stripePriceIds = {
  full: import.meta.env.STRIPE_PRICE_FULL_ID as string | undefined,
  installment: import.meta.env.STRIPE_PRICE_INSTALLMENT_ID as string | undefined,
};
