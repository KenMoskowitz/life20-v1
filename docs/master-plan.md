# Life 2.0 — Website Master Plan
Prepared for Laura Kelly, Life 2.0 Ventures LLC. Ready for execution in `/web-dev-step-2-project-startup`.

---

## 1. Business Snapshot

**Business name:** Life 2.0 (Life 2.0 Ventures LLC, Arizona, formed May 13, 2026)
**Founder:** Laura Kelly
**Category:** Personal development, coaching, education, media, and community brand (NAICS 611430, Professional and Management Development Training)
**Domain:** thelife20.com
**Audience:** High-achieving business owners and leaders who look successful from the outside and privately feel disconnected, reactive, or like something is still missing
**Core promise:** A practical map for the parts of life high performers usually haven't mapped with the same rigor as their business
**Positioning line:** "Accomplishment got you here. Fulfillment is what's missing."
**Hero line:** "Build the life that feels as good as it looks."
**Brand posture:** Meaningful but light. Psychologically informed without feeling clinical. Warm, candid, funny where it fits, never preachy or guru-like.
**Voice:** Warm and inclusive, "we" language over "you" language, plain sentences a twelve-year-old could follow, research-backed but delivered through story and feeling, ends on encouragement rather than a hard question.
**Words to avoid:** delve, crucial/pivotal, tapestry/foundational, robust/seamless/landscape/realm, stacked adverbs, "here's the thing," "hope this helps," em dashes anywhere.
**Offers (current commercial pillars):**
- The 9 Variables Assessment (free, the entry point to everything else)
- Clarity Call, a 60-minute paid conversation, entry point into 1:1
- Private Advisory, premium founder-led 1:1 work
- The Life 2.0 Collective, a recurring paid community, ~$100/month, still pre-launch
- The Journal, founder-led content (essays now, podcast and book planned)
**Legal notes:** Never fabricate a review count, press mention, or client number that isn't verifiably real. Several offer details (final 1:1 price and structure, Collective launch date) are marked "Open Decision" below and must not be presented as locked in copy.

---

## 2. Site Audit (what exists today)

The current build lives in the `life20-v1` repo. Findings:

| Area | Status | Notes |
|---|---|---|
| Homepage (`index.html`) | **REWRITE** | Strong copywriting bones, but the whole system is dark-hero-dominant, heavy, and reads closer to a private-equity fund than a personal brand. Doesn't match the light, human direction. |
| Duplicate homepage (`life20-website.html`) | **GAP** | A second, different homepage draft sitting in the same repo with a different structure. Two homepages competing for the same URL is exactly the kind of mess to retire, not migrate. |
| Assessment, build 1 (`assessment-diagnosis/`) | **GAP** | A local build of the Overflow Assessment, same title and meta description as the Manus build below. Duplicate implementation of the same tool. |
| Assessment, build 2 (`overflow-assessment/`) | **KEEP, integrate** | This is the live version, already deployed at `lifeoverflow-orhutjru.manus.space` and confirmed working. This is the canonical assessment going forward. |
| `next-level/` | **GAP** | A six-month 1:1 offer page. |
| `private-advisory/` | **GAP** | A twelve-month 1:1 offer page. Two different premium 1:1 offers, two different lengths, no page linking them together or explaining which is current. This is an unresolved product decision leaking into the site, not a content problem. |
| `application-received/` | **KEEP, redesign** | Confirmation page after a Private Advisory application. Content is fine, needs the new visual system. |
| `blog/` (Journal) + one post | **KEEP, redesign** | Structure works. Visual system needs to match the rebuild. |
| `form-embed.html` | **KEEP** | Embed snippet, functional utility, carry forward. |
| The 9 Variables framework | **MISSING** | Referenced constantly across the brand bible and the Manus assessment, but there is no standalone page that explains the framework itself outside the assessment flow. This is the intellectual spine of the whole brand and it doesn't have a home. |
| The Life 2.0 Collective | **MISSING** | One of two named commercial pillars in the brand bible. Zero presence on the current site. |
| About / founder story | **MISSING as a standalone page** | Founder story currently lives only inside homepage copy, nowhere a search engine or a skimming visitor can land on directly. |
| Contact | **MISSING** | No general contact page independent of the advisory application flow. |
| Privacy Policy | **MISSING** | Not present anywhere in the current build. |
| Technical | **GAP** | Google Fonts loaded but no visible GTM/GA4 container in the source. No sitemap.xml or robots.txt found in the zip. Treat as not yet configured, confirm with Laura before launch. |

