import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath) && !process.env.SANITY_TOKEN) {
  const match = readFileSync(envPath, 'utf8').match(/SANITY_TOKEN=(.+)/);
  if (match) process.env.SANITY_TOKEN = match[1].trim();
}

const token = process.env.SANITY_TOKEN;
if (!token) throw new Error('SANITY_TOKEN not set (see studio/.env)');

const client = createClient({
  projectId: '4keg86n3',
  dataset: 'production',
  apiVersion: '2026-01-01',
  token,
  useCdn: false,
});

// Matches the hardcoded fallback copy already shipping on the site
// (web/src/pages/*.astro). Seeding identical content so switching a page
// over to CMS-driven copy later is invisible to visitors.
const pages = [
  {
    _id: 'page-home',
    _type: 'page',
    title: 'Home',
    slug: { current: 'home' },
    metaTitle: 'Life 2.0 | Build the Life That Feels As Good As It Looks',
    metaDescription: 'You learned the skills of achievement. Nobody taught you the skills of fulfillment. The 9 Skills of Fulfillment show you where to start. Take the free assessment.',
    heroLede: 'You mapped the business. Nobody ever handed you a map for the rest of it. The 9 Skills help you see which part of your fulfillment may deserve the most attention right now, so you know where to start.',
  },
  {
    _id: 'page-about',
    _type: 'page',
    title: 'About',
    slug: { current: 'about' },
    metaTitle: 'About Laura Kelly | Life 2.0',
    metaDescription: 'Laura Kelly had a front-row seat to achievement, and noticed the people who achieved the most were not necessarily the people who felt the most fulfilled. That question became Life 2.0.',
  },
  {
    _id: 'page-the-9-skills',
    _type: 'page',
    title: 'The 9 Skills',
    slug: { current: 'the-9-skills' },
    metaTitle: 'The 9 Skills of Fulfillment | Life 2.0',
    metaDescription: 'Fulfillment is a capability, not a destination. The 9 Skills of Fulfillment are the learnable capacities that shape how you create and experience your life.',
  },
  {
    _id: 'page-assessment',
    _type: 'page',
    title: 'Assessment',
    slug: { current: 'assessment' },
    metaTitle: 'The Life 2.0 Fulfillment Assessment',
    metaDescription: 'Discover which of the 9 Skills of Fulfillment may deserve your attention right now. A reflective starting point, private by design, no email required to begin.',
  },
  {
    _id: 'page-collective',
    _type: 'page',
    title: 'The Collective',
    slug: { current: 'collective' },
    metaTitle: 'The Life 2.0 Collective | A Community for Ambitious People',
    metaDescription: 'A psychologically safe, low-performance community for people who are done performing and ready to think out loud. Join the waitlist for the Life 2.0 Collective.',
  },
  {
    _id: 'page-private-advisory',
    _type: 'page',
    title: 'Private Advisory',
    slug: { current: 'private-advisory' },
    metaTitle: 'Private Advisory | Life 2.0',
    metaDescription: 'Private, high-touch life advisory for ambitious founders and high performers. Founding client investment: $2,000/month. Apply for a Clarity Call.',
  },
];

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  clarityCallUrl: 'https://calendly.com/laura-thelaurakelly/clarity-call-with-laura',
  assessmentUrl: null,
  collectiveWaitlistUrl: null,
};

const navigation = {
  _id: 'navigation',
  _type: 'navigation',
  links: [
    { _key: 'skills', label: 'The 9 Skills', href: '/the-9-skills' },
    { _key: 'about', label: 'About', href: '/about' },
    { _key: 'collective', label: 'The Collective', href: '/collective' },
    { _key: 'advisory', label: 'Private Advisory', href: '/private-advisory' },
    { _key: 'journal', label: 'Journal', href: '/journal' },
  ],
};

const journalPosts = [
  {
    _id: 'journal-strategy-isnt-coldness',
    _type: 'journalPost',
    title: "Strategy Isn't Coldness. It's Care.",
    slug: { current: 'strategy-isnt-coldness-its-care' },
    excerpt: 'On protecting sensitivity, regulating before reacting, and keeping care available for the moments that deserve it.',
    category: 'Leadership · Emotional Steadiness',
    readTime: '4 min read',
    publishedAt: '2026-03-01T00:00:00Z',
  },
];

async function seed() {
  const docs = [siteSettings, navigation, ...pages, ...journalPosts];
  for (const doc of docs) {
    await client.createOrReplace(doc as any);
    console.log(`seeded ${doc._id}`);
  }
  console.log(`Done. ${docs.length} documents seeded.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
