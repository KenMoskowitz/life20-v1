import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { stripeClient } from '../../lib/stripe';

export const prerender = false;

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET as string | undefined;

// Caps the "2 payments of $850" subscription at exactly two invoices.
// Checkout Sessions can't set subscription_data.cancel_at at creation time
// (the subscription doesn't exist yet), so this runs right after Stripe
// confirms the subscription was actually created and schedules its
// cancellation for +2 monthly cycles from now — Stripe bills immediately on
// checkout, again at +1 month, then cancels before a third invoice fires.
export const POST: APIRoute = async ({ request }) => {
  if (!stripeClient || !webhookSecret) {
    console.error('[stripe-webhook] Stripe or webhook secret not configured.');
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', (err as Error).message);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;

    if (subscription.metadata?.plan === 'installment' && !subscription.cancel_at) {
      const cancelAt = new Date();
      cancelAt.setMonth(cancelAt.getMonth() + 2);

      await stripeClient.subscriptions.update(subscription.id, {
        cancel_at: Math.floor(cancelAt.getTime() / 1000),
      });
    }
  }

  return new Response('ok', { status: 200 });
};
