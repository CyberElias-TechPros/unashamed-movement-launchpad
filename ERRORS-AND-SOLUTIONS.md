# Errors and Solutions

## Validation summary (after previous sweep)

- `npm run build`: passed
- `npm run lint`: passed with warnings only; no errors
- `npm test`: 5 test files and 7 tests passed
- `npx playwright test`: 1 Playwright smoke test passed
- `npx tsc --noEmit`: passed with no errors

---

# NEW ERRORS FOUND — App-Wide Audit

## PASS 1: INSTANT CRASHES (Critical — Runtime Errors)

### 1. MediaPicker.tsx — Wrong API method name (line 31)

- **Error:** `mediaApi.getAll()` is called but `src/api/media.ts` only exports `list()`. Since `getAll` is undefined, optional chaining (`?.()`) returns `undefined`, and calling `.then()` on undefined throws `TypeError: Cannot read properties of undefined (reading 'then')`.
- **File:** `src/components/MediaPicker.tsx`
- **Solution:** Change `mediaApi.getAll?.()` to `mediaApi.list()`.
- **Fix:**
```tsx
// line 31 — change:
mediaApi.getAll?.()
// to:
mediaApi.list()
```

---

### 2. Wishlist.tsx — Nonexistent properties on Product (lines 43-57)

- **Error:** The wishlist iterates `items` (type `Product[]` from WishlistContext) but accesses `item.productId` and `item.quantity` — neither exists on the `Product` type. Product has `_id`/`id`, `name`, `price`, but no `productId` and no `quantity`. React renders `NaN` keys and `undefined` values.
- **File:** `src/pages/Wishlist.tsx`
- **Solution:** Use `item._id || item.id` for identification, replace `item.quantity` with `1`, keep `item.name` and `item.price`.
- **Fix:**
```tsx
// Replace lines 43-57:
{items.map((item) => {
  const pid = (item as any)._id || (item as any).id || '';
  return (
    <div key={pid} className="rounded-3xl border border-border p-5 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-muted-foreground">Qty: 1</p>
        <p className="text-sm text-muted-foreground">${item.price}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => addItem(item, 1)}>
          Add to cart
        </Button>
        <Button variant="ghost" onClick={() => removeItem(pid)}>
          Remove
        </Button>
      </div>
    </div>
  );
})}
```
Also remove the unused `useMemo` import on line 1.

---

### 3. Checkout.tsx — Missing `country` form field (lines 20-28, 249-268)

- **Error:** The Zod validation schema requires `country: z.string().min(2, "Country is required")` but the JSX form has no `<Input>` for country. `formData.country` stays `""` forever, so `validateForm()` always fails — checkout is impossible.
- **File:** `src/pages/Checkout.tsx`
- **Solution:** Add a country input field in the address grid (after the ZIP code field), alongside the existing city/state/zip fields.
- **Fix:** After the ZIP Code `<div>` block (around line 268), add:
```tsx
<div>
  <label className="font-body text-sm mb-2 block">Country</label>
  <Input
    placeholder="United States"
    value={formData.country}
    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
    required
  />
</div>
```

---

### 4. AdminOrders.tsx — Nonexistent `ordersApi.bulkUpdateStatus` (line 54)

- **Error:** `ordersApi.bulkUpdateStatus(ids, status)` is called but the canonical `ordersApi` in `src/api/orders.ts` does not export `bulkUpdateStatus`. Calling an undefined function throws `TypeError: ordersApi.bulkUpdateStatus is not a function`.
- **File:** `src/pages/admin/AdminOrders.tsx`
- **Solution:** Add `bulkUpdateStatus` to `src/api/orders.ts`.
- **Fix in `src/api/orders.ts`:**
```ts
// Add to the ordersApi object:
bulkUpdateStatus: (ids: string[], status: string) =>
  api.post<{ message: string; modifiedCount: number }>('/orders/bulk-update-status', { ids, status }),
```

---

### 5. AdminProductManager.tsx — Duplicate condition check (line 156)

- **Error:** `if (editing._id || editing._id)` checks `_id` twice. Products may only have `id` (not `_id`). This causes editing existing products to fall through to the `else` branch, creating duplicates instead of updating.
- **File:** `src/pages/admin/AdminProductManager.tsx`
- **Solution:** Fix the condition to check both `_id` and `id`.
- **Fix:**
```tsx
// Line 156 — change:
if (editing._id || editing._id) {
// to:
const productId = (editing as any)._id || (editing as any).id;
if (productId) {
  await updateMutation.mutateAsync({ id: productId, data: productData });
```

