import type { APIRoute } from 'astro';
import { addToKit } from '../../lib/kit';

export const prerender = false;

// thelife20.com/subscribe: joins Laura's email list. An optional ?from= on the
// page (for example from=clover) becomes a tag, so Laura can see where people
// came from.

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = clean(form.get('name'), 100);
  const email = clean(form.get('email'), 200);
  const from = clean(form.get('from'), 40).toLowerCase().replace(/[^a-z0-9-]/g, '');
  const back = from ? `/subscribe?from=${encodeURIComponent(from)}` : '/subscribe';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect(`${back}${back.includes('?') ? '&' : '?'}error=email#join`);
  }

  const ok = await addToKit(email, name, ['newsletter', ...(from ? [`from-${from}`] : [])]);
  if (!ok) return redirect(`${back}${back.includes('?') ? '&' : '?'}error=unavailable#join`);
  return redirect(`/subscribe?joined=1${from ? `&from=${encodeURIComponent(from)}` : ''}#join`);
};
