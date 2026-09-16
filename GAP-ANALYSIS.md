# TTIN — Complete Gap Analysis: What's Missing To Fully Work

> ✅ **STATUS: IMPLEMENTED** — every item below was addressed on 2026-09-16.
> See [`IMPLEMENTATION-REPORT.md`](./IMPLEMENTATION-REPORT.md) for what was built and how it was verified.

**Verified:** September 16, 2026 — by actually building the app, booting the Cloudflare Worker with local D1 + seed data, and exercising every major flow (auth, orders, checkout, payments, donations, uploads, analytics, admin).
**Scope:** every area — visitors, members, admins, commerce, content, communications, compliance, ops, testing.

---

## What already works (don't redo this)

Verified live against the running stack:

- ✅ Frontend builds clean (`vite build`), 7/7 unit tests pass, all public + admin routes render
- ✅ Worker API surface complete and responding: health, products, resources, events, testimonies, reviews, videos, settings, countries, search, analytics, content, uploads, newsletter, contact
- ✅ Auth: register / login / logout / refresh / CSRF / email-verify / password-reset — with httpOnly cookies, PBKDF2 hashing, rate limiting
- ✅ Orders: guest checkout with **stock reservation**, idempotency keys, order confirmation emails, status-update emails, back-in-stock notifications
- ✅ Payments: Stripe / Paystack / Flutterwave all work in dev mode; webhook routes exist; donation checkout works
- ✅ Admin: 12 pages wired to the real API (Dashboard, Content, Media, Videos, Products, Orders, Resources, Reviews, Newsletter, Analytics, Settings, Testimonials) with R2-backed uploads
- ✅ Security basics: helmet-style headers, CSRF, input sanitization, honeypot spam check, KV rate limiting, no stack traces leaked

The skeleton is genuinely good. What follows is everything still standing between this and "completely works for every user."

---

## P0 — Launch blockers (broken or dangerous today)

### 1. 🔴 Account-takeover vulnerability: auth tokens leaked in API responses
`worker/src/routes/auth.ts` returns the actual token URLs in the HTTP response — **unconditionally, including production**:

- `POST /api/auth/forgot-password` → returns `resetUrl` (contains the reset token)
- `POST /api/auth/register` → returns `verificationUrl`
- `POST /api/auth/send-verification` → returns `verificationUrl`

Anyone who knows a victim's email can call forgot-password and read the reset token straight out of the response, then take over the account.
**Fix:** only include these fields when a `DEV_MODE` var is set (or when `RESEND_API_KEY` is absent), never in production.

### 2. 🔴 No user login / registration UI at all
- There is **no `/login` or `/register` route** — only `/admin/login`
- The Navbar has **no account / login / sign-up button**
- `src/pages/Orders.tsx` says *"Please log in to view your order history"* — but a regular user **cannot log in anywhere**
- `VerifyEmail`, `ForgotPassword`, `ResetPassword` pages exist with no entry point leading to them
- The settings flag `allowRegistration` exists but the worker's register endpoint ignores it

**Fix:** add `/login` + `/register` pages, an account button in the Navbar (login/avatar dropdown), and respect `allowRegistration`.

### 3. 🔴 Homepage hero video and About page video are fake files
`public/videos/hero-preaching.mp4` and `plane-preaching.mp4` are **11 bytes containing the literal text "placeholder"**. The most prominent media on the site cannot play.
**Fix:** supply real video files (or swap in a poster + YouTube embed until footage is ready).

### 4. 🔴 No legal pages — hard blocker for live payments
No Privacy Policy, Terms of Service, Refund/Returns policy, or cookie notice anywhere (no routes, no footer links). Consequences:
- Stripe / Paystack / Flutterwave **will not approve live keys** for a store without privacy + refund policies
- GDPR / NDPR (large Nigerian audience) require disclosure for accounts, newsletter, and donation data
- Donations typically require a stated purpose/receipts policy

**Fix:** add `/privacy`, `/terms`, `/refunds`, `/cookies` pages and footer links; gate checkout/donate behind their existence.

### 5. 🔴 Email is fire-and-forget and unconfigured
`sendEmail` silently returns `{ ok: false }` when `RESEND_API_KEY` is missing; every caller ignores the result (`void sendEmail(...)`). In production without a key:
- Verification emails never arrive → users stuck unverified
- Password reset never arrives → lockouts with no recovery
- Order/donation confirmations silently vanish

