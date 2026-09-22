import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Route paths (relative to site root) always excluded from the sitemap and
// marked noindex. Keep in sync with the `noindex` prop passed to BaseLayout.
export const NOINDEX_PATHS = ['/application-received', '/assessment', '/journal'];

// Some pages are only indexable once their CMS content is real. The webinar
// landing page marks itself noindex until its status is Upcoming or Replay,
// and the sitemap has to agree — listing a noindex page tells Google two
// contradictory things. Resolved at build time so flipping the status in
// Sanity and rebuilding is all it takes to publish it.
async function cmsExcludedPaths() {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || '4keg86n3';
  const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
  const query = encodeURIComponent('*[_type == "webinar"]{ "slug": slug.current, status }');
  // Live API, not apicdn: the CDN can still serve the previous status for a
  // short window after a publish, which would put a draft page in the sitemap.
  const url = `https://${projectId}.api.sanity.io/v2026-01-01/data/query/${dataset}?query=${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const { result } = await res.json();
    return (result ?? [])
      .filter((w) => w?.slug && w.status !== 'upcoming' && w.status !== 'replay')
      .map((w) => `/${w.slug}`);
  } catch (err) {
    // Fail closed: if the status can't be read, keep the page out of the
    // sitemap rather than risk listing an unfinished event.
    console.warn('[sitemap] Could not read webinar status, excluding /blueprint:', err.message);
    return ['/blueprint'];
  }
}

const cmsExcluded = await cmsExcludedPaths();

export default defineConfig({
  site: 'https://thelife20.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) =>
        ![...NOINDEX_PATHS, ...cmsExcluded].some((path) => page.includes(path)),
    }),
  ],
});
