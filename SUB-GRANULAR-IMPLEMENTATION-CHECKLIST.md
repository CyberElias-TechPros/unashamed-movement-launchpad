# Sub-Granular Implementation Checklist
## Full Plan for Completing the Admin Panel + Backend

**Created:** June 5, 2026  
**Source:** Backend audit of `server/` + full frontend admin audit

---

## SECTION 0: CRITICAL BUG FIXES — DO FIRST

- [x] **0.1** AdminVideoManager: remove stale `useEffect` import, use `useQuery` only
- [x] **0.2** AdminVideoManager: add `updateMutation` for edit/update
- [x] **0.3** AdminVideoManager: replace single form with `isEditing` state + Dialog
- [ ] **0.4** AdminVideoManager: pre-fill form on edit click
- [ ] **0.5** AdminVideoManager: "Save" button switches between Add / Update
- [ ] **0.6** Fix `useNavigate` unused import in AdminContentManager
- [ ] **0.7** Remove `useEffect` in AdminProductManager (React Query handles it)
- [ ] **0.8** Add `react-helmet-async` title to each admin page (SEO)

---

## SECTION 1: REPLACE `alert()` + `confirm()` WITH UI PRIMITIVES

- [x] **1.1** AdminSettings.tsx: replace `alert("Failed to save settings.")` with `useToast()`
- [x] **1.2** AdminMedia.tsx: replace `alert("Failed to upload media...")` with `useToast()`
- [ ] **1.3** AdminProductManager.tsx: replace `confirm("Delete...")` with `AlertDialog`
- [ ] **1.4** AdminOrders.tsx: replace any browser confirms with `AlertDialog`
- [ ] **1.5** AdminVideoManager.tsx: replace any browser confirms with `AlertDialog`
- [ ] **1.6** AdminResourceManager.tsx: replace `alert("Failed to save resource")` with `useToast()`

---

## SECTION 2: REWRITE AdminResourceManager TO USE React Query

- [x] **2.1** Remove `useState(resources)` + `useEffect(load)` pattern
- [x] **2.2** Remove `reload()` helper function  
- [x] **2.3** Add `useQuery(["resources", "admin"], resourcesApi.getAll)` 
- [x] **2.4** Add `createMutation` calling `resourcesApi.create`
- [x] **2.5** Add `updateMutation` calling `resourcesApi.update`
- [x] **2.6** Add `deleteMutation` calling `resourcesApi.delete`
- [x] **2.7** `onSuccess` invalidates `["resources", "admin"]` for all mutations
- [x] **2.8** Add skeleton loading state (6× pulse cards)
- [ ] **2.9** Wire Edit button to open Dialog with pre-filled data
- [ ] **2.10** Wire Delete button to `deleteMutation.mutate(id)` (already mostly done)

---

## SECTION 3: BACKEND — MISSING ENDPOINTS THE FRONTEND CALLS

### 3A: Media Library (`src/api/media.ts` calls these)
- [ ] **3A.1** Add `GET /api/uploads/cloudinary` to `server/routes/uploads.js`
  - Reads all uploaded files from DB or filesystem
  - Returns `[{id, url, publicId, createdAt}]`
- [ ] **3A.2** Add pagination + search to uploads GET

### 3B: Video Feed (`src/api/videos.ts` line 12)
- [ ] **3B.1** Add `GET /api/videos/feed` → returns `isActive:true` sorted (same as main GET)
- [ ] **3B.2** Add `POST /api/videos/upload` (multer multipart) → accepts file, returns video doc OR URL

### 3C: Products Stock (`src/api/products.ts` lines 58-69) 
- [ ] **3C.1** Add `PATCH /api/products/:id/stock` → updates stock count
- [ ] **3C.2** Add `POST /api/orders/create-checkout-session` (Stripe session creation)

### 3D: Donations (`src/api/donations.ts` lines 30, 33)
- [ ] **3D.1** Add `POST /api/donations/checkout` → creates payment intent / session
- [ ] **3D.2** Add `GET /api/donations/verify/:paymentIntentId` → verify payment status

### 3E: Payment Verification (all 3 providers)
- [ ] **3E.1** Add `GET /api/payments/stripe/initialize` (frontend calls `stripe.ts:19`)
- [ ] **3E.2** Add `GET /api/payments/paystack/verify/:reference`
- [ ] **3E.3** Add `GET /api/payments/flutterwave/verify/:transactionId`

### 3F: Settings (CRITICAL — no backend exists)
- [ ] **3F.1** Create `server/models/SiteSettings.js` — settings document model
- [ ] **3F.2** Create `server/controllers/settingsController.js` — CRUD for settings
- [ ] **3F.3** Create `server/routes/settings.js` — `/api/settings` routes
- [ ] **3F.4** Mount in `server/index.js`
- [ ] **3F.5** Wire AdminSettings to persist via PUT /api/settings

