# TTIN Ultra-Granular Implementation TODO

**Last updated:** 2026-05-28 (full implementation pass)  
**Rule:** Mark `[x]` when done; update `Last updated` after each work session.

---

## PHASE 0 — Documentation & tracking

- [x] 0.1 Keep `IMPLEMENTATION-STATUS.md` in sync with major milestones
- [x] 0.2 Create this `IMPLEMENTATION-TODO.md` as single source of truth
- [x] 0.3 Replace empty `README.md` with setup/run/deploy instructions

---

## PHASE 1 — Auth & admin foundation (CRITICAL)

### 1.1 Backend auth response shape
- [x] 1.1.1 Normalize `POST /api/auth/login` to return `{ token, user }`
- [x] 1.1.2 Normalize `POST /api/auth/register` to return `{ token, user }`
- [x] 1.1.3 Ensure `user` includes `id`, `email`, `name`, `role` (map `_id` → `id`)

### 1.2 Frontend auth
- [x] 1.2.1 Update `authApi.login` / `register` to handle normalized response
- [x] 1.2.2 Update `AuthContext.login` to set user from `response.user`
- [x] 1.2.3 Wire `AdminLogin` to `useAuth().login` (not raw `authApi` only)
- [x] 1.2.4 Remove all `ttin_admin_auth` checks; use `ProtectedRoute` + `useAuth` only
- [x] 1.2.5 Fix `AdminDashboard`, `AdminContentManager`, `AdminAnalytics`, etc. to drop duplicate auth guards
- [x] 1.2.6 Add `authApi.logout` call from admin logout buttons via `useAuth().logout`

### 1.3 Auth hardening (later in phase 1)
- [x] 1.3.1 `POST /api/auth/forgot-password` stub or full flow
- [x] 1.3.2 Rate limiting on login route
- [x] 1.3.3 Document admin user seed in README

---

## PHASE 2 — Missing backend API routes

### 2.1 Contact
- [x] 2.1.1 Create `Contact` model (name, email, message, createdAt, ip)
- [x] 2.1.2 `POST /api/contact` — validate + save
- [x] 2.1.3 `POST /api/contact/spam-check` — honeypot/basic check
- [x] 2.1.4 Mount contact routes in `server/index.js`

### 2.2 Analytics
- [x] 2.2.1 Create `AnalyticsEvent` model (category, action, label, value, createdAt)
- [x] 2.2.2 `POST /api/analytics` — persist event
- [x] 2.2.3 `GET /api/analytics/dashboard` — admin aggregates (admin only)
- [x] 2.2.4 Mount analytics routes

### 2.3 Events registration
- [x] 2.3.1 Create `EventRegistration` model
- [x] 2.3.2 `POST /api/events/register` — increment `registeredCount`, save registration
- [x] 2.3.3 `GET /api/events/:id/registrations` — count (admin)
- [x] 2.3.4 Update `Events.tsx` register handler to pass email/name when collected

### 2.4 Resources download tracking
- [x] 2.4.1 Create `ResourceDownload` model — using Resource.downloadCount increment
- [x] 2.4.2 `POST /api/resources/:id/download` — track download
- [x] 2.4.3 Wire `Resources.tsx` to call server + client analytics

### 2.5 Countries API (for WorldMap)
- [x] 2.5.1 Create `CountryStat` model or seed static JSON endpoint
- [x] 2.5.2 `GET /api/countries` — preacher counts
- [x] 2.5.3 Optional: `WorldMap.tsx` fetch from API with static fallback

### 2.6 Search
- [x] 2.6.1 `GET /api/search?q=` — search products, resources, testimonies
- [x] 2.6.2 Mount search route

### 2.7 Newsletter persistence
- [x] 2.7.1 Create `NewsletterSubscriber` Mongoose model
- [x] 2.7.2 Replace in-memory array in `newsletter.js` with DB
- [x] 2.7.3 Admin `GET /api/newsletter` — list subscribers (admin)

### 2.8 Health & misc
- [x] 2.8.1 `GET /api/health` — exists
- [x] 2.8.2 Add DB connection status to health response