**Fix:** configure Resend + verify the sending domain; surface email failures (log + admin visibility); consider a retry/queue (Cloudflare Queues) for critical mail; add branded HTML templates (current ones are one-line `<p>` tags).

### 6. 🔴 `worker/` doesn't install on a fresh clone
`npm install` in `worker/` fails: `wrangler@4.127` requires `@cloudflare/workers-types@^5` but `package.json` pins `^4` → ERESOLVE. Works only with `--legacy-peer-deps`.
**Fix:** bump `@cloudflare/workers-types` to `^5` (or pin wrangler to a compatible version) and commit a lockfile that installs cleanly.

### 7. 🔴 Two backends; the default dev command is broken
- `server/` (Express + MongoDB + Redis) is the **legacy** backend — it `process.exit(1)`s without `MONGODB_URI`
- `worker/` (Cloudflare) is the real one per the README
- Root `npm run dev` starts the **Express server on :5000** while Vite proxies `/api` → **:8787 (the worker, which isn't started)** → every API call 404s
- README, `vercel.json`, `.env.example` all describe the Worker stack; `server/`, `public/.htaccess`, and the Mongo/Redis docs contradict it

**Fix:** delete or archive `server/` (and `.htaccess`), change `npm run dev` to run `wrangler dev` + Vite (or document the two-terminal flow as the only flow).

---

## P1 — Feature gaps by user type

### Visitors (public site)

| Gap | Detail |
|---|---|
| **Contact messages go into a black hole** | `POST /api/contact` saves to DB, but there is **no admin endpoint and no admin page to read contacts** — the team can never see messages. Add `GET /api/contact` (admin) + an inbox page + email notification to the team. |
| **No admin management for Events** | Events have public list + registration, but **no create/edit/delete** — events are seed-data only. Add admin CRUD + an Admin Events page (none exists). |
| **No admin view for Donations** | `GET /api/donations` (admin) exists but there's **no Admin Donations page** — donors can't be thanked, totals can't be seen, receipts can't be issued. |
| **Unashamed page hardcodes its video list** | Ignores `/api/videos/feed`; admin video uploads don't appear there. |
| **WorldMap data hardcoded** | `/api/countries` exists and is seeded, but the map doesn't use it. |
| **No social sharing** | No share buttons on testimonies, resources, or events. |
| **Contact email inconsistent** | Footer uses `hello@ttin.org`, site is `thetimeisnow.org`; `https://x.com` is a placeholder link. |
| **No maintenance-mode gate** | The `maintenanceMode` setting exists but the frontend never shows a maintenance page. |
| **No offline fallback** | Service worker caches assets but navigations offline hit a browser error instead of a friendly offline page. |

### Members (logged-in users)

| Gap | Detail |
|---|---|
| **No account/profile page** | API has `GET/PUT /auth/profile` but no UI — users can't change name/password/avatar, see verification status, or delete their account. |
| **No order lookup for guests** | `order-success` shows the ID, but there's no "find my order" (email + order ID) page for guest checkouts. |
| **No digital product delivery** | Paid digital products have a `downloadUrl`, but nothing gates/emails secure download links after payment — free resources have `/resources/:id/download`, paid ones have nothing. |
| **No wishlist/orders links in main nav** | Pages exist (`/wishlist`, `/orders`) but the Navbar never links them; users must know URLs. |
| **Newsletter is single opt-in** | No confirmation email; transactional emails have no list-unsubscribe header (deliverability/spam risk). |
| **No event registration confirmation details** | Registration saves, but no calendar invite (.ics) and (verify) no confirmation email with event details. |

### Commerce

| Gap | Detail |
|---|---|
| **Payments never tested with live keys** | Everything runs in dev mode. Live launch needs: real keys, webhook secrets configured, and webhook → order marked `paid` + stock finalized + email, verified end-to-end. |
| **No currency logic** | Checkout hardcodes USD while offering Paystack/Flutterwave (NGN-first, African audience). No currency choice, no locale-aware display, no shipping cost or tax line items (address is collected but never priced). |
| **No refund/cancellation flow** | Admin can set status, but there's no Stripe refund initiation and no customer-facing cancel window. |
| **No stock release for abandoned checkouts** | Stock is reserved at checkout but never released if payment never completes — no cron/scheduled worker to expire stale `pending` orders. |
| **No receipts/invoices** | No PDF receipt for orders or donations (donation receipts matter for a ministry). |

### Admin

| Gap | Detail |
|---|---|
| **No user management** | Can't view/search users, ban accounts, change roles, force password reset, or resend verification — a `users` table exists with zero admin surface. |
| **Testimonials page orphaned** | `/admin/testimonials` is routed but **missing from the sidebar** (sidebar lists 11 items; no testimonials link). |
| **No contacts inbox** | (see above — messages unreadable) |
| **No events / donations pages** | (see above) |
| **Back-in-stock subscribers invisible** | API exists (`subscribe-stock`), admin can't view/export the list. |
| **Media library is flat** | No folders/search/tags; uploads pass through the Worker (fine for small files) but there's no size/type limit enforcement beyond filename, and no image optimization/variants. |

---

## P2 — Growth, quality, and operations

### Analytics & marketing
- **GA4 not wired** — `VITE_GA_MEASUREMENT_ID` env exists but nothing loads gtag; only internal event tracking works (and nothing visualizes it beyond the admin dashboard)
- **No newsletter campaigns** — you can collect subscribers (with CSV export) but cannot send a single email to them; no Resend Campaigns / Mailchimp / Buttondown integration
- **No SEO structured data** — no JSON-LD (Organization, Product, Event); no per-page Open Graph images; sitemap is missing `/donate`, `/contact`, `/cart`… and has no `lastmod`
- **No funnel/UX analytics** — no conversion tracking on donate → completed, shop → checkout → paid

### Reliability & ops
- **No backups** — D1 has no export schedule and no tested restore procedure. For a site taking money and donations this is essential.
- **No error monitoring** — no Sentry (frontend or worker); failures are invisible
- **No uptime/health alerting** — `/api/health` exists but nothing watches it
- **No CI/CD** — no GitHub Actions for lint/typecheck/build/test; no deploy pipeline; nothing prevents a broken commit shipping
- **No staging environment** — schema migrations (`schema.sql` is re-runnable but has no versioning) go straight to production D1

### Testing
- **Coverage is near zero where it matters**: 7 trivial unit tests + 1 e2e smoke test. Missing: worker API tests (vitest-pool-workers), auth flow tests, payment webhook tests, checkout/stock tests, admin CRUD tests, accessibility checks

### Accessibility & performance
- Needs a real audit: keyboard navigation, focus management in dialogs, color contrast (esp. the `bw-purple` theme), `prefers-reduced-motion` (the site is framer-motion heavy), alt text everywhere, skip-to-content link
- Heavy admin chunks (ContentManager 374 KB, Analytics 383 KB gzip >100 KB each) — acceptable but worth watching; hero video should be lazy + compressed when real footage lands
- `AdminContentManager`/`AdminAnalytics` load tiptap/recharts eagerly in their chunks — fine, but the public bundle should stay lean (currently OK)

### Housekeeping
- **~19 overlapping planning .md files** at repo root (MASTER-ANALYSIS-REPORT, ULTRA-GRANULAR-*, CRITIQUE-*, …) — several are stale and contradict each other; consolidate into one source of truth and archive the rest in `docs/archive/`
- `PodcastPlayer`, `SearchBar` (public variant) are built but unused — either wire them in or remove them
- Root `bun.lock` + `package-lock.json` + `worker/package-lock.json` — pick one package manager and commit only its lockfile

---

## Suggested order of attack

| Wave | Items | Outcome |
|---|---|---|
| **1 — Safe & installable** | #6 worker deps, #7 kill legacy server + fix dev script, doc cleanup | Anyone can clone & run |
| **2 — Security & trust** | #1 token leak, #4 legal pages, #5 email delivery + templates | Site is safe + compliant enough to take live payments |
| **3 — Core user journeys** | #2 login/register UI + navbar account, hero video, contact inbox, admin Events/Donations/Users pages, testimonials sidebar link | Every advertised feature actually reachable |
| **4 — Commerce hardening** | live payment keys + webhook verification, stock release cron, refunds, donation receipts, digital delivery, currency/tax/shipping | Money flows are production-grade |
| **5 — Quality & growth** | backups, Sentry, CI/CD, GA4, newsletter campaigns, SEO/JSON-LD, accessibility pass, real test suite | Operable and growable |

---

*Bottom line: the platform's skeleton — API, admin, commerce, auth — is real and works. What's missing is (a) one critical security fix, (b) the member-facing auth/account UI, (c) the "last mile" of several features that dead-end (contacts, events, donations admin, digital delivery), (d) legal/email/compliance prerequisites for live payments, and (e) the operational safety net — backups, monitoring, CI, tests — that a production site taking money needs.*
