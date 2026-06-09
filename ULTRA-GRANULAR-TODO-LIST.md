# TTIN Application - Ultra-Granular Implementation Todo List
## Sub-Atomic Task Breakdown for Complete Production Readiness

**Created:** June 9, 2026  
**Status:** Active Development  
**Last Updated:** June 9, 2026

---

## HOW TO USE THIS TODO LIST

1. **Mark tasks as complete:** Change `[ ]` to `[x]` when done
2. **Add completion date:** Include date in parentheses after marking complete
3. **Update status:** Move tasks between sections as work progresses
4. **Add notes:** Include implementation details in comments

---

## SECTION A: CRITICAL INFRASTRUCTURE (Priority: CRITICAL)

### A1: Database Performance & Indexing

#### A1.1 User Collection Indexes
- [ ] Add index on `email` field (unique, for login queries)
- [ ] Add index on `createdAt` field (for sorting)
- [ ] Add index on `role` field (for admin queries)
- [ ] Add compound index on `{ role: 1, createdAt: -1 }`
- [ ] Add text index on `name` for search

**Implementation:**
```javascript
// server/models/User.js
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ name: 'text' });
```

#### A1.2 Product Collection Indexes
- [ ] Add index on `category` field (for filtering)
- [ ] Add index on `isActive` field (for visibility)
- [ ] Add index on `price` field (for sorting)
- [ ] Add compound index on `{ category: 1, isActive: 1 }`
- [ ] Add text index on `name` and `description`
- [ ] Add index on `stock` field (for inventory queries)

#### A1.3 Order Collection Indexes
- [ ] Add index on `user` field (for user order queries)
- [ ] Add index on `status` field (for admin filtering)
- [ ] Add index on `createdAt` field (for date range queries)
- [ ] Add compound index on `{ user: 1, createdAt: -1 }`
- [ ] Add compound index on `{ status: 1, createdAt: -1 }`
- [ ] Add index on `customerEmail` field (for lookup)

#### A1.4 Testimony Collection Indexes
- [ ] Add index on `isApproved` field (for filtering)
- [ ] Add index on `category` field (for filtering)
- [ ] Add index on `isFeatured` field (for featured queries)
- [ ] Add compound index on `{ isApproved: 1, createdAt: -1 }`
- [ ] Add text index on `content` and `name`

#### A1.5 Resource Collection Indexes
- [ ] Add index on `category` field (for filtering)
- [ ] Add index on `type` field (for filtering)
- [ ] Add index on `free` field (for free/paid queries)
- [ ] Add text index on `title` and `description`

#### A1.6 Event Collection Indexes
- [ ] Add index on `upcoming` field (for current events)
- [ ] Add index on `type` field (for filtering)
- [ ] Add index on `date` field (for sorting)

#### A1.7 Review Collection Indexes
- [ ] Add index on `productId` field (for product reviews)
- [ ] Add index on `approved` field (for moderation)
- [ ] Add index on `rating` field (for sorting)
- [ ] Add compound index on `{ productId: 1, approved: 1 }`

#### A1.8 Newsletter Collection Indexes
- [ ] Add index on `email` field (unique)
- [ ] Add index on `active` field (for filtering)
- [ ] Add index on `subscribedAt` field (for sorting)
- [ ] Add compound index on `{ active: 1, subscribedAt: -1 }`

#### A1.9 Video Collection Indexes
- [ ] Add index on `isPublished` field (for visibility)
- [ ] Add index on `type` field (for filtering)
- [ ] Add index on `createdAt` field (for sorting)

#### A1.10 Analytics Collection Indexes
- [ ] Add index on `event` field (for filtering)
- [ ] Add index on `timestamp` field (for time series)
- [ ] Add compound index on `{ event: 1, timestamp: -1 }`
- [ ] Add TTL index for data retention (optional)

**Files to Modify:**
- [ ] `server/models/User.js`
- [ ] `server/models/Product.js`
- [ ] `server/models/Order.js`
- [ ] `server/models/Testimony.js`
- [ ] `server/models/Resource.js`
- [ ] `server/models/Event.js`
- [ ] `server/models/Review.js`
- [ ] `server/models/NewsletterSubscriber.js`
- [ ] `server/models/Video.js`
- [ ] `server/models/AnalyticsEvent.js`

