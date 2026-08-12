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

export const sanityClient = projectId ? createClient(config) : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;
export function urlFor(source: unknown) {
  return builder ? builder.image(source as never) : null;
}

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<T>(query, params);
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
