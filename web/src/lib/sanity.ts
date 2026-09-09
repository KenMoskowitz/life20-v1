import { createClient, type ClientConfig } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity project is not wired up yet (see docs/master-plan.md Section 6/12).
// Every helper below fails soft: no project configured, or a fetch error,
// returns null so pages fall back to their hardcoded copy instead of
// breaking the build. Fill in PUBLIC_SANITY_PROJECT_ID once the project exists.
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion: '2026-01-01',
  useCdn: true,
};

// Browser reads go through the CDN: cached, fast, and generous on rate limits.
export const sanityClient = projectId ? createClient(config) : null;

// Build-time reads bypass the CDN. It can still be serving the previous
// version seconds after an edit is published, so a deploy triggered right
// after a CMS change would otherwise ship a build that silently ignores it.
const buildClient = projectId ? createClient({ ...config, useCdn: false }) : null;

// Server-only write client for API routes (form submissions). Never import
// this from client-side code or a component that ships to the browser —
// the token must not end up in a client bundle.
const writeToken = import.meta.env.SANITY_TOKEN as string | undefined;
export const sanityWriteClient =
  projectId && writeToken ? createClient({ ...config, token: writeToken, useCdn: false }) : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;
export function urlFor(source: unknown) {
  return builder ? builder.image(source as never) : null;
}

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  const client = import.meta.env.SSR ? buildClient : sanityClient;
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.warn('[sanity] fetch failed, using fallback copy:', error);
    return null;
  }
}

export async function getSiteSettings() {
  return sanityFetch(`*[_type == "siteSettings"][0]`);
}

export async function getNavigation() {
  return sanityFetch(`*[_type == "navigation"][0]`);
}

export async function getPage(slug: string) {
  return sanityFetch(`*[_type == "page" && slug.current == $slug][0]`, { slug });
}

export async function getJournalPosts() {
  return sanityFetch(`*[_type == "journalPost"] | order(publishedAt desc)`);
}

export async function getJournalPost(slug: string) {
  return sanityFetch(`*[_type == "journalPost" && slug.current == $slug][0]`, { slug });
}

export async function getWebinar(slug: string) {
  return sanityFetch(`*[_type == "webinar" && slug.current == $slug][0]`, { slug });
}