---

### A2: Redis Integration for Rate Limiting

#### A2.1 Redis Setup
- [ ] Install Redis client: `npm install ioredis`
- [ ] Create Redis connection utility: `server/utils/redis.js`
- [ ] Add Redis URL to environment variables
- [ ] Create Redis connection pool
- [ ] Add Redis health check endpoint

#### A2.2 Rate Limiting Migration
- [ ] Create new rate limiter: `server/middleware/rateLimitRedis.js`
- [ ] Implement sliding window algorithm
- [ ] Add key prefix for namespacing (`ttin:ratelimit:*`)
- [ ] Configure different limits per endpoint:
  - [ ] Auth endpoints: 5 requests per minute
  - [ ] API endpoints: 100 requests per minute
  - [ ] Contact form: 3 submissions per hour
  - [ ] Checkout: 10 attempts per hour
- [ ] Add rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] Update `server/index.js` to use Redis rate limiter
- [ ] Add fallback to memory limiter if Redis unavailable

**Files to Create/Modify:**
- [ ] `server/utils/redis.js` (new)
- [ ] `server/middleware/rateLimitRedis.js` (new)
- [ ] `server/middleware/rateLimit.js` (modify to use Redis)
- [ ] `server/index.js` (update imports)
- [ ] `.env.example` (add Redis URL)

---

### A3: Security Headers & CSP

#### A3.1 Helmet Configuration Enhancement
- [ ] Update Helmet configuration in `server/index.js`:
  - [ ] Configure Content Security Policy
  - [ ] Set X-Frame-Options to DENY
  - [ ] Set X-Content-Type-Options to nosniff
  - [ ] Set Strict-Transport-Security (HSTS)
  - [ ] Set Referrer-Policy
  - [ ] Configure Permissions-Policy

#### A3.2 CSP Policy Definition
- [ ] Define default-src policy ('self')
- [ ] Configure script-src ('self', 'unsafe-inline', Google Analytics)
- [ ] Configure style-src ('self', 'unsafe-inline')
- [ ] Configure img-src ('self', data:, https:, Cloudinary)
- [ ] Configure media-src ('self', https:)
- [ ] Configure connect-src ('self', API domain, payment providers)
- [ ] Configure frame-src (YouTube, Instagram)
- [ ] Configure font-src ('self')
- [ ] Add nonce generation for inline scripts

**Files to Modify:**
- [ ] `server/index.js` (Helmet configuration)
- [ ] `docs/CSP.md` (document final policy)

---

## SECTION B: ADMIN PANEL ENHANCEMENTS (Priority: HIGH)

### B1: Pagination Implementation

#### B1.1 Backend Pagination Support
- [ ] Create pagination utility: `server/utils/pagination.js`
- [ ] Add to `GET /api/products`:
  - [ ] Accept `page` and `limit` query params
  - [ ] Return `{ data, pagination: { page, limit, total, totalPages } }`
- [ ] Add to `GET /api/orders`:
  - [ ] Accept `page`, `limit`, `sort`, `filter` params
  - [ ] Return paginated response with metadata
- [ ] Add to `GET /api/testimonies`:
  - [ ] Paginate pending/approved lists separately
- [ ] Add to `GET /api/newsletter/subscribers`:
  - [ ] Support large subscriber lists
- [ ] Add to `GET /api/reviews`:
  - [ ] Paginate with filter support
- [ ] Add to `GET /api/resources`:
  - [ ] Paginate resource library
- [ ] Add to `GET /api/videos`:
  - [ ] Paginate video library

#### B1.2 Frontend Pagination Components
- [ ] Create Pagination component: `src/components/ui/pagination.tsx`
  - [ ] Previous/Next buttons
  - [ ] Page number buttons
  - [ ] Ellipsis for large page counts
  - [ ] Items per page selector
  - [ ] Show "Page X of Y" text
- [ ] Create usePagination hook: `src/hooks/use-pagination.ts`
  - [ ] Manage page state
  - [ ] Calculate visible pages
  - [ ] Handle URL sync

#### B1.3 Admin Page Updates
- [ ] Update AdminProductManager:
  - [ ] Add pagination to product grid
  - [ ] Update React Query to use paginated query
  - [ ] Add page size selector (10, 25, 50)
