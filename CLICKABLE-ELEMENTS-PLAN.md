# TTIN Website - Clickable Elements & Functionality Plan

## Implementation Status: COMPLETED ✅

This document provides a comprehensive breakdown of every clickable element in the TTIN website, including current functionality, required enhancements, and backend requirements.

**Last Updated:** 2026-05-28

## Implementation Summary

### ✅ Implemented Features:
- **Analytics Tracking** - Created `src/lib/analytics.ts` with event tracking utilities
- **URL Sync for Filters** - Testimonies and Events pages sync category/type to URL params
- **Contact Form** - Connected to backend API with Zod validation
- **Event Registration** - Implemented registration flow with tracking
- **Download Tracking** - Resources page has tracking function ready
- **Wishlist** - Created WishlistContext with localStorage persistence
- **Error Boundary** - Added global error handling component
- **Accessibility** - Added aria-labels and ARIA attributes to interactive elements
- **Protected Routes** - Admin routes are now protected
- **Auth Provider** - Added to App.tsx context

### 📝 Files Created:
- `src/lib/analytics.ts` - Analytics tracking utilities
- `src/api/contact.ts` - Contact API client
- `src/api/events.ts` - Events API with registration
- `src/context/WishlistContext.tsx` - Wishlist state management
- `src/components/ErrorBoundary.tsx` - Global error boundary
- `src/components/ProtectedRoute.tsx` - Auth guard
- `src/components/LazyImage.tsx` - Image lazy loading

### 🔧 Files Modified:
- `src/App.tsx` - Added AuthProvider, WishlistProvider, ErrorBoundary, ProtectedRoute
- `src/pages/Contact.tsx` - Added form validation and API integration
- `src/pages/Testimonies.tsx` - Added URL sync and share functionality
- `src/pages/Events.tsx` - Added registration flow and URL sync
- `src/pages/Resources.tsx` - Added download tracking function
- `src/pages/Shop.tsx` - Added wishlist integration
- `vite.config.ts` - Optimized chunk splitting

### ⚠️ Partially Connected (Needs Backend):
- **Shop** - API client ready, uses mock data
- **Testimonies** - API client ready, uses mock data
- **Resources** - Tracking ready, uses mock data

### Backend API Endpoints Required:
```
POST   /api/contact              # Contact form submission
POST   /api/contact/spam-check   # Spam protection
POST   /api/events/register      # Event registration
POST   /api/events/waitlist      # Event waitlist
POST   /api/resources/download   # Download tracking
POST   /api/analytics            # General analytics
GET    /api/countries            # Countries with preacher counts
GET    /api/events/count         # Event registration count
GET    /api/products             # Product catalog
GET    /api/testimonials         # Testimonials list
GET    /api/resources            # Resource library
```

---

## 1. NAVIGATION (Navbar.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Logo (TTIN)** | Top-left | Links to `/` | Track as "view_home" event |
| **Nav Links** | Desktop menu | Navigate to routes | Add URL param sync, analytics tracking |
| **Mobile Menu Toggle** | Mobile header | Opens/closes menu | Add accessibility (aria-expanded) |
| **Layout Toggle** | Desktop/mobile | Switches between `default`/`sympos` | Persist preference, track change |

**Backend Requirements:**
- None (frontend only)

---

## 2. HOME PAGE (Index.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Join The Movement** | Hero CTA | Links to `/about` | Track click, add UTM params |
| **Watch Unashamed** | Hero CTA | Links to `/unashamed` | Track click |
| **Newsletter Submit** | Footer | Validates → API call | Add rate limiting, double opt-in, success state persistence |
| **Featured Cards** (Events/Shop/Resources) | Bottom section | Links to pages | Track as "view_category" events |
| **Scroll Indicator** | Bottom | Smooth scroll | Add ARIA label for accessibility |
| **Countries** | Footer list | Static | Add click to filter testimonials by country |

**Backend Requirements:**
- `/api/analytics/cta-click` - POST for tracking
- `/api/analytics/page-view` - POST for page views

---

## 3. ABOUT PAGE (About.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Team Member Cards** | Leadership section | Placeholder only | Add actual team data, social links, bio modals |
| **Values Cards** | Values section | Static | Add hover animations, detail modals |

**Backend Requirements:**
- `/api/team` - GET for team members
- `/api/team/{id}` - GET for individual bio

---

## 4. TESTIMONIES PAGE (Testimonies.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Category Filter** | Sticky header | Filter local state | URL sync (`?category=evangelism`), analytics |
| **WorldMap** | Interactive map | Hover shows tooltip, click selects | Add country click to filter testimonials |
| **Video Testimonial Play** | Video cards | Opens URL | Add modal player, watch time tracking |
| **Written Testimony** | Grid | Static display | Add expand/detail view, share button |
| **TestimonySubmissionForm** | Bottom CTA | Form submit → API | Add image upload, preview, success redirect |
| **Book Testimonials** | Bottom section | Static | Add star ratings, cover images |

