# Site Recovery — ttin.techpros.com.ng

Full backup of the deployed **TTIN — The Time Is Now** prototype at
`https://ttin.techpros.com.ng/` (source was never pushed to GitHub; this mirror
is the recovery). Scraped by `scripts/scrape-site.sh` via GitHub Actions
(`.github/workflows/site-recovery.yml`) — see run history on this branch and
`scrape-report.txt` for the fetch log.

## What was recovered (71 MB, 166 files)

| Path | Contents |
|---|---|
| `live/index.html`, `manifest.json`, `sw.js`, `robots.txt`, `sitemap.xml`, `offline.html`, `favicon.ico` | Root deploy files (SPA shell, PWA manifest v3-cache, service worker) |
| `live/assets/` | **The entire client build**: `app-DwH0RQZ6.js` (205KB), `app-BEMj9zjt.css` (110KB), `vendor-BtIrUdbE.js`, `router-BY5DHDkN.js`, `query-BxHf87gp.js`, `types-QrSs3t7L.js`, 80+ lazy route chunks (all pages incl. every `Admin*` manager, Cart, Checkout, Donate, Testimonies, Unashamed…) |
| `live/images/` | `ttin-primary.svg`, `ttin-secondary.svg` (logos), `Picture1.png`, `Picture2.png` (Unashamed FAQ / newsletter art, 600KB+ each) |
| `live/videos/` | `front-video.mp4` (9MB hero video) |
| `live/resources/` | **All 12 book PDFs** (Foxe's Book of Martyrs, God's Generals ×2, Tortured for Christ, I Went To Hell, Kathryn Kuhlman, Now That You Are Born Again, Recreating Your World, Revival in the Hebrides, Power of Tongues, Seven Spirits of God, When God Visits You — 240KB–13MB each) |
| `live/api/` | **Live API JSON snapshots**: `health`, `settings`, `resources` (12 books w/ Drive IDs), `countries`, `content`, `products`, `testimonies`, `events`, `videos`, `videos-feed`, `reviews`, `search` — products/testimonies/events/videos arrays are **empty on the live API** (the rendered content comes from fallback data baked into the JS chunks) |
| `live/external/` | 28 Google Drive thumbnail images (book covers, page heroes) + React error-decoder page |
| `live/routes/` | Server-rendered HTML shells of 10 key routes |
| `live/_urls/` | Discovered-URL manifests + `drive-ids.txt` (every referenced Drive file ID) |
| `content-snapshot.md` | Verbatim content of every page: hero, about story, all 10 testimonies, UNASHAMED podcast episodes + YouTube IDs, resources, donation tiers, contact info, stats, quotes, IG embed details, robots/sitemap/manifest values |

## Key findings about the deployed prototype

- **Stack:** React SPA (Vite build) + a live JSON API at same-origin `/api/*`
  (Cloudflare D1-backed; `GET /api/health` → `TTIN API is running`, primary DB
  `connected`). The API only answers XHR-style requests (`Accept: application/json`
  + session cookie from `/api/auth/csrf-token`) — plain browser navigation to
  `/api/*` gets the SPA 404 shell.
- **No source maps deployed** — original TS/TSX source is not recoverable from
  the deploy; the minified bundles here are the ceiling for code.
- **Data layer:** products/testimonies/events/videos tables are **empty** in the
  live DB. Pages that render content do so from fallback data compiled into the
  JS chunks (e.g. the 10 testimonies, the 12-book resource map). Shop and Events
  pages show empty states. `settings.json` holds the real site settings
  (siteName "The Time Is Now", primary `#7c3aed`, accent `#fbbf24`,
  Paystack/Stripe/Flutterwave enabled).
- **SPA fallback trap:** the host returns `index.html` (HTTP 200) for any
  unknown path, so naive mirroring saves junk (`.js.map`/`.js`/`.jpg` files that
  are actually HTML). The scraper validates magic bytes and deletes those;
  `placeholder-*.jpg` and `videos/*.mov` references in the code are **not
  actually deployed** — they 404→fallback on the live host too.
- **Media pipeline:** book covers / page hero images come from
  `drive.google.com/thumbnail?id=<ID>` (all IDs captured in
  `live/_urls/drive-ids.txt` and mirrored under `live/external/`). The hero
  background video streams from Drive file `1gQWrnRISkYrF5feQOw1VqT3d_qqA7Djt`.

## Restoring / redeploying

1. **Static hosting:** serve `live/` with SPA fallback (any unknown path →
   `index.html`). Keep original file names — the hashed bundle names are
   referenced from `index.html`.
2. **Resources:** the download links resolve to `/resources/<Title>.pdf`
   (same origin) — the PDFs are in `live/resources/`.
3. **API:** the SPA calls same-origin `/api/*` (client in `app-DwH0RQZ6.js`,
   base `"/api"`). Our Cloudflare Worker in `worker/` implements the same
   response shapes; `api/*.json` here documents the live shapes/values.
4. **Drive assets:** videos/hi-res originals live in the org's Google Drive —
   IDs in `live/_urls/drive-ids.txt`.

## Re-running the scrape

Push a change to `scripts/scrape-site.sh` or `.github/workflows/site-recovery.yml`
(paths-filtered trigger, no loop) or run the workflow manually from the Actions
tab on this branch. The run commits the fresh mirror to this branch.
