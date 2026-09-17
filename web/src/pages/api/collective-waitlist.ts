import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanity';

export const prerender = false;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (!name || !isValidEmail(email)) {
    return redirect('/collective?error=missing-fields#waitlist');
  }

  // Saving the signup matters more than anything else here. If Sanity is
  // unavailable we surface a real error rather than pretending it worked.
  if (!sanityWriteClient) {
    console.error('[collective-waitlist] SANITY_TOKEN not configured; signup dropped.');
    return redirect('/collective?error=unavailable#waitlist');
  }

  try {
    await sanityWriteClient.create({
      _type: 'collectiveWaitlistSignup',
      name,
      email,
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[collective-waitlist] Sanity write failed:', err);
    return redirect('/collective?error=unavailable#waitlist');
  }

  return redirect('/collective?joined=1#waitlist');
};
