# TTIN — Deployment Guide (Vercel + Cloudflare)

This project deploys as two pieces:

```
Browser ──► Vercel (SPA + /api proxy) ──► Cloudflare Worker (Hono)
                                            ├── D1  (database)
                                            ├── KV  (rate limiting / cache)
                                            ├── R2  (media uploads)
                                            └── Resend / PayPal (primary) / Paystack / Flutterwave / Stripe
```

## 1. Cloudflare Worker (API)

```bash
cd worker
npx wrangler login

# Create the resources once:
npx wrangler d1 create ttin-db
npx wrangler kv namespace create CACHE
npx wrangler r2 bucket create ttin-media
```

Copy the ids printed by those commands into `worker/wrangler.jsonc`
(`database_id`, KV `id`).

```bash
# Schema + (optional) sample data:
npx wrangler d1 execute ttin-db --remote --file=./schema.sql
npx wrangler d1 execute ttin-db --remote --file=./seed.sql

# Secrets:
npx wrangler secret put JWT_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
npx wrangler secret put CSRF_SECRET
# optional:
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put PAYSTACK_SECRET_KEY
npx wrangler secret put FLUTTERWAVE_SECRET_KEY
npx wrangler secret put FLUTTERWAVE_WEBHOOK_HASH

# Point the worker at the frontend origin (edit wrangler.jsonc vars):
#   CLIENT_URL      = https://your-site.vercel.app
#   ALLOWED_ORIGINS = https://your-site.vercel.app

npx wrangler deploy
```

`wrangler deploy` prints the worker URL. That value becomes `CF_API_URL` on
Vercel. Attach a custom domain with `npx wrangler domains add api.example.com`
or a route in the Cloudflare dashboard if you prefer first-party cookies on
your apex domain.

### Change the admin password

```bash
cd worker
node scripts/hash-password.mjs 'YourNewStrongPassword'
# then:
npx wrangler d1 execute ttin-db --remote --command \
  "UPDATE users SET password_hash='<paste-hash>' WHERE email='admin@thetimeisnow.com'"
```

## 2. Vercel (frontend)

1. Import the repository, framework preset **Vite** (build `npm run build`,
   output `dist` — already declared in `vercel.json`).
2. Environment variable (Production + Preview):

   | Name         | Value                                  |
   |--------------|----------------------------------------|
   | `CF_API_URL` | `https://ttin-api.<account>.workers.dev` |

3. Deploy.

`vercel.json` routes do three things:

- security headers on every response,
- serve files from `dist` when they exist (`handle: filesystem`),
- rewrite everything else to `index.html` (SPA deep links) and `/api/*` to the
  Worker — same-origin, so auth cookies need no CORS configuration.

## 3. Post-deploy checklist

- [ ] `https://<worker>/api/health` returns `{"status":"ok","database":"connected"}`
- [ ] The site loads and `/api` calls succeed from the deployed domain
- [ ] Admin login works → **change the seeded password**
- [ ] Shop checkout runs through (dev-mode providers redirect straight to
      order-success until you add real keys)
- [ ] Payment webhooks registered (see README) if using live payments
- [ ] Email delivery verified (set `RESEND_API_KEY` + a verified `EMAIL_FROM`)