---

## SECTION 4: FRONTEND — ADMIN PAGES MISSING FEATURES

### 4A: AdminVideoManager Edit Flow
- [ ] **4A.1** Add `editingId` state (null = adding, string = editing)
- [ ] **4A.2** Add `updateMutation` using `videosApi.update(id, data)`
- [ ] **4A.3** On Edit click: populate form fields from selected video
- [ ] **4A.4** On Save: if editingId → updateMutation, else addMutation
- [ ] **4A.5** On success: clear form, invalidate videos query
- [ ] **4A.6** Add "Cancel" button to clear edit state

### 4B: AdminContentManager — More Sections + Images
- [ ] **4B.1** Add imageUrl state to ContentSections (currently only hero has it)
- [ ] **4B.2** Add "Banner Image" upload for Mission, Featured sections
- [ ] **4B.3** Render image preview in all tabs (currently hero only)
- [ ] **4B.4** Add `hasUnsavedChanges` tracking with browser beforeunload

### 4C: AdminOrders — Search + Filter
- [ ] **4C.1** Add `searchQuery` state for customer name/email search
- [ ] **4C.2** Add `statusFilter` state for dropdown filter
- [ ] **4C.3** Filter orders array client-side (or add query params to API)
- [ ] **4C.4** Show filtered count: "Showing X of Y orders"
- [ ] **4C.5** Add CSV export for orders

### 4D: AdminTestimonialManager — Search
- [ ] **4D.1** Add search input filtering by name or text content
- [ ] **4D.2** Add category filter dropdown
- [ ] **4D.3** Show "showing X of Y" count

### 4E: AdminSettings — Full Tab Wiring
- [ ] **4E.1** Branding tab: logo upload, favicon, theme selector
- [ ] **4E.2** SEO tab: meta title (char count), meta description (char count), OG image
- [ ] **4E.3** Social tab: Twitter, Instagram, YouTube, TikTok URL fields
- [ ] **4E.4** Integrate `MediaPicker` for logo + OG image uploads
- [ ] **4E.5** Persist all settings to backend on Save

---

## SECTION 5: ADMIN UI POLISH — Nice-to-Have

- [ ] **5.1** Add `Breadcrumb` component to all admin pages
- [ ] **5.2** Add `Command` palette (Cmd+K) for quick admin navigation
- [ ] **5.3** Add skeleton loaders to AdminVideoManager library
- [ ] **5.4** Add skeleton loaders to AdminTestimonialManager
- [ ] **5.5** Add skeleton loaders to AdminOrders rows
- [ ] **5.6** Add "toast on mutation success" for all CRUD pages
- [ ] **5.7** Add inline row-editing for AdminOrders (edit status inline in table)
- [ ] **5.8** Add product image drag-to-reorder in AdminProductManager
- [ ] **5.9** Add "duplicate" button on products/resources
- [ ] **5.10** Add pagination component for AdminOrders (>20 items threshold)
- [ ] **5.11** Add empty states with proper illustration for all admin pages
- [ ] **5.12** Add page transition animations via `motion.div` to all admin pages

---

## SECTION 6: BACKEND — DATA & UTILITIES

- [ ] **6.1** Add `GET /api/settings` (public) — returns site settings
- [ ] **6.2** Add `PUT /api/settings` (admin) — updates site settings
- [ ] **6.3** Create seed script for settings default document
- [ ] **6.4** Add `GET /api/uploads/cloudinary` — list all uploaded media
- [ ] **6.5** Add `DELETE /api/uploads/:id` — delete uploaded media
- [ ] **6.6** Add `GET /api/videos/feed` — public feed endpoint
- [ ] **6.7** Add `POST /api/videos/upload` — video file upload with multer
- [ ] **6.8** Add `PATCH /api/products/:id/stock` — update stock
- [ ] **6.9** Add rate limiting to orders checkout (prevent abuse)

---

## EXECUTION ORDER (recommended)

1. **Session A:** Fixes 0.1–0.8 (critical bugs), 1.1–1.6 (alert/confirm)
2. **Session B:** Fixes 2.1–2.10 (AdminResourceManager React Query rewrite)
3. **Session C:** Fixes 4A.1–4A.6 (AdminVideoManager edit flow)
4. **Session D:** Fix 3A.1 (uploads GET) + Fix 3F.1–3F.5 (settings backend)
5. **Session E:** Fixes 4E.1–4E.5 (AdminSettings full wiring)
6. **Session F:** Fixes 4B.1–4B.4, 4C.1–4C.5, 4D.1–4D.3
7. **Session G:** Fixes 3B.1, 3B.2, 3C.1, 3C.2, 3D.1, 3D.2, 3E.1–3E.3
8. **Session H:** Fixes 5.1–5.12 (polish)
9. **Session I:** Fixes 6.1–6.9 (remaining backend)