**Backend Requirements:**
- `/api/testimonials/submit` - POST with image upload support
- `/api/testimonials/approve` - PUT for admin approval
- `/api/analytics/testimony-view` - POST for view tracking
- `/api/analytics/video-view` - POST for video plays

---

## 5. SHOP PAGE (Shop.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Category Filter** | Header | Local state only | URL sync, product count badges |
| **Product Card** | Grid | Click → modal | Add wishlist, quick view analytics |
| **Quick View** | Product card hover | Opens modal | Add size selector, stock indicator |
| **Add to Cart** | Modal | Updates localStorage | Add success toast, continue shopping |
| **Quantity Selector** | Modal/Cart | Updates state | Validate max stock |

**Backend Requirements:**
- `/api/products` - GET with search/filter
- `/api/products/{id}/stock` - GET for real-time stock
- `/api/wishlist` - POST/GET/DELETE

---

## 6. CART PAGE (Cart.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Remove Item** | Cart row | Removes from localStorage | Add confirmation dialog |
| **Quantity +/-** | Cart row | Updates localStorage | Validate stock limits |
| **Clear Cart** | - | - | Add confirmation |
| **Proceed to Checkout** | Bottom | Links to `/checkout` | Track conversion funnel |

**Backend Requirements:**
- `/api/cart/persist` - POST for localStorage sync
- `/api/cart/items` - CRUD operations

---

## 7. CHECKOUT PAGE (Checkout.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Form Fields** | Checkout form | Local state | Add address validation, auto-fill |
| **Payment Method Select** | Form | Paystack/Flutterwave | Add Stripe option, show/paypal |
| **Place Order** | Submit button | Initializes payment | Add order ID tracking, success callback |
| **Order Summary** | Sidebar | Static display | Add edit links, promo code |

**Backend Requirements:**
- `/api/orders` - POST for order creation
- `/api/orders/{id}` - GET for order status
- `/api/payments/webhook` - POST for payment callbacks
- `/api/promo` - POST for discount validation

---

## 8. RESOURCES PAGE (Resources.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Category Filter** | Header | Local state | URL sync |
| **Download Button** | Resource card | Opens Google Drive | Add tracking, show download count |
| **WhatsApp Join** | Community CTA | Opens WhatsApp | Track click, add member count |

**Backend Requirements:**
- `/api/resources/download` - POST for download tracking
- `/api/resources/{id}/count` - GET for download count
- `/api/resources/{id}/preview` - GET for preview

---

## 9. CONTACT PAGE (Contact.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Contact Form** | Form | Shows toast only | Connect to backend, add spam protection, validation |
| **WhatsApp Group** | Community CTA | Opens WhatsApp | Track click, add member count |
| **Email Link** | Contact info | Opens mailto | Add tracking |
| **Instagram Link** | Social | Opens IG | Add tracking |

**Backend Requirements:**
- `/api/contact` - POST for form submission
- `/api/contact/spam-check` - POST for validation
- `/api/contact/track` - POST for click tracking

---

## 10. EVENTS PAGE (Events.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **Event Type Filter** | Header | Local state | URL sync |
| **Register Button** | Event card | Static | Add registration flow, waitlist |
| **Event Details** | Card | Static | Add modal with full details |

**Backend Requirements:**
- `/api/events/register` - POST for registration
- `/api/events/waitlist` - POST for waitlist
- `/api/events/{id}/count` - GET for registration count
- `/api/events/{id}/details` - GET for modal data

---

## 11. UNASHAMED PAGE (Unashamed.tsx)

| Element | Location | Current Flow | Required Enhancements |
|---------|----------|--------------|----------------------|
| **YouTube Episode** | Video grid | Opens YouTube | Add view tracking, watch time |
| **Instagram Shorts** | Shorts grid | Opens IG | Add view tracking |
| **Featured Play** | Hero section | Opens YouTube | Add play count |

**Backend Requirements:**
- `/api/analytics/video-view` - POST
- `/api/analytics/instagram-view` - POST
- `/api/videos/related` - GET for related videos

---

## 12. ADMIN PANEL

### AdminLogin.tsx
| Element | Enhancement |
|---------|-------------|
| **Login** | Add rate limiting, remember me, forgot password flow |
| **Password Toggle** | Add accessibility label |

### AdminDashboard.tsx
| Element | Enhancement |
|---------|-------------|
| **Sidebar Links** | Add role-based visibility |
| **Quick Actions** | Connect to actual pages |
| **Stats Cards** | Connect to real API data |

### AdminTestimonialManager.tsx
| Element | Enhancement |
|---------|-------------|
| **Approve** | Connect to API, add notification |
| **Reject** | Connect to API |
| **Feature** | Connect to API |

