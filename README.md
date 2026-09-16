# TTIN — The Time Is Now (Unashamed Movement Launchpad)

Faith-based movement platform: free resources, testimonies, merch shop, events, donations, and a full admin panel.

## Architecture

| Tier      | Service                              | Config                                  |
|-----------|--------------------------------------|-----------------------------------------|
| Frontend  | **Vercel** (React + Vite SPA)        | `vercel.json` — static build + API proxy |
| API       | **Cloudflare Workers** (Hono)        | `worker/`                                |
| Database  | **Cloudflare D1** (SQLite)           | `worker/schema.sql`                      |
| Cache/rate-limit | **Cloudflare Workers KV**     | bound as `CACHE`                         |
| Media     | **Cloudflare R2**                    | bound as `MEDIA`                         |
| Email     | Resend HTTP API (optional)           | `RESEND_API_KEY` secret                  |
| Payments  | Stripe / Paystack / Flutterwave      | `*_SECRET_KEY` secrets (dev mode without)|

The frontend talks to the API **same-origin**: Vercel rewrites `/api/*` to the
Worker (`CF_API_URL` env var), so no CORS and cookies just work.

## Quick start (local)

```bash
# 1. Frontend deps
npm install

# 2. Worker deps + local D1 schema + seed
cd worker
npm install
npx wrangler d1 execute ttin-db --local --file=./schema.sql
npx wrangler d1 execute ttin-db --local --file=./seed.sql
cp .dev.vars.example .dev.vars        # local secrets

# 3. Run both (two terminals, or `npm run dev` at the repo root)
npx wrangler dev --port 8787          # API on :8787
cd .. && npm run dev                  # SPA on :8080 (proxies /api -> :8787)
```

Seeded admin: `admin@thetimeisnow.com` / `Admin123!` — **change it immediately**
in any real deployment (`worker/scripts/hash-password.mjs` generates hashes).

## Deployment

### Cloudflare backend (once)

```bash
cd worker
npx wrangler login
npx wrangler d1 create ttin-db              # paste the id into wrangler.jsonc
npx wrangler kv namespace create CACHE      # paste the id into wrangler.jsonc
npx wrangler r2 bucket create ttin-media
npx wrangler d1 execute ttin-db --remote --file=./schema.sql
npx wrangler d1 execute ttin-db --remote --file=./seed.sql   # optional sample data

npx wrangler secret put JWT_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
npx wrangler secret put CSRF_SECRET
# optional integrations:
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put PAYSTACK_SECRET_KEY
npx wrangler secret put FLUTTERWAVE_SECRET_KEY
npx wrangler secret put FLUTTERWAVE_WEBHOOK_HASH

# point the Worker at your real frontend origin:
#   edit vars.CLIENT_URL + vars.ALLOWED_ORIGINS in wrangler.jsonc
npx wrangler deploy
```

Note the workers.dev URL (or attach a custom domain/route), e.g.
`https://ttin-api.<account>.workers.dev`.

### Vercel frontend

1. Import the repo into Vercel (framework preset: **Vite**).
2. Add the env var: `CF_API_URL = https://ttin-api.<account>.workers.dev`
   (vercel.json rewrites `/api/*` → `$CF_API_URL/api/*`).
3. Deploy. Set `vars.CLIENT_URL` / `ALLOWED_ORIGINS` in `wrangler.jsonc` to the
   Vercel URL and `wrangler deploy` again (needed for direct API calls only).

Webhooks (when payments go live):
- Stripe:  `https://<worker>/api/payments/stripe/webhook`
- Paystack: `https://<worker>/api/payments/paystack/webhook`
- Flutterwave: `https://<worker>/api/payments/flutterwave/webhook`

## Key routes

| Path            | Description                    |
|-----------------|--------------------------------|
| `/`             | Home                           |
| `/shop`         | Merch + digital products       |
| `/resources`    | Free PDF library               |
| `/testimonies`  | Community testimonies          |
| `/events`       | Events + registration          |
| `/donate`       | Donations (Stripe checkout)    |
| `/admin/login`  | Admin JWT login                |
| `/admin/dashboard` | Protected admin area        |

## API

`GET /api/health` — liveness + D1 check. Full surface: auth, products, orders,
reviews, testimonies, events, resources, videos, donations, newsletter,
contact, analytics, payments, search, countries, content, uploads, settings.

## Checks

```bash
npm run lint        # ESLint
npm run build       # production build (tsc-clean)
npm test            # vitest unit tests
cd worker && npx tsc && npm run dev
```
