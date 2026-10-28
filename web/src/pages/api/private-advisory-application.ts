import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanity';
import { notifyTeam } from '../../lib/notify';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const field = (key: string) => String(form.get(key) ?? '').trim();
  const context = field('context');
  const phone = field('phone');
  const work = field('work');
  const businessSize = field('businessSize');
  const focusArea = field('focusArea');
  const win = field('win');
  const investReady = field('investReady');
  const source = field('source');

  if (!name || !email || !work || !businessSize || !focusArea || !context || !win || !investReady) {
    return redirect('/private-advisory?error=missing-fields#apply');
  }

  // Alert first, so an application is never lost even if saving fails.
  await notifyTeam(`New Private Advisory application: ${name}`, [
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['What they do', work],
    ['Business size', businessSize],
    ['Area most off', focusArea],
    ["What's going on", context],
    ['A six-month win', win],
    ['Ready to invest $3,000/month', investReady],
    ['Heard about Laura via', source],
  ]);

  if (!sanityWriteClient) {
    console.error('[private-advisory-application] SANITY_TOKEN not configured; submission dropped.');
    return redirect('/private-advisory?error=unavailable#apply');
  }

  await sanityWriteClient.create({
    _type: 'application',
    name,
    email,
    context,
    phone,
    work,
    businessSize,
    focusArea,
    win,
    investReady,
    source,
    submittedAt: new Date().toISOString(),
    status: 'New',
  });

  return redirect('/application-received');
};