**The honest read:** the copywriting instincts on this site are good. The mess Ken flagged is structural: two homepages, two assessment builds, and two different premium offers, all live at once with nothing pointing a visitor to the right one. That's the first thing this rebuild fixes, before a single pixel changes.

---

## 3. Sitemap

Personal brand, not a local or multi-location business, so no service-area or city pages apply.

| Page | Slug | Status |
|---|---|---|
| Home | `/` | REWRITE |
| About Laura | `/about` | NEW |
| The 9 Variables | `/the-9-variables` | NEW |
| The Assessment | `/assessment` | REWRITE (consolidates both existing builds) |
| The Life 2.0 Collective | `/collective` | NEW |
| Private Advisory | `/private-advisory` | REWRITE (consolidates `next-level` + `private-advisory`) |
| Application Received | `/application-received` | KEEP, redesign |
| The Journal (blog hub) | `/journal` | KEEP, redesign |
| Journal post | `/journal/[slug]` | KEEP pattern |
| Contact | `/contact` | NEW |
| Privacy Policy | `/privacy-policy` | NEW |

Clean, flat URLs throughout, no nesting beyond `/journal/[slug]`.

---

## 4. Visual Design Direction

### The brief, restated
Light and airy. Open, breathing, full of life. Not corporate. Personal and professional at once. Human. Referenced: melrobbins.com, bridge509.qodeinteractive.com, sahilbloom.com, drjulie.uk.

### What those references actually offer (not just vibes)
- **melrobbins.com**: founder's face is the whole hero, huge warm portrait, trust signals (podcast rank, book rank) stated plainly and immediately, newsletter capture treated as a primary action, not an afterthought.
- **sahilbloom.com**: oversized, confident type doing most of the design work, enormous negative space, a personal brand that doesn't lean on cards or icons to look credible.
- **bridge509.qodeinteractive.com**: asymmetric editorial grid, full-bleed photography blocks offset against text columns, magazine pacing rather than stacked rectangles.
- **drjulie.uk**: a licensed practitioner's brand that stays warm and approachable without going soft or generic, press mentions and book credentials doing quiet trust-building work.

### The decision: keep the identity, change the application
The current Life 2.0 identity (dark hunter green, gold, the intertwined-circle mark, Playfair Display) already has real equity: it's in the logo files, the one-sheeter direction in the brand bible, and Laura's own visual instincts. The fix isn't a rebrand. It's flipping which color carries the page. Right now dark green is the canvas and everything sits on top of it, heavy, corporate, boardroom. The new site makes warm cream the canvas, and lets the forest green and gold appear as accents, small badges, and one deliberate dark section (the 9 Variables framework block), instead of the whole page.

### Color (named, not just hex)
- `--paper` `#FBF7EF`, the main canvas. Warm, not sterile white.
- `--paper-warm` `#F5EFE2`, used for soft section breaks (footer CTA band).
- `--forest` `#1D2E22`, reserved for headline text, the nav wordmark, and one full dark section (the 9 Variables block) where the brand's depth still needs to show up.
- `--gold` `#C79A56`, the single accent color. Used sparingly: eyebrows, one word per headline, the assessment CTA.
- `--sage` `#8A9A7C`, quiet secondary, small labels only.
- `--ink` / `--ink-soft`, body copy in warm near-black and warm gray, never pure black.

This is a direct, deliberate answer to the "not corporate" brief: corporate sites use gray and blue on white. This uses warm cream, forest, and gold, on purpose, because those are already Laura's colors, just rebalanced.

