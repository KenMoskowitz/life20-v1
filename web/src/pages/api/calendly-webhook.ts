import type { APIRoute } from 'astro';
import { addToKit } from '../../lib/kit';

export const prerender = false;

// Calendly calls this whenever someone books a call with Laura
// (webhook subscription for "invitee.created"). We don't trust what the
// message says: we look the booking up directly with Calendly, using the
// CALENDLY_API_TOKEN Vercel variable, and only then add the person to Kit,
// tagged "calendly" plus the type of call.

const token = import.meta.env.CALENDLY_API_TOKEN as string | undefined;
const INVITEE_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/[A-Za-z0-9-]+\/invitees\/[A-Za-z0-9-]+$/;
const EVENT_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/[A-Za-z0-9-]+$/;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

async function calendly(uri: string) {
  const res = await fetch(uri, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Calendly GET failed: ${res.status}`);
  return (await res.json()) as { resource: Record<string, any> };
}

export const POST: APIRoute = async ({ request }) => {
  if (!token) {
    console.error('[calendly-webhook] CALENDLY_API_TOKEN not set.');
    return new Response('not configured', { status: 503 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  // Only new bookings matter here.
  if (body?.event !== 'invitee.created') return new Response('ignored', { status: 200 });

  const inviteeUri = String(body?.payload?.uri ?? '');
  if (!INVITEE_URI.test(inviteeUri)) return new Response('bad invitee', { status: 400 });

  let email = '';
  let name = '';
  let eventName = '';
  try {
    const invitee = (await calendly(inviteeUri)).resource;
    email = String(invitee.email ?? '').trim();
    name = String(invitee.name ?? '').trim();
    const eventUri = String(invitee.event ?? '');
    if (EVENT_URI.test(eventUri)) {
      eventName = String((await calendly(eventUri)).resource.name ?? '');
    }
  } catch (err) {
    // Can't confirm the booking with Calendly, so don't add anyone.
    console.error('[calendly-webhook] Could not verify booking:', err);
    return new Response('unverified', { status: 401 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response('no email', { status: 200 });

  const tags = ['calendly', ...(eventName ? [`calendly-${slug(eventName)}`] : [])];
  const ok = await addToKit(email, name, tags);
  if (!ok) console.error('[calendly-webhook] Kit add failed for a booking:', tags.join(', '));

  // Always 200 once verified, so Calendly doesn't keep retrying.
  return new Response(ok ? 'ok' : 'saved-failed', { status: 200 });
};