- [ ] Update AdminOrders:
  - [ ] Add pagination to orders table
  - [ ] Preserve filters across page changes
- [ ] Update AdminNewsletterManager:
  - [ ] Paginate subscriber list
  - [ ] Add search + pagination combo
- [ ] Update AdminReviews:
  - [ ] Paginate reviews table
- [ ] Update AdminTestimonialManager:
  - [ ] Paginate testimonials

**Files to Create/Modify:**
- [ ] `server/utils/pagination.js` (new)
- [ ] `src/components/ui/pagination.tsx` (new)
- [ ] `src/hooks/use-pagination.ts` (new)
- [ ] Multiple server route files (add pagination)
- [ ] Multiple admin page files (add pagination UI)

---

### B2: Bulk Operations

#### B2.1 Backend Bulk Endpoints
- [ ] Create `POST /api/products/bulk-delete`
  - [ ] Accept array of product IDs
  - [ ] Validate all IDs exist
  - [ ] Delete in transaction
  - [ ] Return deleted count
- [ ] Create `POST /api/products/bulk-update-status`
  - [ ] Accept IDs and status
  - [ ] Update all in transaction
- [ ] Create `POST /api/orders/bulk-update-status`
  - [ ] Accept order IDs and new status
  - [ ] Update with transaction
  - [ ] Send notification emails
- [ ] Create `POST /api/newsletter/bulk-unsubscribe`
  - [ ] Accept array of emails
  - [ ] Update active status
- [ ] Create `POST /api/testimonies/bulk-approve`
  - [ ] Accept array of IDs
  - [ ] Approve all
- [ ] Create `POST /api/testimonies/bulk-reject`
  - [ ] Accept array of IDs
  - [ ] Delete or mark rejected
- [ ] Create `POST /api/reviews/bulk-approve`
  - [ ] Accept array of IDs
  - [ ] Approve all
- [ ] Create `POST /api/reviews/bulk-reject`
  - [ ] Accept array of IDs
  - [ ] Reject all

#### B2.2 Frontend Bulk UI Components
- [ ] Create BulkActionsBar component:
  - [ ] Show selected count
  - [ ] Action dropdown (delete, update status, etc.)
  - [ ] Select all checkbox
  - [ ] Clear selection button
- [ ] Create useBulkSelection hook:
  - [ ] Track selected items
  - [ ] Toggle selection
  - [ ] Select all/none

#### B2.3 Admin Page Bulk Integration
- [ ] Update AdminProductManager:
  - [ ] Add row checkboxes
  - [ ] Add bulk delete action
  - [ ] Add bulk status change
- [ ] Update AdminOrders:
  - [ ] Add row checkboxes
  - [ ] Add bulk status update
- [ ] Update AdminNewsletterManager:
  - [ ] Add bulk unsubscribe
- [ ] Update AdminTestimonialManager:
  - [ ] Add bulk approve/reject
- [ ] Update AdminReviews:
  - [ ] Add bulk approve/reject

**Files to Create/Modify:**
- [ ] Multiple server route files (bulk endpoints)
- [ ] `src/components/BulkActionsBar.tsx` (new)
- [ ] `src/hooks/useBulkSelection.ts` (new)
- [ ] Multiple admin page files

---

### B3: Search & Filter Enhancements

#### B3.1 Backend Search Implementation
- [ ] Enhance `GET /api/products`:
  - [ ] Add `search` query param
  - [ ] Search in name, description, tags
  - [ ] Add `minPrice` and `maxPrice` filters
  - [ ] Add `inStock` boolean filter
- [ ] Enhance `GET /api/orders`:
  - [ ] Add search by customer name, email, order ID
  - [ ] Add date range filter (startDate, endDate)
  - [ ] Add status multi-select filter
- [ ] Enhance `GET /api/testimonies`:
  - [ ] Add search by name, content, location
  - [ ] Add category multi-select
  - [ ] Add date range filter
- [ ] Enhance `GET /api/resources`:
  - [ ] Add search by title, description
  - [ ] Add type filter
  - [ ] Add free/paid filter

#### B3.2 Frontend Search Components
- [ ] Create AdvancedSearch component:
  - [ ] Search input with debounce
  - [ ] Filter chips/tags
  - [ ] Clear all filters button
  - [ ] Filter count badge