---

### 6. server/models/SiteSettings.js — Missing `new` keyword (line 3)

- **Error:** `const settingSchema = mongoose.Schema({` — Mongoose 6+ throws `TypeError` when `mongoose.Schema()` is called without `new`. The `SiteSettings` model fails to load, crashing the server on any settings-related request.
- **File:** `server/models/SiteSettings.js`
- **Solution:** Add `new`.
- **Fix:** `const settingSchema = new mongoose.Schema({`

---

### 7. server/models/Event.js — Invalid MongoDB index operator (line 22)

- **Error:** `eventSchema.index({ date: { $gte: new Date() }, isActive: 1 })` — MongoDB does NOT support query operators (`$gte`) inside index definitions. Mongoose will attempt `createIndex()` and MongoDB will throw `MongoServerError`.
- **File:** `server/models/Event.js`
- **Solution:** Remove the invalid index line.
- **Fix:** Delete line 22: `eventSchema.index({ date: { $gte: new Date() }, isActive: 1 }); // Upcoming events`

---

### 8. server/models/Product.js — Invalid MongoDB index operator (line 33)

- **Error:** `productSchema.index({ isActive: 1, stock: { $gt: 0 } })` — same MongoDB issue, `$gt` is not valid in an index definition.
- **File:** `server/models/Product.js`
- **Solution:** Remove the invalid index line.
- **Fix:** Delete line 33: `productSchema.index({ isActive: 1, stock: { $gt: 0 } }); // In-stock products`

---

### 9. package.json — Nonexistent zod version

- **Error:** `"zod": "^3.25.76"` does not exist on npm (latest is `3.23.x`). Running `npm install` will fail.
- **File:** `package.json`
- **Solution:** Change to correct version.
- **Fix:** Change to `"zod": "^3.23.8"`, then run `npm install`.

---

## PASS 2: BROKEN FEATURES (High Priority)

### 10. Orders.tsx — Displays "undefined" for zero-value/totalAmount (line 62)

- **Error:** `${order.totalAmount?.toFixed(2) ?? order.totalAmount}` — when `totalAmount` is `undefined`, `undefined?.toFixed(2)` returns `undefined`, then `?? order.totalAmount` returns `undefined` again. Displays literal `$undefined`.
- **File:** `src/pages/Orders.tsx`
- **Solution:** Fall back to a string, not the same undefined value.
- **Fix:**
```tsx
// Line 62 — change:
${order.totalAmount?.toFixed(2) ?? order.totalAmount}
// to:
${order.totalAmount?.toFixed(2) ?? '0.00'}
```

---

### 11. Resources.tsx — `setPreview(null)` breaks PdfViewer title (lines 43-51)

- **Error:** `handlePreview` calls `setPreview(null)` immediately after setting `pdfUrl`, then `<PdfViewer url={pdfUrl} title={preview?.title || 'PDF'} />` renders. Since `preview` is `null`, `preview?.title` is `undefined` and the title always falls back to `'PDF'`.
- **File:** `src/pages/Resources.tsx`
- **Solution:** For books, set preview to the resource so PdfViewer gets its title. Only null it for non-book types.
- **Fix:**
```tsx
const handlePreview = async (resource: Resource) => {
  setPreview(resource); // always set preview for title
  if (resource.type === 'book') {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const previewUrl = resource.downloadUrl && !resource.downloadUrl.startsWith('http')
      ? `${base}${resource.downloadUrl}`
      : resource.downloadUrl;
    setPdfUrl(previewUrl || '');
  } else {
    setPdfUrl(null);
  }
};
```

---

### 12. Resources.tsx — Hardcoded `/techpros.png` for all resource cards (line ~220)

- **Error:** Every resource card uses `<LazyImage src="/techpros.png" alt="" .../>` ignoring `resource.imageUrl` or `resource.thumbnail`.
- **File:** `src/pages/Resources.tsx`
- **Solution:** Use the resource's actual image if available.
- **Fix:**
```tsx
// Line ~220 — change:
src="/techpros.png"
// to:
src={resource.imageUrl || resource.thumbnail || '/techpros.png'}
```

---

### 13. Checkout.tsx — Variable shadowing of `response` (lines 108, 130, 150, 168)

