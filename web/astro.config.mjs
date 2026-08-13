import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Route paths (relative to site root) excluded from the sitemap and marked noindex.
// Keep this in sync with the `noindex` prop passed to BaseLayout on each page.
export const NOINDEX_PATHS = ['/application-received'];

export default defineConfig({
  site: 'https://thelife20.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((path) => page.includes(path)),
    }),
  ],
});
