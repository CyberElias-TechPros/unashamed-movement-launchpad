# Site Recovery — ttin.techpros.com.ng

Full backup of the deployed prototype at **https://ttin.techpros.com.ng/**
(the source code was never pushed to GitHub; this directory is the recovery).

## What's here

- `live/` — mirrored copy of the deployed site, produced by
  `scripts/scrape-site.sh` running on a GitHub Actions runner
  (workflow: `.github/workflows/site-recovery.yml`):
  - `live/index.html`, `live/manifest.json`, `live/robots.txt`,
    `live/sitemap.xml`, `live/sw.js` — root files
  - `live/assets/` — the compiled JS bundles + CSS (the entire SPA:
    every page, all text content, routing, styling)
  - `live/assets/*.map` — source maps, if the deployment included them
    (these would contain the **original source code**)
  - `live/images/`, `live/resources/`, root placeholders — all discovered
    static files (PNGs, JPGs, SVGs, PDFs)
  - `live/external/` — externally-hosted assets referenced by the bundles
    (Google Drive cover images etc.)
  - `live/routes/` — SPA route shells for the record
  - `live/_urls/` — the URL manifests the scraper discovered
- `content-snapshot.md` — human-readable, verbatim content of every page
  (hero, about story, all 10 testimonies, podcast episodes with YouTube IDs,
  resources with Drive links, donate tiers, contact details, stats, links)

## To redeploy

The site is a static SPA (Vite-style build). Serve `live/` from any static
host exactly as-is — `index.html` + `assets/` + the static folders. Point
a web server at `live/` (e.g. Cloudflare Pages / Netlify / nginx) and the
site will work as deployed.

To get back to *editable source*: if `live/assets/*.map` files were
recovered, the minified code can be mapped back to original sources
(e.g. `source-map-cli` / `unminify` tooling, or
https://github.com/paazmaya/shuji). Otherwise the minified bundles are
fully functional for redeployment.

## Not recoverable from the deployment

- **Instagram embed media** — served from `cdninstagram.com` with expiring
  signatures; the embeds re-render live from Instagram on each visit, so
  nothing is lost (the page re-fetches them).
- **YouTube videos** — hosted on YouTube (channel
  https://youtube.com/@tthetimeisnow); only IDs/durations were on the site
  (all captured in `content-snapshot.md`).
- **Gumroad products** — external (thetimeisnow.gumroad.com).
- **Google Drive source files** — only the public thumbnail URLs were
  referenced by the site; the actual Drive files live in the owner's Drive.
- Any backend/API — the prototype is a fully static SPA; there is none.

## Re-running the scrape

```bash
gh workflow run site-recovery.yml --ref arena/01a0a880-unashamed-movement-launchpad
```