- **Error:** `const response = await ordersApi.checkout(...)` in outer scope, then `const response = await paystackApi.initialize(...)` inside the paystack block, and similarly for flutterwave and stripe. While not a runtime crash (code returns early after redirect), it clutters the scope and is a maintenance hazard.
- **File:** `src/pages/Checkout.tsx`
- **Solution:** Rename inner variables.
- **Fix:** Inside paystack block: `const paystackRes = await paystackApi.initialize(...)`, flutterwave: `const flutterwaveRes = await flutterwaveApi.initialize(...)`, stripe: `const stripeRes = await stripeApi.createSession(...)`.

---

### 14. Checkout.tsx — `currency` param not in FlutterwavePaymentData type (line ~140)

- **Error:** `flutterwaveApi.initialize({ ..., currency, orderId })` passes `currency` but `FlutterwavePaymentData` interface in `src/api/flutterwave.ts` doesn't include `currency`. With strict mode off this compiles, but it's a type mismatch that may cause the API to silently ignore the currency parameter.
- **File:** `src/api/flutterwave.ts`
- **Solution:** Add `currency` to the interface.
- **Fix:** Add `currency?: string;` to `FlutterwavePaymentData` interface.

---

### 15. OrderSuccess.tsx — Purchase tracked with $0 (line 18)

- **Error:** `trackPurchase(orderId, 0)` — the purchase amount is hardcoded to zero. Revenue analytics always report $0.
- **File:** `src/pages/OrderSuccess.tsx`
- **Solution:** Pass total via URL param from Checkout, read it in OrderSuccess.
- **Fix in `Checkout.tsx`:** Append `&total=${total}` to `successUrl`.
- **Fix in `OrderSuccess.tsx`:** Read `const totalParam = searchParams.get("total") || "0"` and use `Number(totalParam)` in `trackPurchase`.

---

### 16. Shop.tsx — `useQuery` typed as `Review[]` but API returns `PaginatedResponse` (line ~100)

- **Error:** `const { data: reviews } = useQuery<Review[] | undefined>(...)` but `reviewsApi.getByProduct` returns `PaginatedResponse<Review>` (shaped as `{ success, data: Review[], pagination }`). The generic `Review[]` is wrong — `reviews` is actually a paginated response object, not an array.
- **File:** `src/pages/Shop.tsx`
- **Solution:** Type correctly and access `.data`.
- **Fix:**
```tsx
// Change the useQuery call:
const { data: reviewsResponse } = useQuery<PaginatedResponse<Review> | undefined>({...});
// Then use:
const reviews = reviewsResponse?.data || [];
```
Import `PaginatedResponse` from `@/lib/api-client`.

---

### 17. Shop.tsx — `SubscribeForm` defined as nested component (lines ~125-134)

- **Error:** `SubscribeForm` is defined inside `Shop`, causing React to recreate it on every render. This causes unnecessary unmounting/remounting and resets internal form state.
- **File:** `src/pages/Shop.tsx`
- **Solution:** Hoist `SubscribeForm` to file level (outside `Shop` component) or memoize with `useCallback`.

---

### 18. AdminDashboard.tsx — Hardcoded fake `recentActivity` (lines ~35-42)

- **Error:** `recentActivity` is a static array of 6 fake entries. It never reflects actual site activity.
- **File:** `src/pages/admin/AdminDashboard.tsx`
- **Solution:** Fetch real activity from the backend, or at minimum mark it clearly as a placeholder.
- **Fix:** Replace with an API call or a clearly labeled placeholder section. The fake data array should be removed or disabled.

---

### 19. AdminSettings.tsx — `SiteSettings` type not imported (line ~114)

- **Error:** `saveMutation` uses `Partial<SiteSettings>` but `SiteSettings` is not imported. Only `settingsApi` is imported from `@/api/settings`.
- **File:** `src/pages/admin/AdminSettings.tsx`
- **Solution:** Add `SiteSettings` to the import.
- **Fix:**
```tsx
// Line ~22 — change:
import { settingsApi } from "@/api/settings";
// to:
import { settingsApi, SiteSettings } from "@/api/settings";
```

---

### 20. AdminReviews.tsx — `r.product` renders ObjectId string, not product name

- **Error:** In the reviews table, `r.product` is an unpopulated ObjectId string (e.g., `"60f7..."`). Users see raw IDs instead of product names.
- **File:** `src/pages/admin/AdminReviews.tsx` (line ~252)
- **Solution:** Either populate the product field on the backend or maintain a local product-name lookup. As a quick fix, show a truncated ID with a label.