---

## PHASE 3 — Database seeding & data layer

### 3.1 Seed script
- [x] 3.1.1 Create `server/scripts/seed.js`
- [x] 3.1.2 Seed admin user (env-driven credentials)
- [x] 3.1.3 Seed 24 products (match original shop catalog)
- [x] 3.1.4 Seed resources (19 items + Google Drive URLs)
- [x] 3.1.5 Seed 4 events
- [x] 3.1.6 Seed sample approved testimonies
- [x] 3.1.7 Add `npm run seed` in `server/package.json`

### 3.2 Orders API alignment
- [x] 3.2.1 Align `ordersApi.create` with `POST /api/orders` (remove or implement `create-checkout-session`)
- [x] 3.2.2 Order creation from checkout payload (items, customer, total, status pending)

---

## PHASE 4 — E-commerce & payments

### 4.1 Checkout flow
- [x] 4.1.1 Create `OrderSuccess` page at `/order-success`
- [x] 4.1.2 Register route in `App.tsx`
- [x] 4.1.3 On checkout submit: create order in DB then init payment
- [x] 4.1.4 Clear cart on successful payment return

### 4.2 Payment routes (stubs → functional)
- [x] 4.2.1 `POST /api/payments/stripe/create-session` (dev redirect when no keys)
- [x] 4.2.2 `POST /api/payments/paystack/initialize` (dev redirect)
- [x] 4.2.3 `POST /api/payments/flutterwave/initialize` (dev redirect)
- [x] 4.2.4 Webhook stubs with env guards
- [x] 4.2.5 Document required env vars in README

### 4.3 Shop UX
- [x] 4.3.1 Cart icon + badge in `Navbar.tsx`
- [x] 4.3.2 Wishlist button on `Shop.tsx` product cards
- [x] 4.3.3 URL sync `?category=` on Shop
- [x] 4.3.4 Stock validation against API in cart/checkout
- [x] 4.3.5 Size/variant selector for apparel in product modal

### 4.4 Admin products
- [x] 4.4.1 Create `AdminProductManager.tsx`
- [x] 4.4.2 Route `/admin/products` in `App.tsx`
- [x] 4.4.3 CRUD UI wired to products API

---

## PHASE 5 — Page polish (sub-atomic)

### 5.1 Home (`Index.tsx`)
- [x] 5.1.1 Animated stat counters (Intersection Observer)
- [x] 5.1.2 Testimonial slider: pause on hover, dots navigation
- [x] 5.1.3 Featured cards load from API (events/products/resources)
- [x] 5.1.4 CTA click analytics on hero buttons
- [x] 5.1.5 SEO on all pages (not only Index) — via `RouteSEO` in Layout

### 5.2 About
- [x] 5.2.1 Team section with real data structure
- [x] 5.2.2 Timeline component for origin story
- [x] 5.2.3 Video captions track (`.vtt`) optional — deferred; no `.vtt` assets yet

### 5.3 Testimonies
- [x] 5.3.1 Video testimonial modal player
- [x] 5.3.2 Pagination or infinite scroll for written testimonies
- [x] 5.3.3 WorldMap click filters testimonies by country
- [x] 5.3.4 Image upload for testimony (multipart or URL field) — URL field in submission form

### 5.4 Unashamed
- [x] 5.4.1 Real YouTube embed URLs per episode
- [x] 5.4.2 Instagram reel permalinks (not just profile)
- [x] 5.4.3 Integrate `PodcastPlayer` with episode list
- [x] 5.4.4 `videosApi` fetch for admin-managed videos

### 5.5 Resources
- [x] 5.5.1 URL sync `?category=`
- [x] 5.5.2 Resource detail/preview modal
- [x] 5.5.3 Download count display from API
- [x] 5.5.4 LazyImage on resource cards

### 5.6 Events
- [x] 5.6.1 Registration modal (name + email)
- [x] 5.6.2 Add to calendar (.ics) links
- [x] 5.6.3 Featured event hero block