- [ ] Create FilterDrawer component:
  - [ ] Slide-out filter panel
  - [ ] Multiple filter types (select, range, checkbox)
  - [ ] Apply/Reset buttons
- [ ] Update useQuery hooks to include search params

#### B3.3 Admin Page Search Integration
- [ ] Update AdminProductManager:
  - [ ] Add product search
  - [ ] Add price range filter
  - [ ] Add stock status filter
- [ ] Update AdminOrders:
  - [ ] Add customer search
  - [ ] Add date range picker
  - [ ] Add status filter dropdown
- [ ] Update AdminTestimonialManager:
  - [ ] Add search by name/content
  - [ ] Add category filter
- [ ] Update AdminResourceManager:
  - [ ] Add resource search
  - [ ] Add type filter

**Files to Create/Modify:**
- [ ] Multiple server route files
- [ ] `src/components/AdvancedSearch.tsx` (new)
- [ ] `src/components/FilterDrawer.tsx` (new)
- [ ] Multiple admin page files

---

## SECTION C: USER EXPERIENCE ENHANCEMENTS (Priority: HIGH)

### C1: Keyboard Shortcuts & Accessibility

#### C1.1 Keyboard Shortcuts Implementation
- [ ] Create useKeyboardShortcuts hook:
  - [ ] Register keyboard combinations
  - [ ] Handle key events
  - [ ] Prevent default when needed
- [ ] Add shortcuts to Admin Dashboard:
  - [ ] `Cmd/Ctrl + K` - Open command palette
  - [ ] `Cmd/Ctrl + /` - Focus search
  - [ ] `G` then `D` - Go to Dashboard
  - [ ] `G` then `P` - Go to Products
  - [ ] `G` then `O` - Go to Orders
  - [ ] `G` then `C` - Go to Content
  - [ ] `G` then `S` - Go to Settings
  - [ ] `N` then `P` - New Product
  - [ ] `N` then `V` - New Video
  - [ ] `Escape` - Close modals
- [ ] Create KeyboardShortcutsHelp component:
  - [ ] Show all available shortcuts
  - [ ] `?` key to open help
  - [ ] Categorized by context

#### C1.2 Command Palette
- [ ] Create CommandPalette component:
  - [ ] Modal with search input
  - [ ] List of available actions
  - [ ] Group by category
  - [ ] Keyboard navigation (arrow keys, enter)
  - [ ] Recent commands section
- [ ] Add commands:
  - [ ] Navigate to all admin pages
  - [ ] Quick actions (Add Product, etc.)
  - [ ] Toggle settings
  - [ ] Search content

#### C1.3 Accessibility Improvements
- [ ] Add ARIA labels to all icon buttons
- [ ] Add aria-describedby to form inputs
- [ ] Ensure focus management in modals
- [ ] Add skip links for navigation
- [ ] Ensure color contrast compliance (WCAG AA)
- [ ] Add keyboard navigation to tables
- [ ] Add screen reader announcements for async actions
- [ ] Test with keyboard-only navigation

**Files to Create/Modify:**
- [ ] `src/hooks/useKeyboardShortcuts.ts` (new)
- [ ] `src/components/CommandPalette.tsx` (new)
- [ ] `src/components/KeyboardShortcutsHelp.tsx` (new)
- [ ] Multiple component files (add ARIA attributes)

---

### C2: PWA & Service Worker

#### C2.1 Service Worker Setup
- [ ] Create service worker: `public/sw.js`
  - [ ] Install event - cache static assets
  - [ ] Fetch event - cache-first strategy
  - [ ] Activate event - cleanup old caches
  - [ ] Push event - handle push notifications
  - [ ] Sync event - background sync
- [ ] Create service worker registration: `src/registerSW.ts`
  - [ ] Register SW in production only
  - [ ] Handle updates
  - [ ] Show update notification

#### C2.2 Web App Manifest
- [ ] Update `public/manifest.json`:
  - [ ] App name and short name
  - [ ] Icons (all sizes: 72, 96, 128, 144, 152, 192, 384, 512)
  - [ ] Theme color and background color
  - [ ] Display mode (standalone)
  - [ ] Start URL
  - [ ] Scope
  - [ ] Categories
  - [ ] Screenshots for install prompt