---

## PASS 3: BACKEND DATA INTEGRITY & SECURITY (High)

### 21. server/controllers/orderController.js — Stock operations use `item.productId` instead of `item.product`

- **Error:** In `create()` (lines ~70-80), `checkout()` (lines ~120-130), and `updateStatus()` (line ~146), all stock reserve/restore loops use `item.productId`. The Order schema stores the product reference as `item.product` (Mongoose ObjectId ref), NOT `item.productId`. When orders are saved, Mongoose strips the `productId` field (it's not in the schema). On cancellation, `Product.findByIdAndUpdate(undefined, ...)` returns `null` and stock is NEVER restored.
- **File:** `server/controllers/orderController.js`
- **Solution:** Replace ALL occurrences of `item.productId` with `item.product` in:
  - `create()` — stock reservation loop (around line 72) and rollback loop (around line 80)
  - `checkout()` — stock reservation loop (around line 122) and rollback loop  
  - `updateStatus()` — cancellation stock restoration loop (around line 146)
- **Fix:**
```js
// In create() — line ~72, change:
{ _id: item.productId, stock: { $gte: item.quantity } }
// to:
{ _id: item.product, stock: { $gte: item.quantity } }
// Similarly for the rollback at line ~80:
await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
```
Apply the same change in `checkout()` and `updateStatus()`.

---

### 22. server/controllers/orderController.js — `bulkUpdateStatus` missing stock restoration (lines ~260-280)

- **Error:** When bulk-cancelling orders (`status === 'cancelled'`), stock is never restored. Cancelled orders permanently consume inventory.
- **File:** `server/controllers/orderController.js`
- **Solution:** Add stock restoration loop for bulk cancellations.
- **Fix:** In `bulkUpdateStatus`, after the `Order.updateMany` call, add:
```js
if (status === 'cancelled') {
  for (const order of orders) {
    try {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    } catch (e) {
      console.warn('Failed to release stock on bulk cancellation for order', order._id, e);
    }
  }
}
```

---

### 23. server/utils/email.js — `nodemailer` not in package.json

- **Error:** `require('nodemailer')` is wrapped in try/catch and silently fails. All emails (verification, password reset, order notifications, back-in-stock) fall back to `console.warn`. ZERO emails are sent in production.
- **File:** `server/utils/email.js`, `package.json`
- **Solution:** Install nodemailer.
- **Fix:** Run `npm install nodemailer` in the project root OR add `"nodemailer": "^6.9.0"` to `dependencies` in `package.json` and run `npm install`.

---

### 24. server/utils/redis.js — `connectRedis()` never called

- **Error:** `connectRedis()` is exported but never invoked in `server/index.js`. Redis-based rate limiting in `server/middleware/rateLimitRedis.js` always falls through to `next()` because Redis is never connected. Redis rate limiting is completely non-functional.
- **File:** `server/index.js`, `server/utils/redis.js`
- **Solution:** Call `connectRedis()` at server startup.
- **Fix:** In `server/index.js`, after `dotenv.config()`, add:
```js
require('./utils/redis').connectRedis();
```

---

### 25. server/index.js — `connectDB()` not awaited (line 14)

- **Error:** `connectDB()` returns a promise but is not awaited. The server starts listening on the port before the database connection completes. If DB connection fails, requests hit routes that try to query MongoDB and fail with 500 errors.
- **File:** `server/index.js`
- **Solution:** Wrap in async IIFE.
- **Fix:**
```js
// Replace connectDB(); and app.listen(...) with:
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`TTIN Server running on port ${PORT}`);
  });
})();
```

---

### 26. server/config/db.js — No check for missing `MONGODB_URI`

- **Error:** If `MONGODB_URI` is not set in the environment, Mongoose will attempt to connect to `undefined`, throwing a cryptic error.
- **File:** `server/config/db.js`
- **Solution:** Add a guard clause.
- **Fix:**
```js
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

---

### 27. server/routes/search.js — ReDoS vulnerability (line 13)

- **Error:** `const regex = new RegExp(q, 'i')` passes raw user input directly to `new RegExp()`. A malicious user can craft an "evil regex" (catastrophic backtracking) that blocks the Node.js event loop indefinitely, causing denial of service.
- **File:** `server/routes/search.js`
- **Solution:** Escape regex special characters before constructing the RegExp.
- **Fix:**
```js
const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(escaped, 'i');
```

---

### 28. server/middleware/rateLimit.js — Memory leak (unbounded Map growth)

- **Error:** `inMemoryBuckets` Map adds entries per unique IP+path but NEVER removes expired entries. Over days/weeks, the Map grows unbounded, consuming increasing memory.
- **File:** `server/middleware/rateLimit.js`
- **Solution:** Add periodic cleanup of expired entries.
- **Fix:** Add after the Map declaration:
```js
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryBuckets) {
    if (now > entry.resetAt) inMemoryBuckets.delete(key);
  }
}, 60_000);
```

---

### 29. server/routes/orders.js — `validate` called without validation rules (lines 23-24)

- **Error:** `router.post('/', validate, c.create)` and `router.put('/:id/status', protect, admin, validate, c.updateStatus)` call `validate` but have NO `body()` validation rules before them. Validation always passes, allowing arbitrary/malformed data to reach the controller.
- **File:** `server/routes/orders.js`
- **Solution:** Add validation rules arrays.
- **Fix:**
```js
router.post('/', [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('totalAmount').isNumeric().withMessage('Total amount is required'),
], validate, c.create);

