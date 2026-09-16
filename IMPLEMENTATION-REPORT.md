# TTIN — Full Implementation Report

**Completed:** September 16, 2026
**Scope:** every gap identified in `GAP-ANALYSIS.md`, implemented end-to-end in dependency order: security → member journeys → admin completeness → commerce hardening → platform/ops.

**Verification (all green):** frontend lint + typecheck + build ✓ · 6 unit tests ✓ · **15 new worker API integration tests** (real D1, real auth cookies, full user journeys) ✓ · full stack exercised live through the dev proxy ✓.

---

## 1. Security (was: account-takeover risk)

- **Token-leak fix:** `forgot-password`, `register`, and `send-verification` no longer return reset/verification URLs when a real email provider (`RESEND_API_KEY`) is configured. URLs are returned **only in dev mode**, clearly marked. In production they go out by email only.
- `allowRegistration` site setting is now enforced by the register endpoint (admins can close signups).
- Admin guardrails: an admin cannot demote or deactivate their own account.

## 2. Member journeys (was: no login at all)

| New | Detail |
|---|---|
| `/login` + `/register` pages | With redirect-back support, honeypot, password rules, links to legal pages, and a "check your inbox" verification state |
| Navbar account area | Sign In / Join when logged out; avatar dropdown (Account, Orders, Wishlist, Admin, Sign Out) when logged in; wishlist icon with badge — desktop **and** mobile |
| `/account` page | Edit profile (name/email/avatar), change password (with current-password check), email-verification status + resend, quick links |
| `/order-lookup` page | Guests track orders with just email + order ID (no account needed) |
| `POST /api/auth/change-password` | New endpoint (old password required, notification email sent) |
| Context | `AuthContext` gained `register()` and `refreshUser()`; user object now carries `emailVerified`/`avatar` |

## 3. Admin completeness (was: 5 dead-end features)

| New admin page | What it does |
|---|---|
| **Contacts inbox** (`/admin/contacts`) | List/search/unread-filter messages, read state, delete, and **reply by email** (branded, quotes the original). Backend: `GET /api/contact`, `PATCH /:id/read`, `DELETE /:id`, `POST /:id/reply`, unread badge counts, team notification email for new messages |
| **Events** (`/admin/events`) | Full CRUD that already existed in the API but had no UI: create/edit dialog, visibility switch, capacity + registration counts, past-event badges, search |
| **Donations** (`/admin/donations`) | Stat cards (total raised, this month, donors, pending), searchable table, manual status correction (bank transfers) which auto-sends receipts |
| **Users** (`/admin/users`) | Search/filter, promote/demote admins, deactivate/reactivate accounts, resend verification emails. Backend: `GET /api/auth/admin/users`, `PATCH /api/auth/admin/users/:id`, `POST …/resend-verification` |
| **Testimonials sidebar link** | The orphaned page is now reachable (plus Events/Donations/Contacts/Users in the sidebar) |
| **Orders refund action** | Refund button in the order dialog with confirmation, double-refund protection, and refunded-state display |

## 4. Commerce hardening

- **Refunds end-to-end:** `POST /api/orders/:id/refund` — Stripe API refund when Stripe-paid (resolves Checkout-Session ids to PaymentIntents), stock restore (guarded against double-restore), `refunded_at` bookkeeping, customer email.
- **Digital delivery:** paid digital products now get **secure, expiring (30-day, max-10) download tokens** (`order_downloads` table), emailed on payment. `GET /api/orders/downloads/:token` validates + redirects; tokens are issued idempotently by webhooks *and* manual completion.
- **Webhook settlement for donations:** all three payment webhooks now settle **orders and donations** through one resolver (by id / idempotency key / payment id) — payment-received email + digital links for orders, receipt email for donations.
- **Donation checkout rewritten:** Stripe/Paystack/Flutterwave × USD/EUR/GBP/NGN, anonymous giving, donor message, dev-mode completion. `Donate` page fully rebuilt (presets per currency, method picker, success/cancel states, signed-in prefill).
- **Stale-checkout stock release:** hourly Cloudflare **cron trigger** cancels `pending` orders older than 24h and restores their stock; also exposed as `POST /api/orders/admin/release-stale` (manual, with custom window).
- **Currency throughout:** orders store their currency; checkout summary and pay button are locale-formatted (`src/lib/format.ts`).

