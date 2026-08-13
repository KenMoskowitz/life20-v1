import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanity';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return redirect('/contact?error=missing-fields');
  }

  if (!sanityWriteClient) {
    console.error('[contact] SANITY_TOKEN not configured; submission dropped.');
    return redirect('/contact?error=unavailable');
  }

  await sanityWriteClient.create({
    _type: 'contactMessage',
    name,
    email,
    message,
    submittedAt: new Date().toISOString(),
    status: 'New',
  });

  return redirect('/contact?sent=1');
};