router.put('/:id/status', protect, admin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']),
], validate, c.updateStatus);
```

---

### 30. server/routes/uploads.js — No auth + path traversal vulnerability

- **Error:** All three upload endpoints (POST, GET, DELETE on `/cloudinary`) have NO authentication. Anyone can upload files, list all uploads, and delete any file. Additionally, the DELETE route uses `req.params.filename` directly in `path.join` — path traversal attack possible (e.g., `../../etc/passwd`).
- **File:** `server/routes/uploads.js`
- **Solution:** Add auth middleware and sanitize filenames.
- **Fix:**
```js
// Add to requires:
const { protect, admin } = require('../middleware/auth');

// Add protect, admin to all three routes:
router.post('/cloudinary', protect, admin, upload.single('file'), async (req, res) => { ... });
router.get('/cloudinary', protect, admin, async (req, res) => { ... });
router.delete('/cloudinary/:filename', protect, admin, async (req, res) => { ... });

// Sanitize filename in DELETE:
const safeName = path.basename(req.params.filename);
const target = path.join(UPLOAD_DIR, safeName);
```

---

### 31. server/controllers/orderController.js — Stock decremented at order creation, not payment (lines ~70-85)

- **Error:** Stock is decremented immediately at order creation time (`create()` and `checkout()`), not at payment confirmation. Abandoned carts permanently reduce stock with no timeout or automatic restoration.
- **File:** `server/controllers/orderController.js`
- **Solution:** At order creation, only validate stock availability (check `$gte`), don't actually decrement. Decrement stock in payment webhook handlers in `server/routes/payments.js`.
- **Fix:** In `create()` and `checkout()`, replace `findOneAndUpdate` with `findOne` (validate-only check). Move the actual `$inc` to the payment webhook on successful charge.

---

## PASS 4: DUPLICATE CODE & EXPORT CONFLICTS

### 32. src/api/products.ts — Duplicate `ordersApi` export (lines ~81-100)

- **Error:** `src/api/products.ts` defines and exports its own `ordersApi` with different method signatures (e.g., `create` takes `{ items: { productId, quantity }[] }`), conflicting with the canonical `ordersApi` in `src/api/orders.ts`. If any file imports `{ ordersApi } from "@/api/products"`, it gets a different API object.
- **File:** `src/api/products.ts`
- **Solution:** Remove the `ordersApi` export from `products.ts`. All order-related code should use `src/api/orders.ts`.
- **Fix:** Delete lines ~81-100 (the entire `ordersApi` block) from `src/api/products.ts`. Ensure any consumer (Checkout.tsx imports from `@/api/orders` — already correct).

---

### 33. src/components/AdminSidebar.tsx — Duplicate `AdminLayout` export (lines ~260-290)

- **Error:** `AdminSidebar.tsx` exports `AdminLayout` (a wrapped version with `SidebarProvider` + children), conflicting with the canonical `AdminLayout` in `src/components/AdminLayout.tsx` (which uses `<Outlet />` for react-router).
- **File:** `src/components/AdminSidebar.tsx`
- **Solution:** Remove the `AdminLayout` export from `AdminSidebar.tsx`. Only keep it in `AdminLayout.tsx` which is what `App.tsx` imports.
- **Fix:** Delete the `AdminLayout` component and its export from `AdminSidebar.tsx` (lines ~254-284).

---

## PASS 5: CODE QUALITY (Medium/Low)

### 34. NotFound.tsx — `<a href>` instead of `<Link to>` (line 16)

- **Error:** `<a href="/">` causes a full page reload instead of SPA navigation.
- **File:** `src/pages/NotFound.tsx`
- **Solution:** Use React Router's `<Link>`.
- **Fix:**
```tsx
import { Link, useLocation } from "react-router-dom";
// Replace <a href="/" className="..."> with:
<Link to="/" className="text-primary underline hover:text-primary/90">
  Return to Home