### AdminNewsletterManager.tsx
| Element | Enhancement |
|---------|-------------|
| **Import/Export** | Connect to backend |
| **Send Campaign** | Connect to email service |

### AdminVideoManager.tsx
| Element | Enhancement |
|---------|-------------|
| **Upload** | Connect to storage, add transcoding |
| **Analytics** | Connect to video analytics |

---

## 13. FOOTER (Footer.tsx)

| Element | Current | Enhancement |
|---------|---------|-------------|
| **Give Now** | Opens `#donate` | Connect to payment page |
| **Social Links** | Static URLs | Add tracking, open in new tab |
| **Scroll to Top** | Smooth scroll | Add ARIA label |

---

## 14. WORLDMAP COMPONENT (WorldMap.tsx)

| Element | Enhancement |
|---------|-------------|
| **Country Squares** | Add click to filter testimonials, show modal with preacher list |
| **Tooltip** | Add more info (preacher names, recent activity) |

**Backend Requirements:**
- `/api/countries` - GET with preacher data
- `/api/countries/{code}` - GET for detailed view

---

## 15. PODCAST PLAYER (PodcastPlayer.tsx)

| Element | Enhancement |
|---------|-------------|
| **Play/Pause** | Add actual audio element, progress bar |
| **Next/Prev** | Connect to real episode list |
| **Playlist** | Add download option for each episode |

**Backend Requirements:**
- `/api/podcasts` - GET episode list
- `/api/podcasts/{id}` - GET individual episode
- `/api/podcasts/{id}/download` - GET for audio file

---

## 16. SEO COMPONENT (SEO.tsx)

| Element | Enhancement |
|---------|-------------|
| **Meta Tags** | Add canonical URLs, structured data |

**Backend Requirements:**
- `/api/settings/site` - GET for site metadata

---

## 17. MOBILE MENU (Navbar.tsx)

| Element | Enhancement |
|---------|-------------|
| **Close Button** | Already implemented |
| **Nav Links** | Add active state styling |
| **Layout Toggle** | Add visual indicator for current mode |

---

## 18. BACKEND API SUMMARY

### Core APIs
```
POST   /api/contact              # Contact form submission
POST   /api/contact/spam-check   # Spam protection
POST   /api/events/register      # Event registration
POST   /api/events/waitlist      # Event waitlist
POST   /api/resources/download   # Download tracking
GET    /api/analytics/video-view # Video analytics
GET    /api/analytics/ig-view    # Instagram view tracking
POST   /api/payments/webhook     # Payment webhook
GET    /api/orders/{id}/status   # Order status check
GET    /api/countries            # Countries with preacher counts
GET    /api/events/count         # Event registration count
```

### User-Facing APIs
```
GET    /api/testimonials         # Public testimonials
POST   /api/testimonials/submit  # Submit new testimony
GET    /api/products             # Product catalog
GET    /api/products/{id}        # Product detail
GET    /api/resources            # Resource library
GET    /api/events               # Event listings
GET    /api/videos               # Video content
```

### Admin APIs
```
GET    /api/admin/stats          # Dashboard stats
PUT    /api/admin/testimonials/{id} # Approve/reject
PUT    /api/admin/content        # Update page content
POST   /api/admin/upload         # File uploads
GET    /api/admin/analytics      # Analytics data
```

---

## 19. ANALYTICS TRACKING MATRIX

| Event | Category | Action | Label |
|-------|----------|--------|-------|
| CTA Click | navigation | click | [button_name] |
| Form Submit | engagement | submit | [form_name] |
| Add to Cart | ecommerce | add | [product_id] |
| Purchase | ecommerce | purchase | [order_id] |
| Download | engagement | download | [resource_id] |
| Video Play | engagement | play | [video_id] |
| Event Register | engagement | register | [event_id] |
| Testimony Submit | engagement | submit | [testimony_id] |

---

## 20. ERROR HANDLING REQUIREMENTS

| Component | Error States | User Feedback |
|-----------|--------------|---------------|
| Contact Form | Network failure, validation errors | Toast with retry option |
| Newsletter | Already subscribed, invalid email | Toast with specific message |
| Add to Cart | Out of stock, network error | Toast, disable button |
| Checkout | Payment failure, validation | Modal with error details |
| File Upload | Size limit, type error | Inline validation message |
| API Errors | 4xx, 5xx responses | Toast with generic message |

---

## 21. ACCESSIBILITY REQUIREMENTS

- All buttons: `aria-label` for icon-only buttons
- Forms: `aria-describedby` for error messages
- Modals: `aria-modal="true"`, focus trap
- Navigation: `aria-current="page"` for active links
- Videos: Captions, keyboard controls
- Tables: Proper headers, scope attributes