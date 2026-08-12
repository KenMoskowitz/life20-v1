# Life 2.0 — Version 1

This private repository contains the approved Life 2.0 Version 1 public-site source. It includes the Overflow Assessment homepage experience, Next Level page, Private Advisory sales page and native Netlify application form, published Journal routes, guide PDF, and the existing Kajabi guide-form integration.

## Build

The project is a static site. Build the deployable output with:

```bash
node build.mjs
```

The command creates `dist/`, which Netlify publishes according to `netlify.toml`.

## Important routes

| Route | Purpose |
|---|---|
| `/` | Life 2.0 homepage with embedded Overflow Assessment |
| `/next-level/` | Next Level offer page |
| `/private-advisory/` | Private Advisory sales page and native Netlify application form |
| `/application-received/` | Private Advisory application confirmation page |
| `/blog/` | Life 2.0 Journal index |
| `/blog/strategy-isnt-coldness-its-care/` | Published Journal article |
| `/form-embed.html` | Existing guide-form integration document |

## Netlify behavior

The site uses a Netlify native form named `private-advisory-application`. When deployed, applications are captured in the Netlify dashboard. The existing `/forms/*` redirect continues to proxy the Kajabi guide form and should be retained until the guide flow is deliberately replaced.

## Repository scope

This repository intentionally excludes generated `dist/` output, local preview servers, capture images, and working review notes. Run the build command before deployment to regenerate the publish directory.
