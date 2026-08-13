import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanity';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const context = String(form.get('context') ?? '').trim();

  if (!name || !email) {
    return redirect('/private-advisory?error=missing-fields#apply');
  }

  if (!sanityWriteClient) {
    console.error('[private-advisory-application] SANITY_TOKEN not configured; submission dropped.');
    return redirect('/private-advisory?error=unavailable#apply');
  }

  await sanityWriteClient.create({
    _type: 'application',
    name,
    email,
    context,
    submittedAt: new Date().toISOString(),
    status: 'New',
  });

  return redirect('/application-received');
};