#### C2.3 Caching Strategy
- [ ] Cache static assets (JS, CSS, fonts)
- [ ] Cache API responses with TTL
- [ ] Cache images with size limits
- [ ] Implement cache cleanup
- [ ] Add offline fallback page

#### C2.4 Background Sync
- [ ] Queue failed API calls
- [ ] Sync when connection restored
- [ ] Show sync status to user
- [ ] Handle conflicts

#### C2.5 Push Notifications (Optional)
- [ ] Request notification permission
- [ ] Subscribe to push service
- [ ] Handle push events
- [ ] Show notification UI

**Files to Create/Modify:**
- [ ] `public/sw.js` (new)
- [ ] `public/manifest.json` (update)
- [ ] `src/registerSW.ts` (new)
- [ ] `src/main.tsx` (register SW)

---

### C3: Image Optimization

#### C3.1 Responsive Images
- [ ] Update LazyImage component:
  - [ ] Add srcset support
  - [ ] Generate multiple sizes
  - [ ] Use sizes attribute
  - [ ] Implement art direction (picture element)
- [ ] Add WebP/AVIF support:
  - [ ] Generate modern formats
  - [ ] Fallback to JPEG/PNG
  - [ ] Use type attribute

#### C3.2 Image CDN Integration
- [ ] Configure Cloudinary transformations:
  - [ ] Auto-format (f_auto)
  - [ ] Auto-quality (q_auto)
  - [ ] Responsive breakpoints
  - [ ] Lazy loading placeholder
- [ ] Update MediaPicker to generate transformed URLs
- [ ] Add image size validation on upload

#### C3.3 Blur Placeholder
- [ ] Generate blur hash for images
- [ ] Show blur while loading
- [ ] Fade in on load complete

**Files to Modify:**
- [ ] `src/components/LazyImage.tsx`
- [ ] `src/components/MediaPicker.tsx`

---

## SECTION D: TESTING & QUALITY ASSURANCE (Priority: HIGH)

### D1: Unit Testing

#### D1.1 Test Setup
- [ ] Verify Vitest configuration
- [ ] Add testing-library/react
- [ ] Add MSW (Mock Service Worker)
- [ ] Add test utilities

#### D1.2 Component Tests
- [ ] Test Button component:
  - [ ] Renders correctly
  - [ ] Handles click events
  - [ ] Shows loading state
  - [ ] Disabled state works
- [ ] Test Input component:
  - [ ] Renders with label
  - [ ] Handles value changes
  - [ ] Shows error state
  - [ ] Required validation
- [ ] Test Modal/Dialog:
  - [ ] Opens on trigger
  - [ ] Closes on overlay click
  - [ ] Closes on Escape key
  - [ ] Focus trap works
- [ ] Test ProductCard:
  - [ ] Renders product info
  - [ ] Shows price correctly
  - [ ] Handles wishlist toggle
  - [ ] Opens quick view

#### D1.3 Hook Tests
- [ ] Test useCart:
  - [ ] Adds items
  - [ ] Updates quantities
  - [ ] Removes items
  - [ ] Calculates totals
  - [ ] Persists to localStorage
- [ ] Test useWishlist:
  - [ ] Toggles items
  - [ ] Persists to localStorage
- [ ] Test useAuth:
  - [ ] Login sets user
  - [ ] Logout clears user
  - [ ] Token refresh works

#### D1.4 Utility Tests
- [ ] Test formatCurrency:
  - [ ] Formats USD correctly
  - [ ] Formats other currencies
- [ ] Test validation schemas:
  - [ ] Email validation
  - [ ] Password validation
  - [ ] Required fields

**Files to Create:**
- [ ] `src/test/components/*.test.tsx`
- [ ] `src/test/hooks/*.test.ts`
- [ ] `src/test/utils/*.test.ts`

---

### D2: Integration Testing

#### D2.1 API Integration Tests
- [ ] Test newsletter subscription flow:
  - [ ] Submit valid email
  - [ ] Handle duplicate email
  - [ ] Handle invalid email
  - [ ] Handle server error
- [ ] Test checkout flow:
  - [ ] Create order successfully
  - [ ] Handle stock shortage
  - [ ] Handle payment failure
  - [ ] Verify order created in DB
