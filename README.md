# TTIN — The Time Is Now (Unashamed Movement Launchpad)

Faith-based movement platform: free resources, testimonies, merch shop, events,
donations, member accounts, and a full admin panel — on a single Cloudflare
backend.

## Architecture

| Tier      | Service                              | Config                                  |
|-----------|--------------------------------------|-----------------------------------------|
| Frontend  | **Vercel** (React + Vite SPA)        | `vercel.json` — static build + API proxy |
| API       | **Cloudflare Workers** (Hono)        | `worker/`                                |
| Database  | **Cloudflare D1** (SQLite)           | `worker/schema.sql`                      |
| Cache/rate-limit | **Cloudflare Workers KV**     | bound as `CACHE`                         |
| Media     | **Cloudflare R2**                    | bound as `MEDIA`                         |
| Email     | Resend HTTP API (optional in dev)    | `RESEND_API_KEY` secret                  |
| Payments  | **PayPal (primary)** / Paystack / Flutterwave / Stripe | `PAYPAL_*`, `*_SECRET_KEY` secrets (dev mode without) |

The frontend talks to the API **same-origin**: Vercel rewrites `/api/*` to the
Worker (`CF_API_URL` env var), so no CORS and cookies just work.

> The legacy Express/MongoDB server that used to live in `server/` was removed —
> the Worker is a full replacement with identical response shapes. Old planning
> documents are archived under `docs/archive/`.

## What's inside

**Members:** register/login (with email verification + password reset), account
profile & password change, order history, wishlist, guest order lookup
(`/order-lookup`), secure expiring download links for paid digital products.

**Shop & giving:** cart + checkout with PayPal (primary), Paystack/Flutterwave
(NGN), or Stripe, and
USD/EUR/GBP/NGN, stock reservation, idempotent checkout, refunds (admin),
donation receipts by email, automatic release of stock from abandoned checkouts
(hourly cron), back-in-stock notifications.

**Community:** moderated testimonies & product reviews, event registration with
capacity + confirmation emails, newsletter with unsubscribe, contact form with
spam honeypot and an admin inbox with email replies.

**Admin panel (`/admin`):** dashboard, content CMS, media library (R2),
videos, products, orders (status + refunds + stale-stock release), resources,
reviews, testimonials, events CRUD, donations with stats, contacts inbox,
users (roles/ban/resend verification), newsletter, analytics, settings
(including registration toggle and maintenance mode).

**Platform:** CSRF + rate limiting + security headers, branded transactional
emails, GA4 wiring (`VITE_GA_MEASUREMENT_ID`), JSON-LD structured data,
sitemap/robots, PWA with offline page, `prefers-reduced-motion` support,
legal pages (privacy/terms/refunds/cookies).

## Quick start (local)

```bash
# 1. Install everything
npm install
cd worker && npm install && cp .dev.vars.example .dev.vars && cd ..

# 2. Local D1 database (schema + demo data)
npm run setup:db

# 3. Run the API (worker :8787) + SPA (:8080, proxies /api) together
npm run dev
```

Seeded admin: `admin@thetimeisnow.com` / `Admin123!` — **change it immediately**
in any real deployment (`worker/scripts/hash-password.mjs` generates hashes).

Without payment/email keys everything runs in **dev mode**: payments "succeed"
locally and verification/reset links are returned in API responses instead of
being emailed. With `RESEND_API_KEY` set, those URLs are **never** returned
over HTTP (security) and real emails are sent.

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
npx wrangler secret put PAYSTACK_WEBHOOK_SECRET
npx wrangler secret put FLUTTERWAVE_SECRET_KEY
npx wrangler secret put FLUTTERWAVE_WEBHOOK_HASH

# point the Worker at your real frontend origin + contact notifications:
#   edit vars.CLIENT_URL / vars.ALLOWED_ORIGINS (+ CONTACT_NOTIFICATION_EMAIL) in wrangler.jsonc
npx wrangler deploy
```

Upgrading an existing D1 created before 2026-09-16? Also run
`npx wrangler d1 execute ttin-db --remote --file=./migrations.sql`.

A cron trigger (hourly) releases stock held by abandoned checkouts.

### Vercel frontend

1. Import the repo into Vercel (framework preset: **Vite**).
2. Add the env var: `CF_API_URL = https://ttin-api.<account>.workers.dev`
   (vercel.json rewrites `/api/*` → `$CF_API_URL/api/*`). Optionally set
   `VITE_GA_MEASUREMENT_ID` for GA4.
3. Deploy. Set `vars.CLIENT_URL` / `ALLOWED_ORIGINS` in `wrangler.jsonc` to the
   Vercel URL and `wrangler deploy` again (needed for direct API calls only).

Webhooks (when payments go live):
- PayPal (primary): `https://<worker>/api/payments/paypal/webhook`
  — set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
  (from the PayPal developer dashboard), and `PAYPAL_ENV=live`.
  Events handled: `CHECKOUT.ORDER.APPROVED` (auto-captures), `PAYMENT.CAPTURE.COMPLETED`.
  PayPal does not process NGN — the UI hides it for Naira and offers Paystack/Flutterwave.
- Stripe:  `https://<worker>/api/payments/stripe/webhook`
- Paystack: `https://<worker>/api/payments/paystack/webhook`
- Flutterwave: `https://<worker>/api/payments/flutterwave/webhook`

Payment methods are toggled per provider in **Admin → Settings → Payments**.

### Backups

Export D1 regularly (put this in a scheduled CI job):

```bash
npx wrangler d1 export ttin-db --remote --output backup-$(date +%F).sql
```

## Key routes

| Path              | Description                          |
|-------------------|--------------------------------------|
| `/`               | Home                                 |
| `/shop`           | Merch + digital products             |
| `/resources`      | Free PDF library                     |
| `/testimonies`    | Community testimonies                |
| `/events`         | Events + registration                |
| `/donate`         | Donations (3 providers, 4 currencies)|
| `/login` `/register` | Member accounts                   |
| `/account`        | Profile, password, verification      |
| `/order-lookup`   | Guest order tracking                 |
| `/privacy` `/terms` `/refunds` `/cookies` | Legal           |
| `/admin/login`    | Admin JWT login                      |
| `/admin/dashboard`| Protected admin area                 |

## Checks

```bash
npm run lint         # ESLint
npm run build        # production build (tsc-clean)
npm test             # vitest unit tests
npm run test:worker  # worker API tests (vitest-pool-workers + local D1)
npm run test:e2e     # Playwright e2e (runs the full stack)
npm run typecheck    # frontend + worker TypeScript
```

CI (`.github/workflows/ci.yml`) runs all of the above on every push/PR.