</Link>
```

---

### 35. Search.tsx — Error state indistinguishable from "no results"

- **Error:** On API error, state is set to empty arrays (`{ products: [], resources: [], testimonies: [] }`). The user sees "No results found." — same as a legitimate empty search, with no indication of failure.
- **File:** `src/pages/Search.tsx`
- **Solution:** Add an error state and display an error message when true.

---

### 36. Events.tsx — Empty `.catch {}` swallows errors (line ~104)

- **Error:** `catch { toast({ ... }) }` — the catch block has no error parameter and no `console.error`. The actual error is silently swallowed, making debugging impossible.
- **File:** `src/pages/Events.tsx`
- **Solution:** Catch with error parameter and log it.
- **Fix:**
```tsx
} catch (err) {
  console.error('Registration failed', err);
  toast({...});
}
```

---

### 37. AdminMedia.tsx — Own layout instead of AdminLayout

- **Error:** Renders `<div className="min-h-screen bg-background p-8">` wrapping its own full-screen layout instead of using the shared AdminLayout. The admin sidebar and header are absent on this page.
- **File:** `src/pages/admin/AdminMedia.tsx`
- **Solution:** Remove the standalone layout wrapper; the AdminLayout parent already provides it.

---

### 38. AdminAnalytics.tsx — Unused imports

- **Error:** `useEffect` and `useState` are imported but never used.
- **File:** `src/pages/admin/AdminAnalytics.tsx`
- **Solution:** Remove unused imports.
- **Fix:** `import { useEffect, useState } from "react";` → remove `useEffect` and `useState` from the import.

---

### 39. AdminVideoManager.tsx — Unused `useEffect` import + double state update

- **Error:** `useEffect` is imported but never used. `handleEdit` calls separate `setTitle`, `setUrl`, etc. with the same values already in `setEditingFields`, causing an extra render.
- **File:** `src/pages/admin/AdminVideoManager.tsx`
- **Solution:** Remove unused import, batch state updates.

---

### 40. CartContext.tsx — Default `variant=null` type mismatch (line 90)

- **Error:** `addItem(product, quantity=1, variant=null)` defaults variant to `null` but the type is `CartItem['variant'] | undefined`. `null` and `undefined` are treated differently in JSON comparisons.
- **File:** `src/context/CartContext.tsx`
- **Solution:** Change default to `undefined`.
- **Fix:**
```tsx
// Line ~90 — change:
const addItem = (product: Product, quantity: number = 1, variant: CartItem['variant'] = null) => {
// to:
const addItem = (product: Product, quantity: number = 1, variant?: CartItem['variant']) => {
```

---

### 41. src/lib/api-client.ts — No handling for 204/empty body

- **Error:** `response.json()` is called unconditionally. If the API returns `204 No Content` or an empty body, `response.json()` throws a parse error.
- **File:** `src/lib/api-client.ts`
- **Solution:** Check for 204 and handle empty responses.
- **Fix:** Replace `return response.json();` with:
```ts
if (response.status === 204) return undefined as unknown as T;
const text = await response.text();
return text ? JSON.parse(text) : (undefined as unknown as T);
```

---

### 42. Duplicate analytics implementations

- **Error:** `src/hooks/useAnalytics.ts` and `src/lib/analytics.ts` both export `trackEvent` with different implementations. The hook version stores in localStorage (dev-only), the lib version POSTs to `/api/analytics` (production). Files inconsistently import from one or the other.
- **Files:** `src/hooks/useAnalytics.ts`, `src/lib/analytics.ts`
- **Solution:** Deprecate `useAnalytics.ts`. Keep `src/lib/analytics.ts` as canonical. Remove any imports of the hook version.

---

### 43. src/api/auth.ts — Stub implementations

- **Error:** `getCurrentUser()` always returns `null`, `isAuthenticated()` always returns `true`. These are placeholder stubs that cause bugs if called.
- **File:** `src/api/auth.ts`
- **Solution:** Wire to actual auth state, or remove the stubs.

---

### 44. src/pages/Index.tsx — Unused named exports (lines 35-36)

- **Error:** `export { heroVariants, itemVariant };` — neither is imported by any other file (HeroSection.tsx defines its own local copies).
- **File:** `src/pages/Index.tsx`
- **Solution:** Remove the export statement.

---

### 45. src/pages/Wishlist.tsx — Unused `useMemo` import

- **Error:** `useMemo` is imported but never used.
- **File:** `src/pages/Wishlist.tsx`
- **Solution:** Remove the import.

---

## PASS 6: CONFIG & BUILD (Medium/Low)

### 46. package.json — Dead `next-themes` dependency

- **Error:** `next-themes` is a Next.js-only package. It cannot work in a Vite/React project and is never imported anywhere.
- **File:** `package.json`
- **Solution:** Uninstall it.
- **Fix:** `npm uninstall next-themes`

---

### 47. Circular dependency: `use-toast.ts` ↔ `toast.ts`

- **Error:** `src/components/ui/use-toast.ts` imports from `@/hooks/use-toast`, and `src/hooks/use-toast.ts` imports from `@/components/ui/toast`. This creates a circular dependency chain that may cause issues in some bundlers.
- **Files:** `src/hooks/use-toast.ts`, `src/components/ui/use-toast.ts`
- **Solution:** Extract shared type definitions to a separate file `src/lib/toast-types.ts`.

---

### 48. src/pages/Unashamed.tsx — Placeholder Instagram URLs

- **Error:** Instagram links use placeholder URLs like `C8placeholder1` and `C8placeholder2` that will 404.
- **File:** `src/pages/Unashamed.tsx`
- **Solution:** Replace with real Instagram post URLs or remove those entries.

---

### 49. Hardcoded `localhost:5000` in 3 files

- **Error:** `src/lib/api-client.ts`, `src/lib/analytics.ts`, and `src/pages/Resources.tsx` all hardcode `http://localhost:5000/api` as a fallback. If the server runs on a different port (e.g., PORT env var), these break.
- **Files:** `src/lib/api-client.ts` (line 1), `src/lib/analytics.ts`, `src/pages/Resources.tsx`
- **Solution:** Ensure `VITE_API_URL` env var is properly set for all environments, or use a consistent fallback pattern. `api-client.ts` already uses `VITE_API_URL` first — the other files should follow suit.

---

### 50. tailwind.config.ts — Scans nonexistent directories

- **Error:** `./pages/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./app/**/*.{ts,tsx}` — none of these directories exist at the project root. All source is in `./src/`.
- **File:** `tailwind.config.ts`
- **Solution:** Remove the three nonexistent patterns; keep only `./src/**/*.{ts,tsx}`.
- **Fix:**
```ts
content: ["./src/**/*.{ts,tsx}"],
```

---

### 51. src/config/pageSeo.ts — Missing entries for 10 routes

- **Error:** 10 routes lack SEO metadata entries: `/checkout`, `/order-success`, `/payment-cancelled`, `/wishlist`, `/search`, `/orders`, `/donate`, `/verify-email`, `/reset-password`, `/forgot-password`. These pages will get the generic fallback title "The Time Is Now".
- **File:** `src/config/pageSeo.ts`
- **Solution:** Add SEO entries for all routes.

---

## VERIFICATION CHECKLIST

After fixing all errors, verify with:
1. `npm run build` — must complete with zero errors
2. `npx tsc --noEmit` — must pass
3. `npm run lint` — no new errors
4. `npm test` — all tests pass
5. `npx playwright test` — smoke test passes

Manual smoke checks:
- Visit `/wishlist` — items render with correct keys
- Visit `/checkout` — country field present, form submits
- Visit `/orders` — amounts display correctly
- Visit `/admin/orders` — bulk status update button works
- Visit `/admin/products` — edit vs create works correctly
- Visit `/resources` — PDF preview shows correct title
- Visit `/admin/media` — media picker loads (uses `.list()` not `.getAll()`)
- Test cancel order — stock is restored
- Test search — no ReDoS hangs with special characters
- Check Redis connection — `connectRedis()` called at startup