- [ ] Test testimony submission:
  - [ ] Submit with valid data
  - [ ] Handle validation errors
  - [ ] Verify saved to DB

#### D2.2 Page Integration Tests
- [ ] Test Shop page:
  - [ ] Loads products
  - [ ] Filter by category
  - [ ] Add to cart
  - [ ] Navigate to checkout
- [ ] Test Cart page:
  - [ ] Shows cart items
  - [ ] Update quantities
  - [ ] Remove items
  - [ ] Navigate to checkout

**Files to Create:**
- [ ] `src/test/integration/*.test.ts`

---

### D3: E2E Testing with Playwright

#### D3.1 Test Setup
- [ ] Verify Playwright configuration
- [ ] Add test fixtures
- [ ] Add auth setup for admin tests
- [ ] Configure test database

#### D3.2 User Flow Tests
- [ ] Test visitor journey:
  - [ ] Homepage loads
  - [ ] Navigate to About
  - [ ] View testimonies
  - [ ] Subscribe to newsletter
- [ ] Test customer journey:
  - [ ] Browse shop
  - [ ] Add product to cart
  - [ ] Complete checkout
  - [ ] Verify order success
- [ ] Test preacher journey:
  - [ ] View testimonies
  - [ ] Submit testimony
  - [ ] Verify submission received

#### D3.3 Admin Flow Tests
- [ ] Test admin login:
  - [ ] Login with valid credentials
  - [ ] Reject invalid credentials
  - [ ] Redirect to dashboard
- [ ] Test product management:
  - [ ] Create new product
  - [ ] Edit product
  - [ ] Delete product
  - [ ] Verify on frontend
- [ ] Test order management:
  - [ ] View orders
  - [ ] Update order status
  - [ ] Verify status change

#### D3.4 Critical Path Tests
- [ ] Test payment flows:
  - [ ] Paystack payment
  - [ ] Flutterwave payment
  - [ ] Stripe payment
  - [ ] Handle payment cancellation
- [ ] Test error scenarios:
  - [ ] Network error handling
  - [ ] Form validation errors
  - [ ] 404 page display

**Files to Create:**
- [ ] `e2e/user-flows.spec.ts`
- [ ] `e2e/admin-flows.spec.ts`
- [ ] `e2e/payments.spec.ts`
- [ ] `e2e/errors.spec.ts`

---

## SECTION E: MONITORING & OBSERVABILITY (Priority: MEDIUM)

### E1: Error Tracking

#### E1.1 Sentry Integration
- [ ] Install Sentry SDK: `npm install @sentry/react @sentry/node`
- [ ] Configure Sentry in frontend:
  - [ ] Initialize in main.tsx
  - [ ] Set environment
  - [ ] Configure release
  - [ ] Set user context
- [ ] Configure Sentry in backend:
  - [ ] Initialize in server/index.js
  - [ ] Add error handler middleware
  - [ ] Track API errors
- [ ] Add breadcrumbs for user actions
- [ ] Configure alerts for critical errors

**Files to Modify:**
- [ ] `src/main.tsx`
- [ ] `server/index.js`

---

### E2: Analytics & Monitoring

#### E2.1 Google Analytics 4
- [ ] Install gtag.js
- [ ] Configure GA4 measurement ID
- [ ] Track page views
- [ ] Track events:
  - [ ] Add to cart
  - [ ] Begin checkout
  - [ ] Purchase
  - [ ] Newsletter signup
  - [ ] Resource download
  - [ ] Video play

#### E2.2 Custom Analytics Dashboard
- [ ] Enhance AdminAnalytics:
  - [ ] Add conversion funnel visualization
  - [ ] Add revenue metrics
  - [ ] Add user retention chart
  - [ ] Add traffic source breakdown

#### E2.3 Performance Monitoring
- [ ] Add Web Vitals tracking
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Track API response times
- [ ] Set up performance budgets

**Files to Create/Modify:**
- [ ] `src/lib/analytics.ts` (enhance)
- [ ] `src/hooks/useWebVitals.ts` (new)
- [ ] `server/middleware/performance.js` (new)

---

### E3: Logging