## 5. Email & communications

- **Branded HTML templates** for every transactional email (wrap-around layout, CTA buttons, footer) — verification, reset, password change, order received, payment received (+downloads), refund, shipping updates, back-in-stock, event registration, donation receipt, contact notifications/replies.
- **Donation receipts** with receipt numbers.
- `CONTACT_NOTIFICATION_EMAIL` var routes contact-form notifications + reply-to.

## 6. Legal, compliance, SEO, a11y, PWA

- **Legal pages:** `/privacy`, `/terms`, `/refunds`, `/cookies` — full policies (GDPR/NDPR-aware, payment-provider requirements), linked from footer, register page, and donate page.
- **JSON-LD** structured data (Organization + WebSite with SearchAction) on every page via `RouteSEO`.
- **GA4:** loads when `VITE_GA_MEASUREMENT_ID` is set; internal `trackEvent` forwards to gtag.
- **Sitemap** rebuilt (16 routes + lastmod/changefreq); **robots.txt** blocks admin/account/api and points to the sitemap.
- **`prefers-reduced-motion`** respected globally.
- **PWA offline page** (`/offline.html`) + service-worker navigation fallback; SW cache bumped.
- Fixed placeholder social links (`x.com` → real handle, `hello@ttin.org` → `hello@thetimeisnow.org`).

## 7. Foundation & ops

- **Worker installs cleanly:** `@cloudflare/workers-types` bumped to v5 (was an unresolvable peer conflict).
- **Legacy Express/Mongo server removed** (it was dead weight: `npm run dev` previously started it on :5000 while the frontend proxied to the Worker on :8787). Root `npm run dev` now runs **Worker + SPA together**; `npm run setup:db` bootstraps local D1.
- **`migrations.sql`** for existing production D1s (contacts `is_read`, orders `refunded_at`/`currency`, `order_downloads`).
- **CI:** `.github/workflows/ci.yml` — frontend (lint/typecheck/build/unit) + worker (typecheck/API tests) on every push/PR.
- **Worker test suite:** 15 integration tests via `vitest-pool-workers` against real D1 — health/catalog, member auth journey (register → login → change password), contact inbox permissions, full shop journey (checkout stock reservation → guest lookup → digital-delivery token → download redirect → refund + stock restore + double-refund rejection), donations (checkout/stats/manual completion), stale-order release.
- **README rewritten** for the single-backend architecture, incl. deployment, webhooks, backups (`wrangler d1 export`).
- 20 stale planning docs archived to `docs/archive/`; `bun` lockfiles and `.htaccess` removed.

## Known follow-ups (not blockers)

1. **Real content:** hero/plane videos are still 11-byte placeholders (pages now degrade gracefully to the poster); products need real images.
2. **Live payment keys + webhook secrets** must be set in production (dev mode works without).
3. **RESEND_API_KEY + verified sending domain** for real email delivery.
4. Playwright e2e needs `npx playwright install` on a dev machine/CI runner (browser download is blocked in some sandboxes).
5. Newsletter *campaign sending* (broadcasts) is still export-only — needs a provider integration when the list grows.

---

# Addendum: PayPal as the primary payment option

PayPal is now the **default, pre-selected payment method** for both the shop
checkout and donations, ahead of Paystack/Flutterwave (NGN) and Stripe.

## Backend (`worker/`)

