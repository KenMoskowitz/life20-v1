# Life 2.0 — thelife20.com

Monorepo for Laura Kelly's Life 2.0 site: Astro frontend + Sanity CMS, deployed on Vercel.

## Layout

- `web/` — Astro site (all 11 pages, native Overflow Assessment, application forms)
- `studio/` — Sanity Studio (schemas, seed script)
- `legacy/` — the old Netlify-era static site, kept for reference only, not deployed
- `docs/` — Step 1 master plan and approved homepage design mockup
- `pics-raw/` — raw client photography (gitignored, local only)

## Current state

- **Domain:** thelife20.com, registered at Namecheap, served by the Vercel project below (production deploys from `main`).
- **Hosting:** Vercel project `life2-0` under team `laura-kelly-s-projects`. Team is on the Pro plan (active). `web/` is linked to this project (`web/.vercel/project.json`).
- **Deploy branch:** `main`.
- **Sanity project:** `4keg86n3` ("Life 2.0"), dataset `production`, org `oE1RoZeG3`.
- **Sanity Studio:** deployed at https://life20.sanity.studio/
- **Sanity token:** lives in `studio/.env` and `web/.env` as `SANITY_TOKEN` (both gitignored, Developer-role token). Also set in Vercel (`SANITY_TOKEN`, no `PUBLIC_` prefix — server-only), alongside `PUBLIC_SANITY_PROJECT_ID=4keg86n3` and `PUBLIC_SANITY_DATASET=production`.

## Build

```bash
cd web && npm install && npm run build
```

## Sanity

```bash
cd studio && npm install
npm run seed     # idempotent, createOrReplace — reseeds siteSettings/navigation/pages/journal posts
npm run deploy   # redeploy the Studio after a schema change
```

## Forms

Two Astro API routes (`web/src/pages/api/private-advisory-application.ts`, `.../contact.ts`) write directly to Sanity as `application` and `contactMessage` documents, viewable in the Studio. Both require `output`'s Vercel adapter (already configured) and the `SANITY_TOKEN` env var to be present at runtime — without it they redirect back to the form with `?error=unavailable` and log a warning instead of silently failing.

## Route notes

- `/the-9-skills` — renamed from the originally planned `/the-9-variables`; a permanent redirect from the old path lives in `web/vercel.json`.
- `/assessment` — fully native (no iframe). Logic and copy reverse-engineered and verified against the live Manus-hosted assessment; see `web/src/scripts/assessment.ts` and `web/src/data/assessmentCopy.ts` for the verification notes.
- `/application-received` is `noindex`; see `NOINDEX_PATHS` in `web/astro.config.mjs`.

## Redirects preserved from the old site (`web/vercel.json`)

- `/next-level` → `/private-advisory`
- `/assessment-diagnosis` → `/assessment`
- `/life20-website` → `/`
- `/the-9-variables` → `/the-9-skills`
- `/forms/*` → the existing Kajabi guide-form integration (unchanged)