#### E3.1 Structured Logging
- [ ] Install Winston: `npm install winston`
- [ ] Create logger utility: `server/utils/logger.js`
- [ ] Configure log levels
- [ ] Add request logging middleware
- [ ] Log all errors with context
- [ ] Rotate log files

#### E3.2 Audit Logging
- [ ] Create audit log model
- [ ] Log admin actions:
  - [ ] Login/logout
  - [ ] Product changes
  - [ ] Order status updates
  - [ ] Content changes
- [ ] Add audit log viewer in admin

**Files to Create:**
- [ ] `server/utils/logger.js` (new)
- [ ] `server/models/AuditLog.js` (new)
- [ ] `server/middleware/audit.js` (new)

---

## SECTION F: ADVANCED FEATURES (Priority: LOW)

### F1: Multi-Language Support (i18n)

#### F1.1 i18n Setup
- [ ] Install react-i18next: `npm install react-i18next i18next`
- [ ] Create i18n config: `src/i18n/config.ts`
- [ ] Set up translation files structure
- [ ] Create language switcher component

#### F1.2 Translation Implementation
- [ ] Extract all English text
- [ ] Create translation keys
- [ ] Add translations for:
  - [ ] Spanish (es)
  - [ ] French (fr)
  - [ ] Portuguese (pt)
- [ ] Translate all page content
- [ ] Translate admin interface

**Files to Create:**
- [ ] `src/i18n/config.ts` (new)
- [ ] `public/locales/*/translation.json`

---

### F2: Advanced Search

#### F2.1 Full-Text Search
- [ ] Add MongoDB text indexes
- [ ] Create search API endpoint
- [ ] Implement faceted search
- [ ] Add search suggestions
- [ ] Add search analytics

#### F2.2 Search UI
- [ ] Enhance Search page:
  - [ ] Add filters sidebar
  - [ ] Add sort options
  - [ ] Add pagination
  - [ ] Add result highlights

**Files to Modify:**
- [ ] `src/pages/Search.tsx`
- [ ] `server/routes/search.js`

---

### F3: Email System

#### F3.1 Email Templates
- [ ] Create email template system
- [ ] Design templates:
  - [ ] Welcome email
  - [ ] Order confirmation
  - [ ] Order shipped
  - [ ] Password reset
  - [ ] Newsletter
- [ ] Add template editor in admin

#### F3.2 Email Automation
- [ ] Welcome series for new subscribers
- [ ] Abandoned cart reminders
- [ ] Post-purchase follow-up
- [ ] Restock notifications

**Files to Create:**
- [ ] `server/utils/emailTemplates/` (new directory)
- [ ] `server/services/emailService.js` (new)

---

## SECTION G: DOCUMENTATION (Priority: MEDIUM)

### G1: API Documentation
- [ ] Set up Swagger/OpenAPI
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Document authentication
- [ ] Host documentation

### G2: Code Documentation
- [ ] Add JSDoc comments to utilities
- [ ] Document component props
- [ ] Add README for complex features
- [ ] Document environment variables

### G3: User Documentation
- [ ] Create admin user guide
- [ ] Create content editor guide
- [ ] Document workflows
- [ ] Create video tutorials

**Files to Create:**
- [ ] `docs/API.md`
- [ ] `docs/ADMIN-GUIDE.md`
- [ ] `docs/CONTRIBUTING.md`

---

## SECTION H: PERFORMANCE OPTIMIZATIONS (Priority: MEDIUM)

### H1: Bundle Optimization
- [ ] Analyze bundle size
- [ ] Code split heavy components
- [ ] Tree shake unused code
- [ ] Optimize imports

### H2: API Optimization
- [ ] Add response compression
- [ ] Implement request batching
- [ ] Add Redis caching layer
- [ ] Optimize database queries

### H3: Frontend Optimization
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize re-renders with React.memo
- [ ] Use useMemo/useCallback appropriately
- [ ] Preload critical resources

---

## PROGRESS TRACKING

### Legend
- `[ ]` = Not started
- `[-]` = In progress
- `[x]` = Completed
- `[~]` = Deferred

### Current Statistics
- Total Tasks: 350+
- Completed: TBD
- In Progress: TBD
- Not Started: TBD

### Last Updated
June 9, 2026

---

*This todo list is a living document. Update it as work progresses and new requirements emerge.*