### Type
- Display: **Playfair Display** (kept from the existing identity, it's already doing the "premium, editorial" job the brand bible asks for)
- Body: **Inter**, replacing the previous Manrope. Slightly warmer, extremely legible at the larger, airier sizes this direction calls for.
- Utility/labels: **DM Mono**, small, tracked, uppercase, used only for eyebrows and nav labels, the one structural device carried over from the old system because it still works.

### Layout rhythm
Asymmetric, editorial, generous whitespace between sections (110-130px). Full-bleed photography blocks offset against text, the way Bridge509 and Sahil Bloom both use image and text as two different rhythms on the same page rather than one repeating card template. No drop shadows beyond soft, low-opacity elevation on the hero photo. Rounded corners throughout (18-40px), never a hard rectangle, because hard edges read corporate and this brand explicitly doesn't want that.

### Imagery
Real photography of Laura only, no stock. The Pics folder has 45 usable images: natural light, forest green wardrobe already matching the palette, genuine expressions. No illustration, no icon-heavy decoration. The one recurring graphic device is the brand's own triskele mark, used small and quiet as a section signature, never as filler.

### The signature element
The **three-groups-of-three** structure of the 9 Variables already exists in Laura's own research documents (Who You Are / How You Connect / What Fuels You) and visually echoes the logo's own three-spiral mark. The homepage and the `/the-9-variables` page both use this as the one deliberately bold moment: three cards, one per group, inside the single dark forest section on the page. Everywhere else stays quiet so this section is the thing people remember.

### Rendered mockup
Built as a full standalone HTML file (not the chat-only visualizer) so the real fonts, real photography, and full page length are visible exactly as they'll render: **`life20-homepage-mockup.html`**, included alongside this plan. Covers the nav, hero, phrase band, 9 Variables section, founder strip, pull-quote, and closing CTA.

### Known asset gap
Every logo file provided (`logo_horizontal_dark`, `logo_stacked_dark`, `stripe_icon_v2`, `collective_icon`) is built for a **dark background only** (gold and cream ink on forest green). On the new light-canvas site, none of them drop in directly. The mockup solves this by setting the wordmark in text (Playfair Display, forest green, no image file) in the nav, which works fine at that size. But the mark itself (the three-spiral icon) still needs a light-background version, forest green or gold ink on transparent, for the favicon, the `/collective` badge, and social share images. **Action for Laura or her designer:** export one light-background version of the mark before launch.

---

## 5. Tech Stack Architecture

Stack: **Astro + Sanity CMS + Vercel + GitHub**, per the standard series default, executed in Step 2.

### Repository file tree
```
life20-v1/
├── astro.config.mjs
├── package.json
├── vercel.json
├── sanity/
│   ├── sanity.config.ts
│   └── schemas/
│       ├── journalPost.ts
│       ├── testimonial.ts
│       └── siteSettings.ts
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── assets/
│       ├── laura-hero.jpg
│       ├── laura-teaching.jpg
│       ├── laura-closeup.jpg
│       ├── laura-kitchen.jpg
│       └── life20-mark-light.svg   (new asset, see Section 4 gap note)
└── src/
    ├── layouts/
    │   └── BaseLayout.astro
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── Hero.astro
    │   ├── NineVariablesGrid.astro
    │   ├── QuotePanel.astro
    │   └── CtaBand.astro
    └── pages/
        ├── index.astro
        ├── about.astro
        ├── the-9-variables.astro
        ├── assessment.astro
        ├── collective.astro
        ├── private-advisory.astro
        ├── application-received.astro
        ├── contact.astro
        ├── privacy-policy.astro
        └── journal/
            ├── index.astro
            └── [slug].astro
```

### Astro dynamic routing
`src/pages/journal/[slug].astro` pulls from the Sanity `journalPost` collection at build time. Adding a new post in Sanity triggers a Vercel rebuild and is live within minutes.

### Astro config
Standard config, `output: 'static'`, `@astrojs/sitemap` integration enabled for automatic sitemap.xml generation (currently missing entirely, see Section 2).

### The assessment embed
`overflow-assessment/` is a separate Vite/React build (confirmed from the uploaded source), not an Astro page. Two integration options for Step 2 to choose between:
1. **Iframe embed** on `/assessment`, pointing at the existing Manus-hosted deployment. Fastest to ship, keeps the assessment's own build pipeline independent.
2. **Native port** into the Astro site as a React island, if Laura wants the assessment fully on her own domain long-term rather than iframed from Manus.
Recommend option 1 for launch, option 2 as a fast-follow once the rest of the site is live.

---

## 6. Sanity CMS Schema

```js
// schemas/journalPost.ts
export default {
  name: 'journalPost',
  title: 'Journal Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: R => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: R => R.required() },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 },
    { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] },
    { name: 'publishedAt', title: 'Published at', type: 'datetime' },
    { name: 'metaTitle', title: 'Meta title', type: 'string' },
    { name: 'metaDescription', title: 'Meta description', type: 'text', rows: 2 },
  ],
}

// schemas/testimonial.ts
export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    { name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: R => R.required() },
    { name: 'attribution', title: 'Attribution', type: 'string' },
    { name: 'context', title: 'Context (e.g. Private Advisory client)', type: 'string' },
  ],
}

// schemas/siteSettings.ts
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'clarityCallUrl', title: 'Clarity Call booking URL', type: 'url' },
    { name: 'assessmentUrl', title: 'Assessment URL (Manus or native)', type: 'url' },
    { name: 'collectiveWaitlistUrl', title: 'Collective waitlist form URL', type: 'url' },
  ],
}
```

`siteSettings` exists so Laura can update the Clarity Call link, the assessment link, and the Collective waitlist link herself in Sanity without a code change, since all three are explicitly still in flux per the brand bible's Open Decisions.

---

## 7. vercel.json Redirect Map

```json
{
  "redirects": [
    { "source": "/next-level", "destination": "/private-advisory", "permanent": true },
    { "source": "/next-level/:path*", "destination": "/private-advisory", "permanent": true },
    { "source": "/assessment-diagnosis", "destination": "/assessment", "permanent": true },
    { "source": "/assessment-diagnosis/:path*", "destination": "/assessment", "permanent": true },
    { "source": "/life20-website", "destination": "/", "permanent": true }
  ]
}
```

`life20-website.html` and `assessment-diagnosis/` were never a separate indexed URL structure as far as this plan can confirm (both look like local drafts, not deployed pages), so these redirects are a safety net in case either was ever pushed live, not a confirmed SEO-loss scenario.

---

## 8. Global Schema JSON

Personal brand, most specific applicable type is `Person` for Laura plus `Organization` for the LLC, not `LocalBusiness` (no public address, not a walk-in business).

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Laura Kelly",
  "url": "https://thelife20.com",
  "jobTitle": "Founder, Life 2.0",
  "worksFor": {
    "@type": "Organization",
    "name": "Life 2.0 Ventures LLC",
    "url": "https://thelife20.com"
  },
  "sameAs": []
}
```

`sameAs` (social profile URLs) left empty, fill in with real, live handles only, never fabricated.

**FAQPage schema**: add to `/the-9-variables` and `/assessment` once real FAQ copy is finalized with Laura (see Section 9, FAQs are drafted but should be confirmed before this goes live).

**BreadcrumbList**: add to every non-homepage page per standard practice.

---

## 9. SEO Preservation Requirements

- No GTM container ID found in the current source. Confirm with Laura whether one exists before launch; if not, this is a new setup, not a preservation task.
- No GA4 measurement ID found. Same as above.
- No Facebook pixel found.
- Image filenames: preserve descriptive naming (`laura-hero.jpg` etc.) since Google indexes alt text and filenames together.
- No existing sitemap.xml or robots.txt found in the source zip. Both are new builds via `@astrojs/sitemap`, not a preservation task.
- Favicon: needs the new light-background mark (see Section 4 gap note) before this can ship correctly.

---

## 10. Complete Copy, All Pages

### 10.1 Home (`/`)

**Title tag:** Life 2.0 | Build the Life That Feels As Good As It Looks
**Meta description:** Life 2.0 helps high-achieving leaders find where fulfillment is leaking and build a life that matches what they've built. Take the free assessment.
**H1:** Build the life that feels as good as it looks.

**Hero copy:**
You mapped the business. Nobody ever handed you a map for the rest of it. The 9 Variables show you exactly where your fulfillment is leaking, so you know what to build next.

CTA 1 (primary): Take the free assessment
CTA 2 (text link): Meet Laura

**Phrase band:**
Accomplishment got you here. Fulfillment is what's missing.

**The 9 Variables section (H2):** Nine variables. Three groups. One honest look at your life.
Sub-copy: A research-grounded self-assessment, not a personality quiz. Score each one honestly and your lowest score becomes your starting point, not your diagnosis.

Three groups, exactly as Laura's own research doc frames them:
- **Who you are**: Purpose & Meaning, Identity & Autonomy, Character & Virtue
- **How you connect**: Relationships, Contribution, Presence & Aliveness
- **What fuels you**: Growth & Challenge, Physical Vitality, Financial Security

**Founder section (H2):** I spent four years asleep at the wheel of a life that looked perfect on paper.
Body: The business worked. The house, the trips, the title, all of it worked. What I hadn't built was a way to actually feel it. Life 2.0 is the map I wish someone had handed me, built from research and tested on myself first.

**Pull quote:** "An empty cup isn't failure. It's information. Fill your cup, then let it spill."

**Closing CTA (H2):** Find out where your fulfillment is leaking.
Body: Six minutes. Nine variables. One honest, research-backed starting point for whatever you build next.
CTA: Take the free assessment

**Internal links from Home:** `/the-9-variables`, `/assessment`, `/about`, `/private-advisory`, `/collective`

---

### 10.2 About Laura (`/about`)

**Title tag:** About Laura Kelly | Life 2.0
**Meta description:** Laura Kelly built a business that worked and a life that didn't feel like hers. Here's how Life 2.0 and the 9 Variables came out of that gap.
**H1:** I will become the person who figures it out.

**Opening (PAS-adjacent, founder-led, not a resume):**
For four years I ran on adrenaline instead of purpose. From the outside, everything worked. The business, the house, the version of success everyone could see. Inside, I was reactive more than I was present, and proud of the wrong things.

That gap between how a life looks and how it actually feels is the whole reason Life 2.0 exists.

**H2: The nine variables didn't come from a whiteboard.**
They came from asking a harder question than "how's business." Purpose. Relationships. Identity. Growth. Physical vitality. Financial security. Contribution. Presence. Character. Nine parts of a life that high performers usually leave unmapped, because nobody ever asked them to map it the way they map a P&L.

**H2: I'm not a perfected guru. I'm a fellow practitioner.**
I still ask myself, most days, "how can I create even more ease and peace in my life right now." I'm still learning to respond instead of react. I'm still building the habit of one full hour of undistracted time with my kids. Life 2.0 works best when I'm honest about being in it with you, not standing outside it, pointing.

**H2: What I actually believe**
- You do not have to stop being ambitious to become fulfilled.
- A life can look exceptional and still leak fulfillment.
- Awareness comes before change.
- The goal isn't perfect emotional regulation. It's responding in ways that, for the most part, make you proud.
- High performers often know how to optimize a business better than they know how to design a life.

**CTA:** Take the free assessment / Book a Clarity Call

**Internal links:** `/the-9-variables`, `/assessment`, `/private-advisory`

---

### 10.3 The 9 Variables (`/the-9-variables`)

**Title tag:** The 9 Variables | Life 2.0's Framework for a Fulfilling Life
**Meta description:** A research-grounded framework for the parts of life most high performers never map. Nine variables, three groups, one honest starting point.
**H1:** The map for everything the business side never covers.

**Intro:**
Most high performers have the business side mapped. Revenue, systems, growth targets, all of it tracked with real rigor. The 9 Variables are the same rigor, aimed at the rest of your life.

Each one is scored honestly, one to ten. Whichever one scores lowest is where your life is leaking fulfillment, and it's the highest-leverage place to start. This isn't a diagnosis. It's a starting point.

**Who you are**
- *Purpose & Meaning*: Whether you know what you're oriented toward, not just what you're achieving. Grounded in Carol Ryff's research on psychological well-being (1989), which found a clear sense of direction predicts long-term wellbeing better than a good mood does.
- *Identity & Autonomy*: Whether you're living a life you authored or one you inherited. Self-Determination Theory (Deci & Ryan) found that acting from genuine choice predicts better wellbeing than acting from obligation, even when the behavior looks identical from the outside.
- *Character & Virtue*: Acting in line with your values under pressure. Included as a core domain in Harvard's Human Flourishing Program, research (Weziak-Bialowolska et al., 2022) that treats traits like honesty and self-control as measurable predictors of a flourishing life.

**How you connect**
- *Relationships*: The Harvard Study of Adult Development, running over 80 years, found relationship quality was the single strongest predictor of long-term health and happiness, ahead of wealth, fame, or career success.
- *Contribution*: Erikson's research on adult development identified generativity, contributing to something beyond yourself, as central to a mature life. Separate research (Moll et al., 2006) found giving activates the same reward circuits in the brain as receiving.
- *Presence & Aliveness*: Whether you're actually experiencing your life as it happens. A widely cited Harvard study (Killingsworth & Gilbert, 2010) found people are less happy when their mind wanders, even to pleasant things, than when they're fully engaged in whatever they're doing.

**What fuels you**
- *Growth & Challenge*: Real engagement with difficulty, in service of getting better. Csikszentmihalyi's flow research found people do their best, most satisfying work at the edge of their skill against real challenge, not in comfort.
- *Physical Vitality*: The body as the foundation for everything else. Exercise research links physical activity to measurable improvements in mood and a lower risk of depression, not as a separate wellness category but as the base layer for emotional regulation and clear thinking.
- *Financial Security*: Not a number. The relationship between money, freedom, and background stress. Research published in Science (Mani et al., 2013) found financial scarcity itself consumes real cognitive bandwidth, a measurable effect similar to a drop in available IQ under stress.

**CTA (H2):** Ready to see where you actually stand?
Take the free assessment, six minutes, nine variables, one honest starting point.

**FAQs:**
1. *Is this a real clinical assessment?* No. It's a self-assessment starting point for reflection, grounded in real published research, not a diagnostic tool.
2. *What happens after I get my results?* You'll see your lowest-scoring variable and some reflection questions to sit with. From there, some people keep exploring on their own, some book a Clarity Call with Laura.
3. *Do I need to score high everywhere to be doing well?* No single variable is meant to hit ten. The point is knowing which one is lowest, not scoring perfectly across the board.
4. *How is this different from generic life coaching?* Every variable traces back to real, citable research. Nothing here is vibes-based.
5. *Is my score private?* Yes, this is a self-assessment for your own reflection, not something shared or published.

**Internal links:** `/assessment`, `/about`, `/private-advisory`

---

### 10.4 The Assessment (`/assessment`)

**Title tag:** The Overflow Assessment | Life 2.0
**Meta description:** Life 2.0's research-informed 9 Variables Overflow Assessment for leaders who want sustainable fulfillment. Six minutes, private, no email required to start.
**H1:** Your cup must not just be full. It must overflow.

**Intro:**
Nine variables. One honest look at the conditions that make a fulfilling life sustainable. You'll score the parts of life that most shape your capacity to lead, give, and live without disappearing from your own life. About six minutes. Private by design.

**Embedded assessment:** iframe or native island per Section 5, pointing at the confirmed working build.

**After the fold, three short steps (matches the live Manus build's own framing):**
01 Score honestly
02 See the pattern
03 Find the leak

**CTA below the tool:** Want to talk through what you find? Book a Clarity Call with Laura.

**Internal links:** `/the-9-variables`, `/private-advisory`

---

### 10.5 The Life 2.0 Collective (`/collective`)

*Note: pricing, launch date, and cadence are marked Open Decisions in the brand bible. Copy below is written to be true today (interest-gathering, pre-launch) without locking in numbers Laura hasn't finalized.*

**Title tag:** The Life 2.0 Collective | A Community for Ambitious People
**Meta description:** A psychologically safe, low-performance community for people who are done performing and ready to think out loud. Join the waitlist for the Life 2.0 Collective.
**H1:** A room where you don't have to perform.

**Intro:**
Most rooms full of ambitious people are full of performance. Everyone's fine, everyone's crushing it, nobody says the actual sentence. The Life 2.0 Collective is built to be the opposite of that. A recurring, facilitated space for people who've built real success and are ready to stop performing it, at least for an hour.

**H2: What this actually is**
Not a curriculum. Not another thing to keep up with. A room, held with real facilitation so everyone gets heard, where you can say the true thing, think out loud, and hear from people carrying a version of the same weight you are.

**H2: What it's for**
- Recurring reflection and connection, not one-and-done
- A place to be honest about the gap between how your life looks and how it feels
- People spread across the country, so it's built to work across time zones

**CTA (H2):** Want in when it opens?
Join the waitlist. Early interest already includes dozens of people who said yes before this even had a name.
CTA: Join the waitlist

**Internal links:** `/about`, `/the-9-variables`, `/private-advisory`

---

### 10.6 Private Advisory (`/private-advisory`)

*Consolidates the current `next-level` (six-month) and `private-advisory` (twelve-month) duplicate pages into one canonical premium offer. Final term length and price are Open Decisions per the brand bible; copy below describes the offer without stating a specific duration or number so it doesn't go stale the moment Laura finalizes it.*

**Title tag:** Private Advisory | Life 2.0
**Meta description:** A high-touch, founder-led partnership for leaders ready to build a life that matches what they've built. Start with a Clarity Call.
**H1:** Build the life your business was supposed to buy.

**Intro:**
This is the deepest version of Life 2.0 work. Founder-led, high-touch, built around your actual nine variables, not a generic curriculum. It starts with one conversation.

**H2: The Clarity Call**
A 60-minute conversation with Laura. You'll walk in with wherever you scored lowest on the 9 Variables, and walk out with a clear read on the real gap and a practical next step, whether or not you go further.

What it's for:
- Diagnosing the actual Life 2.0 gap, not the symptom
- Naming the variable or variables creating the most drag
- Building a practical next-step plan, real actions, not a worksheet

CTA: Book a Clarity Call

**H2: What happens after**
For the right fit, the Clarity Call is the start of ongoing Private Advisory work: direct access to Laura, built around your specific lowest-scoring variables, structured around your actual life rather than a fixed syllabus. Scope, term, and investment are confirmed on the call itself, based on what you actually need.

**Internal links:** `/assessment`, `/about`, `/application-received`

---

### 10.7 Application Received (`/application-received`)

**Title tag:** Application Received | Life 2.0
**Meta description:** Your Life 2.0 Private Advisory application has been received.
**H1:** Got it. Laura will read this herself.

**Body:**
Your application is in. Laura reads every one personally, not a team, not a filter. If it's a fit, you'll hear back within a few days to schedule your Clarity Call.

While you wait, two things worth doing:
- Take the free 9 Variables assessment if you haven't yet, it'll make your Clarity Call sharper.
- Read a recent essay in the Journal.

**Internal links:** `/assessment`, `/journal`

---

### 10.8 The Journal (`/journal`)

**Title tag:** The Journal | Life 2.0
**Meta description:** Thoughtful essays for leaders who want more than performance from the life they've built.
**H1:** The Journal
**Intro:** Founder-led essays on the gap between a life that looks good and a life that feels good. No filler, no guru voice.

Structure: card grid, title, excerpt, publish date, pulled from Sanity `journalPost`.

**Internal links:** each post links back to `/the-9-variables` and `/assessment` where relevant.

---

### 10.9 Contact (`/contact`)

**Title tag:** Contact | Life 2.0
**Meta description:** Get in touch with the Life 2.0 team.
**H1:** Get in touch.
**Body:** For coaching or advisory questions, start with a Clarity Call, it's the fastest real answer. For everything else, use the form below.
Form fields: Name, Email, Message. Submits to Laura's inbox (confirm destination email with Laura before Step 2 build).

---

### 10.10 Privacy Policy (`/privacy-policy`)

Standard privacy policy template, populated with Life 2.0 Ventures LLC as the data controller, Arizona as the governing jurisdiction. Final legal language should be reviewed by Laura's own counsel before publish, this plan provides the page slot and structure, not a substitute for legal review.

---

## 11. Image Assets to Preserve / Stage

| File | Use |
|---|---|
| `laura-hero.jpg` | Homepage hero |
| `laura-teaching.jpg` | About / founder section |
| `laura-closeup.jpg` | Pull-quote panel |
| `laura-kitchen.jpg` | Available for `/about` secondary image or Journal post headers |
| Remaining 41 images in the Pics folder | Not yet used, catalog for Journal post headers, `/collective`, and social previews as content is built out |
| `logo_horizontal_dark`, `logo_stacked_dark`, `stripe_icon_v2`, `collective_icon` | Dark-background only, see Section 4 gap. Usable for social share cards and any dark-background sections (the 9 Variables block, footer), not usable on the light canvas directly |

**Action item:** the 41 unused Pics images have device-ID filenames (e.g. `0B918CB3-1E6B-4596-8977-5C03D3314451.jpeg`). Rename to descriptive filenames once each image's use is assigned, both for Google image indexing and for Laura's own sanity managing the asset library.

---

## 12. Sanity Webhook + Vercel Deploy Trigger

Standard setup per Step 2: a Sanity webhook fires on document publish, hits a Vercel deploy hook URL, triggers a full rebuild. Gives Laura (or whoever manages content) the ability to publish a Journal post or update the Clarity Call link in `siteSettings` without touching code or waiting on a developer.

---

## 13. Google Search Console Post-Launch Checklist

- [ ] Verify Search Console ownership for thelife20.com before DNS cutover
- [ ] Submit sitemap.xml immediately after deploy
- [ ] Request indexing for `/`, `/the-9-variables`, `/assessment` as the three highest-priority pages
- [ ] Monitor the Coverage report daily for the first 72 hours for unexpected 404s
- [ ] Validate Person/Organization schema at search.google.com/test/rich-results
- [ ] Confirm GTM/GA4/pixel setup with Laura, none currently detected in the existing source

---

## 14. Page Count Summary

| Type | Count |
|---|---|
| Core pages | 9 (`/`, `/about`, `/the-9-variables`, `/assessment`, `/collective`, `/private-advisory`, `/application-received`, `/contact`, `/privacy-policy`) |
| Journal hub | 1 |
| Journal posts | 1 live, expandable |
| **Total at launch** | **11** |

---

## 15. Internal Linking Rules

- Every page links to `/assessment` at least once, it's the top-of-funnel entry point for the entire brand.
- `/the-9-variables` and `/assessment` link to each other bidirectionally, they're functionally one funnel step split into explanation and action.
- `/private-advisory` and `/collective` both link back to `/about`, since the founder relationship is the actual product differentiator for both.
- Journal posts link forward to whichever of `/the-9-variables`, `/assessment`, or `/private-advisory` is most relevant to that post's topic, never all three by default.
- Footer, on every page: `/about`, `/the-9-variables`, `/journal`, `/privacy-policy`, `/contact`.

---

## Open Decisions Carried Over From the Brand Bible (do not resolve silently in copy)

- Final packaging, name, and price for the premium 1:1 offer (currently two competing drafts on the live site: six-month vs. twelve-month)
- Final price and commitment structure for The Life 2.0 Collective ($97 vs. $100/month was under discussion)
- Whether the assessment stays iframed from Manus or gets natively ported into the Astro site
- GTM/GA4/pixel setup, not found in the current source, confirm whether this is new or missing