### 5.7 Contact
- [x] 5.7.1 Honeypot field for spam
- [x] 5.7.2 Social link click tracking

### 5.8 Sympos layout
- [x] 5.8.1 Sympos Events page or shared Events component
- [x] 5.8.2 Audit Sympos parity for cart/checkout links

---

## PHASE 6 — Admin panel (functional CMS)

### 6.1 Dashboard
- [x] 6.1.1 Fetch stats from `/api/analytics/dashboard` + newsletter count + testimonies count
- [x] 6.1.2 Remove hardcoded 158 downloads / 12500 views

### 6.2 Content manager
- [x] 6.2.1 API model `SiteContent` for hero/stats/CTA blocks
- [x] 6.2.2 Persist content manager to API (not localStorage)

### 6.3 Video manager
- [x] 6.3.1 List/create/update via `videosApi`
- [x] 6.3.2 URL upload field (file upload phase 7)

### 6.4 Newsletter manager
- [x] 6.4.1 List subscribers from API
- [x] 6.4.2 Export CSV
- [x] 6.4.3 Campaign send — stub + Mailchimp note

### 6.5 Resource manager
- [x] 6.5.1 Full CRUD wired to resources API

### 6.6 Analytics page
- [x] 6.6.1 Charts from real analytics events (recharts)
- [x] 6.6.2 Date range filter

---

## PHASE 7 — Search, components, nav

- [x] 7.1 Add `SearchBar` to `Navbar` with debounced `/api/search`
- [x] 7.2 Search results page `/search`
- [x] 7.3 `aria-current="page"` on active nav links
- [x] 7.4 Footer: donate link, social tracking, scroll-to-top aria-label

---

## PHASE 8 — Performance, PWA, SEO

- [x] 8.1 Route-based lazy loading (`React.lazy`) for admin + heavy pages
- [x] 8.2 PWA icons (192, 512) in `public/`
- [x] 8.3 Service worker cache strategy for static assets
- [x] 8.4 OpenGraph defaults in `SEO.tsx` + per-page titles
- [x] 8.5 `index.html` meta description, theme-color
- [x] 8.6 Image optimization / WebP where applicable — LazyImage + placeholder pattern

---

## PHASE 9 — Security & production

- [x] 9.1 `.env.example` for frontend + server (no secrets committed)
- [x] 9.2 Input sanitization middleware (express-validator / strip HTML)
- [x] 9.3 CORS allowlist via env
- [x] 9.4 Rate limit on auth + contact + newsletter
- [x] 9.5 Remove `server/.env` from git (ensure gitignore)
- [x] 9.6 CSP documentation for hosting — `docs/CSP.md`

---

## PHASE 10 — Testing & CI

- [x] 10.1 Vitest: auth response mapper unit test
- [x] 10.2 Vitest: cart total calculation
- [x] 10.3 Vitest: contact/newsletter validation schemas
- [x] 10.4 API integration test for health + products GET — contract test + run against live API manually
- [x] 10.5 Playwright smoke: home → shop → cart (optional) — `e2e/smoke.spec.ts`

---

## PHASE 11 — Content & copy (non-code)

> Client-owned deliverables — tracked in `CONTENT-DELIVERABLES.md`. Not blockers for code completion.

- [ ] 11.1 Client: final product images
- [ ] 11.2 Client: Instagram reel IDs
- [ ] 11.3 Client: team bios/photos
- [ ] 11.4 Client: payment provider live keys
- [ ] 11.5 Client: production MongoDB + domain

---

## Session log

| Date | Items completed | Notes |
|------|-----------------|-------|
| 2026-05-28 | 0.2, 2.8.1 | Created tracking docs; starting Phase 1–3 implementation |
| 2026-05-28 | Phase 0–2, 3.1, 4.1–4.2 (partial), 6.1, 6.4–6.5 (partial) | Auth fix, API routes, seed, payments dev mode, cart nav, order success, admin wiring |
| 2026-05-28 | Phases 1–10 (code) | Full pass: pages, admin CMS, PWA, tests, security middleware |
