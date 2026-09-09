import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../lib/sanity';

export const prerender = false;

// Sanity's legacy transaction webhooks cannot be filtered by document type,
// and the GROQ-filtered kind can only be created through Sanity's own UI.
// Without a filter, every form submission (a webinar registration, a contact
// message) would trigger a full production rebuild — fine at today's volume,
// bad the moment a webinar drives a burst of signups.
//
// So the Sanity webhook points here instead of straight at the Vercel deploy
// hook. This route looks up what actually changed and only forwards the
// rebuild when it was real page content.

const CONTENT_TYPES = new Set([
  'webinar',
  'page',
  'siteSettings',
  'navigation',
  'journalPost',
  'testimonial',
]);

export const POST: APIRoute = async ({ request, url }) => {
  const expected = import.meta.env.SANITY_REBUILD_SECRET as string | undefined;
  const provided = url.searchParams.get('secret');
  if (!expected || provided !== expected) {
    // Anyone who found this URL could otherwise burn build minutes at will.
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 });
  }

  const deployHook = import.meta.env.VERCEL_DEPLOY_HOOK_URL as string | undefined;
  if (!deployHook) {
    console.error('[sanity-rebuild] VERCEL_DEPLOY_HOOK_URL not configured.');
    return new Response(JSON.stringify({ ok: false, error: 'not-configured' }), { status: 503 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), { status: 400 });
  }

  // Transaction hooks send changed document ids, not their types.
  const ids: string[] = [
    ...(payload?.ids?.created ?? []),
    ...(payload?.ids?.updated ?? []),
    ...(payload?.ids?.deleted ?? []),
  ];

  // A deleted document can't be looked up, so fall back to its id prefix,
  // which matches the ids the seed script assigns to content documents.
  const deleted: string[] = payload?.ids?.deleted ?? [];
  const deletedLooksLikeContent = deleted.some((id) =>
    /^(page-|webinar-|journal-|siteSettings|navigation|testimonial)/.test(id)
  );

  let touchedContent = deletedLooksLikeContent;

  const lookupIds = ids.filter((id) => !deleted.includes(id));
  if (!touchedContent && lookupIds.length && sanityWriteClient) {
    try {
      const types: string[] = await sanityWriteClient.fetch(
        '*[_id in $ids]._type',
        { ids: lookupIds }
      );
      touchedContent = (types ?? []).some((t) => CONTENT_TYPES.has(t));
    } catch (err) {
      // If we can't tell, rebuild. A redundant build is cheaper than a
      // content change that silently never reaches the live site.
      console.error('[sanity-rebuild] Type lookup failed, rebuilding anyway:', err);
      touchedContent = true;
    }
  }

  if (!touchedContent) {
    return new Response(JSON.stringify({ ok: true, rebuilt: false, reason: 'no content types changed' }), { status: 200 });
  }

  try {
    const res = await fetch(deployHook, { method: 'POST' });
    if (!res.ok) throw new Error(`deploy hook responded ${res.status}`);
  } catch (err) {
    console.error('[sanity-rebuild] Deploy hook failed:', err);
    return new Response(JSON.stringify({ ok: false, error: 'deploy-hook-failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true, rebuilt: true }), { status: 200 });
};
