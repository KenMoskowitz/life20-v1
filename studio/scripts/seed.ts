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
    metaDescription: "Life 2.0 helps high-achieving leaders find where fulfillment is leaking and build a life that matches what they've built. Take the free assessment.",
    heroLede: "You mapped the business. Nobody ever handed you a map for the rest of it. The 9 Skills show you exactly where your fulfillment is leaking, so you know what to build next.",
  },
  {
    _id: 'page-about',
    _type: 'page',
    title: 'About',
    slug: { current: 'about' },
    metaTitle: 'About Laura Kelly | Life 2.0',
    metaDescription: "Laura Kelly built a business that worked and a life that didn't feel like hers. Here's how Life 2.0 and the 9 Skills came out of that gap.",
  },
  {
    _id: 'page-the-9-skills',
    _type: 'page',
    title: 'The 9 Skills',
    slug: { current: 'the-9-skills' },
    metaTitle: "The 9 Skills | Life 2.0's Framework for a Fulfilling Life",
    metaDescription: 'A research-grounded framework for the parts of life most high performers never map. Nine skills, three groups, one honest starting point.',
  },
  {
    _id: 'page-assessment',
    _type: 'page',
    title: 'Assessment',
    slug: { current: 'assessment' },
    metaTitle: 'The Overflow Assessment | Life 2.0',
    metaDescription: "Life 2.0's research-informed 9 Skills Overflow Assessment for leaders who want sustainable fulfillment. Six minutes, private, no email required to start.",
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
  clarityCallUrl: null,
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
