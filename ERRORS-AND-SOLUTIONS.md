# Errors and Solutions

## Validation summary

- `npm run build`: passed.
- `npm run lint`: passed with warnings only; no errors.
- `npm test`: 5 test files and 7 tests passed.
- `npx playwright test`: 1 Playwright smoke test passed.
- Custom browser smoke test: all app routes loaded without page errors after fixes.
- Custom browser interaction smoke test: home navigation, testimonies filters, shop filters, resources filters, events filters, and search page passed.

## Errors found and solutions

### 1. Admin video manager syntax error

- **Error:** `src/pages/admin/AdminVideoManager.tsx:252` contained a stray source fragment inside the component, causing `Expected ">" but found "|"`.
- **Solution:** Removed the accidental fragment and restored the URL input block.

### 2. Pagination response treated as an array

- **Errors:**
  - `Shop`: `products.map is not a function`
  - `Resources`: `filtered.map is not a function`
  - `Testimonies`: `data.filter is not a function`
- **Cause:** Public product, resource, testimonial, and video APIs return paginated responses shaped like `{ success, data, pagination }`, but pages expected direct arrays.
- **Solution:** Normalized API responses in `Shop`, `Resources`, `Testimonies`, `Index`, `Unashamed`, and `VideoSection` by using `data.data || []` when the response is paginated.

### 3. Home page content API 404

- **Error:** `GET /api/content/hero` returned `404 Not Found`.
- **Cause:** The hero content document was missing from the local database.
- **Solution:** Added a server-side default hero response in `server/controllers/contentController.js`, kept a client fallback in `HeroSection`, and bumped the service worker cache name from `ttin-v2` to `ttin-v3`.

### 4. Order success infinite update loop

- **Error:** `Maximum update depth exceeded` on `/order-success`.
- **Cause:** `clearCart` was recreated on every render and used in a `useEffect` dependency array.
- **Solution:** Made `clearCart` stable with `useCallback` in `CartContext`, and wrapped it in a stable callback in `OrderSuccess`.

### 5. Admin video upload did not match backend expectations

- **Errors/risks:**
  - Client uploaded field `video`, while backend expected `file`.
  - Backend upload created `url`/`thumbnail`, while the `Video` model requires `youtubeUrl`.
  - Upload mode was disabled unless a URL was entered.
- **Solution:**
  - Changed `videosApi.upload` to send field `file`.
  - Updated `server/routes/videos.js` to accept `file` and `video`.
  - Updated `videoController.upload` to use `youtubeUrl`, `thumbnailUrl`, `episode`, and `duration`.
  - Allowed upload mode without a URL and handled file upload in `AdminVideoManager`.

### 6. Video URL field mismatch

- **Errors/risks:** `Unashamed`, `VideoSection`, and `AdminVideoManager` used `video.url` and `video.thumbnail`, while the API/model use `youtubeUrl` and `thumbnailUrl`.
- **Solution:** Updated video rendering and thumbnail logic to use `youtubeUrl || url` and `thumbnailUrl || thumbnail`.

### 7. Auth refresh 401 noise on public pages

- **Error:** Browser console showed `401 Unauthorized` from `/api/auth/refresh` on public pages.
- **Cause:** The auth provider attempted token refresh even when no auth cookie existed.
- **Solution:** Skip refresh when no readable `userRole` cookie is present.

### 8. Event registration validation mismatch

- **Error/risk:** Event registration API sent `attendeeName`/`attendeeEmail`, while server validation required `name`/`email`.
- **Solution:** Updated server validation to require `attendeeName` and `attendeeEmail`; API now sends both old and new field names for compatibility.

### 9. Missing resource download API method

- **Error/risk:** `Resources.tsx` called `resourcesApi.download(...)`, but `resourcesApi` did not define it.
- **Solution:** Added `download` to `resourcesApi`.

### 10. 404 page logged console errors

- **Error:** Missing routes logged `console.error("404 Error...")`.
- **Solution:** Changed missing-route logging to `console.info`, so normal 404 visits are not reported as runtime errors.

### 11. Playwright browser missing

- **Error:** Playwright could not launch Chromium because the browser binary was not installed.
- **Solution:** Installed Playwright Chromium with `npx playwright install chromium`.

### 12. External YouTube telemetry aborts

- **Observation:** YouTube embeds can emit aborted `requestfailed` events for external telemetry/stats endpoints.
- **Resolution:** Treated as external third-party telemetry, not an application error.

## Remaining warnings

- ESLint still reports `react-refresh/only-export-components` warnings in shared shadcn/ui/context files. These are non-blocking warnings and do not fail the build or lint command.
- Browserslist reports that its database is 12 months old during production builds. This is a maintenance warning, not a runtime error.
