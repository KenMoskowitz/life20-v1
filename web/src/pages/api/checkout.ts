import type { APIRoute } from 'astro';
import { stripeClient, stripePriceIds } from '../../lib/stripe';

export const prerender = false;

const RETURN_PATH = '/access-your-next-level';

export const GET: APIRoute = async ({ url, redirect }) => {
  const plan = url.searchParams.get('plan');

  if (plan !== 'full' && plan !== 'installment') {
    return redirect(`${RETURN_PATH}?error=invalid-plan`);
  }

  const priceId = plan === 'full' ? stripePriceIds.full : stripePriceIds.installment;

  if (!stripeClient || !priceId) {
    console.error('[checkout] Stripe not configured (missing secret key or price id) for plan:', plan);
    return redirect(`${RETURN_PATH}?error=checkout-unavailable`);
  }

  const origin = url.origin;

  // Checkout Sessions can't set subscription_data.cancel_at at creation time
  // (Stripe rejects it as unknown) — the subscription doesn't exist yet to
  // cancel. The "2 payments of $850" cap to exactly two invoices is instead
  // applied by the stripe-webhook route right after Stripe confirms this
  // subscription was actually created; the metadata tag here is how that
  // webhook recognizes which subscriptions need it.
  const session = await stripeClient.checkout.sessions.create({
    mode: plan === 'full' ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${RETURN_PATH}?joined=1`,
    cancel_url: `${origin}${RETURN_PATH}?checkout=cancelled#join`,
    ...(plan === 'installment'
      ? { subscription_data: { metadata: { plan: 'installment', cycles: '2' } } }
      : {}),
  });

  if (!session.url) {
    return redirect(`${RETURN_PATH}?error=checkout-unavailable`);
  }

  return redirect(session.url);
};