- **`src/paypal.ts` (new)** — full PayPal client: OAuth token (KV-cached),
  Orders v2 create/capture (sandbox + live base URLs), capture refund, and
  webhook signature verification via PayPal's verify-webhook-signature API.
  Supported-currency list excludes NGN (PayPal can't process Naira).
- **`src/routes/payments.ts`** — `/api/payments/paypal/*`:
  - `GET /initialize` — reports configured/dev mode.
  - `POST /create-order` — amount is always read from **our** D1 row (never the
    client); our order/donation id travels in PayPal's `custom_id`. Return URLs
    use the request origin when the SPA is behind a proxy/preview host.
  - `POST /capture/:paypalOrderId` — settles orders (→ `processing`, triggers
    fulfillment emails + digital downloads) and donations (→ `completed`).
    Idempotent: `ORDER_ALREADY_CAPTURED` is treated as success.
  - `POST /webhook` — signature-verified; `CHECKOUT.ORDER.APPROVED` auto-captures
    (covers buyers who never return), `PAYMENT.CAPTURE.COMPLETED` settles by
    `custom_id`.
- **`src/routes/shop.ts`** — refunds: PayPal captures are refunded via the
  PayPal API when `payment_method = 'paypal'` (Stripe branch unchanged).
- **`src/routes/community.ts`** — donations accept `paypal` as a method.
- **`schema.sql` / `seed.sql` / `migrations.sql`** — new `pay_paypal` settings
  column (default **on** = primary).
- **Types & config** — `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`,
  `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENV` (`live` | `sandbox`) in `types.ts`,
  `.dev.vars.example`, `wrangler.jsonc`.
- **Bug fixed (found by the new tests):** `updateOrderStatus` had mismatched
  SQL parameter binds — `?1` was used for both the row id *and* the status, so
  every webhook settlement (all providers) would have failed with a CHECK
  constraint error. Parameters are now bound correctly.
- **Dev mode:** with no PayPal credentials, create-order returns a simulated
  approve URL (`dev_<our ref id>`) so the full journey — checkout → approval →
  capture → fulfillment/receipt — is testable end-to-end, same as other providers.

## Frontend (`src/`)

- **`api/paypal.ts` (new)** — typed client (initialize / createOrder / capture).
- **`pages/Checkout.tsx`** — PayPal is the default method, listed first as
  "PayPal (recommended)"; hidden for NGN (auto-switches to Paystack with a
  toast); submit creates a PayPal order and redirects to the approval URL.
- **`pages/Donate.tsx`** — PayPal default + "Recommended" badge on the method
  picker; disabled with an explanation when the currency is NGN; PayPal-return
  handling captures the payment then shows the thank-you state.
- **`pages/OrderSuccess.tsx`** — captures the approved PayPal payment on return
  (live: PayPal `token`; dev: derived `dev_<orderId>`), with a "Confirming
  payment…" state and a webhook-safety-net message if capture fails.
- **`pages/admin/AdminSettings.tsx`** — new **Payments tab** with per-provider
  toggles (PayPal marked primary; Stripe/Paystack/Flutterwave descriptions),
  wired to the existing `paymentMethods` settings contract.
- **`api/donations.ts`** — `paymentMethod` type widened to include `paypal`.

## Verification

- Worker: **19/19 tests pass** (15 existing + 4 new: initialize dev-mode, shop
  order create→capture→settled, donation create→capture→completed, guards for
  bogus ids/unconfigured webhook).
- Frontend: lint 0 errors, `tsc` clean, production build, unit tests 6/6.
- Live stack (worker :8787 + SPA :8080): PayPal dev-mode shop order and donation
  journeys verified end-to-end via the proxy (order → `processing` with
  `payment_method=paypal`, donation → `completed`), plus admin settings PATCH
  round-trip for `paymentMethods`.

## Production checklist

1. `wrangler secret put PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID`,
   and set `PAYPAL_ENV` to `live`.
2. Register the webhook `https://<worker>/api/payments/paypal/webhook` for events
   `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`; copy the webhook id.
3. Toggle providers under **Admin → Settings → Payments**.
