# Admin Panel — Sub-Granular Implementation Checklist

**Created:** June 5, 2026  
**Status:** Frontend COMPLETE — Checklist traces every component, state, API call, UI pattern, and interaction point across all 12 admin pages.

---

## CHECKLIST INDEX

| # | Area | File(s) | Status |
|---|------|---------|--------|
| 0 | Infrastructure | AdminLayout, AdminSidebar, App.tsx | ✅ |
| 1 | AdminDashboard | AdminDashboard.tsx | ⚠️ |
| 2 | AdminContentManager | AdminContentManager.tsx | ⚠️ |
| 3 | AdminMedia | AdminMedia.tsx | ⚠️ |
| 4 | AdminProductManager | AdminProductManager.tsx | ⚠️ |
| 5 | AdminVideoManager | AdminVideoManager.tsx | ⚠️ |
| 6 | AdminTestimonialManager | AdminTestimonialManager.tsx | ⚠️ |
| 7 | AdminNewsletterManager | AdminNewsletterManager.tsx | ⚠️ |
| 8 | AdminOrders | AdminOrders.tsx | ⚠️ |
| 9 | AdminReviews | AdminReviews.tsx | ⚠️ |
| 10 | AdminAnalytics | AdminAnalytics.tsx | ⚠️ |
| 11 | AdminSettings | AdminSettings.tsx | ⚠️ |
| 12 | Shared Components | MediaPicker, SearchBar | ⚠️ |

Legend: ✅ = Complete | ⚠️ = Mostly complete, gaps noted below | ❌ = Missing

---

## 0. INFRASTRUCTURE

### AdminLayout (`src/components/AdminLayout.tsx`)
- [x] `AdminLayout` component created
- [x] Wraps content in `SidebarProvider defaultOpen`
- [x] Renders `EnhancedAdminSidebar` from `AdminSidebar.tsx`
- [x] Renders `SidebarInset` for content area
- [x] Sticky header with `h-14`, `border-b`, `backdrop-blur`
- [x] `SidebarTrigger` in header (mobile toggle)
- [x] `SearchBar` component in header (hidden on mobile)
- [x] `<Outlet />` for nested routes
- [x] Content max-width `max-w-7xl`, centered, padding `p-6 md:p-8`

### AdminSidebar (`src/components/AdminSidebar.tsx`)
- [x] Uses shadcn/ui `Sidebar` with `collapsible="icon"`, `variant="inset"`
- [x] `SidebarProvider` context available
- [x] `AdminSidebar` exports named export
- [x] `AdminSidebarProps` interface with `stats?` prop
- [x] Logo section — gradient circle with "T" letter, "TTIN Admin" + "Management Console"
- [x] `SidebarHeader` with border-b
- [x] `SidebarContent` with `px-2 py-2`
- [x] `Main Menu` group with all 11 nav items:
  - [x] Dashboard → `/admin/dashboard`
  - [x] Content → `/admin/content`
  - [x] Media Library → `/admin/media`
  - [x] Videos → `/admin/videos`
  - [x] Products → `/admin/products`
  - [x] Orders → `/admin/orders`
  - [x] Resources → `/admin/resources`
  - [x] Reviews → `/admin/reviews`
  - [x] Newsletter → `/admin/newsletter`
  - [x] Analytics → `/admin/analytics`
  - [x] Settings → `/admin/settings`
- [x] Each `SidebarMenuButton` has icon + label
- [x] Active route detection (`currentPath === item.path || startsWith`)
- [x] Badge props on Products (count), Orders (count), Newsletter (count)
- [x] `SidebarMenuAction` renders `Badge` with correct variant
- [x] `ShowOnCollapsed` handled via `group-data-[collapsible=icon]:hidden`
- [x] `Quick Links` group with "View Site" → `/`
- [x] `SidebarFooter` with `border-t`
- [x] User avatar dropdown via `DropdownMenu` + `DropdownMenuTrigger` inside `SidebarMenuButton`
- [x] `AvatarFallback` with gradient bg + first letter
- [x] Email truncated in collapsed mode
- [x] `ChevronRight` icon in dropdown trigger
- [x] `Log out` dropdown item calls `handleLogout`
- [x] `SidebarRail` exported at bottom
- [x] `useSidebar` hook usage verified

### App.tsx route wiring
- [x] `AdminLayout` imported from `@/components/AdminLayout`
- [x] `AdminLogin` rendered at `/admin/login` (unprotected, outside layout)
- [x] Nested route: `<Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>`
- [x] All 11 admin pages as children: dashboard, content, videos, testimonials, newsletter, analytics, resources, products, reviews, settings, orders, media
- [x] `/admin` redirects to `AdminDashboard`

---

## 1. AdminDashboard (`src/pages/admin/AdminDashboard.tsx`)

### Layout & Structure
- [x] `motion.div` entrance wrapper (`initial={{ opacity: 0, y: 10 }}`)
- [x] Page heading `font-heading text-3xl tracking-wider`
- [x] Subtitle `text-muted-foreground mt-1`
- [x] "View Site" button opens `/` in new tab
- [x] Section spacing `space-y-6`

### Stat Cards Row
- [x] 4-column grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [x] Card per stat (Page Views, Subscribers, Downloads, Testimonials)
- [x] Each card: `CardHeader` with icon + `CardTitle`, `CardContent` with value
- [x] Icon in colored circle (`bg-purple-500/10 text-purple-600` etc.)
- [x] Values use `font-heading tracking-wider`
- [x] Trend indicator: `ArrowUpRight` / `ArrowDownRight` + change %
- [x] `Skeleton` loader while `statsLoading` is true
- [x] Query key: `["analytics", "dashboard"]`
- [x] API endpoint: `GET /analytics/dashboard`

### Quick Actions Grid
- [x] 2×2 grid: `grid grid-cols-2`
- [x] 4 quick actions: Add Product, Add Video, Send Newsletter, View Analytics
- [x] Each: `Button variant="outline"` with icon (colored circle) + label
- [x] `onClick` navigates to respective admin page

### Recent Activity List
- [x] `Card` with `CardHeader` (title + description)
- [x] Activity items: 6 hardcoded entries
- [x] Each item: icon circle + action text + time
- [x] Color-coded icon backgrounds (success/info/warning)
- [x] Icon mapped from `iconMap` object
- [x] Type styles from `typeStyles` record

### Missing / TODO
- [ ] Recent Activity should be fetched from API (currently hardcoded)
- [ ] Empty state if no activity
- [ ] Click activity item to navigate to relevant page

---

## 2. AdminContentManager (`src/pages/admin/AdminContentManager.tsx`)

### Layout & Structure
- [x] `motion.div` entrance wrapper
- [x] Page heading + subtitle with live save indicator ("Saved at HH:MM:SS")
- [x] Preview / Save buttons in header
- [x] Section spacing `space-y-6`

### Tabs
- [x] `Tabs` component with 4 sections: Hero, About, Mission, Featured
- [x] `TabsList` with `overflow-x-auto`, `whitespace-nowrap`
- [x] Each `TabsTrigger` has label

### Per-Tab Content Card
- [x] `Card` with `CardHeader` (title, description, "Live" badge for non-hero)
- [x] Section Title `Input`
- [x] Hero tab has banner image URL input + MediaPicker button
- [x] Non-hero tabs use TipTap `EditorContent`
- [x] Hero tab uses `Textarea` instead of TipTap

### TipTap Editor
- [x] `useEditor` hook with `StarterKit` extension
- [x] `EditorContent` rendered in `prose prose-sm max-w-none`
- [x] `onUpdate` syncs to local state via `updateLocal`

### Image Upload
- [x] Hero banner: Input + MediaPicker button + preview image
- [x] `MediaPicker` dialog integration
- [x] Preview: `aspect-video` rounded container with `object-cover`

### Save Mechanism
- [x] `useMutation` calling `contentApi.upsert`
- [x] `onSuccess`: invalidates `["content"]` queries, sets `lastSaved` timestamp
- [x] Disabled state during save with spinner
- [x] Reset button calls `handleReset` → clears local content

### Missing / TODO
- [ ] About/Mission/Featured sections missing image upload field (only hero has it)
- [ ] No version history for content
- [ ] No publish/draft toggle
- [ ] No character/word count
- [ ] `updatedAt` not displayed per section

---

## 3. AdminMedia (`src/pages/admin/AdminMedia.tsx`)

### Layout & Structure
- [x] `motion.div` entrance wrapper
- [x] Page heading + subtitle
- [x] Preview / Browse Library buttons in header
- [x] Section spacing `space-y-6`

### Stats Cards Row
- [x] 4-column grid: `grid-cols-1 sm:grid-cols-4`
- [x] Cards: Total Files, Images, Videos, Last Upload
- [x] Each has icon, label, value, subtitle
- [x] `HardDrive`, `ImageIcon`, `ExternalLink` icons
- [x] `~totalSizeMB MB stored` computed from `totalItems * 0.45`

### Upload Card
- [x] `Card` with dashed border (`border-2 border-dashed`)
- [x] File input: `type="file"`, `accept="image/*,video/*"`
- [x] URL input alternative
- [x] Upload button with `Upload` icon
- [x] Progress bar: `Progress value={uploadProgress}` shown during upload
- [x] Upload progress simulated via interval (0→90, then 100 on success)
- [x] Disabled state during upload
- [x] Selected file info: name, type, size, remove button
- [x] Error alert on failure

### Library Card
- [x] Search input with `Search` icon, `pl-9`
- [x] Type filter `Select`: All, Images, Videos
- [x] View toggle: Grid (`Grid3x3`) / Table button group
- [x] Item count in title

### Grid View
- [x] Responsive: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- [x] Each item: `aspect-square`, border, hover shadow
- [x] Image / Video rendering (video with `muted`)
- [x] Hover overlay: gradient from bottom, type badge, Copy + ExternalLink + Preview buttons
- [x] `onClick` copies URL to clipboard
- [x] Lazy loading via `loading="lazy"`

### Table View
- [x] `Table` with columns: Preview, Type, URL, ID, Actions
- [x] Thumbnail in `h-10 w-10`
- [x] Type as `Badge variant="outline"`
- [x] URL/ID truncated, `font-mono text-xs`
- [x] Copy + Open buttons in actions

### Preview Dialog
- [x] `Dialog` with `max-w-3xl`
- [x] Renders `<video controls>` for video, `<img>` for image
- [x] Trigger button disabled when no preview URL

### MediaPicker Dialog
- [x] `MediaPicker` opens in its own `Dialog`
- [x] `onSelect` sets preview URL

### Missing / TODO
- [ ] Drag-and-drop file upload zone
- [ ] Bulk select + bulk delete
- [ ] File rename / alt text editing
- [ ] Folder/category organization
- [ ] Upload multiple files at once
- [ ] Image compression before upload

---

## 4. AdminProductManager (`src/pages/admin/AdminProductManager.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Heading + "Add Product" button
- [x] Search input with `Search` icon, `pl-9`
- [x] Category filter `Select`: All Categories, Merch, Digital, Book, Apparel, Accessories

### Product Card Grid
- [x] Responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [x] `Card` per product with `transition-all hover:shadow-md`
- [x] `CardHeader`: name + description + `Badge` with price
- [x] Cover image: `aspect-video` with `object-cover`
- [x] Tags: category `Badge variant="outline"`, tag `Badge variant="secondary"`, stock count
- [x] Edit / Delete buttons in footer

### CRUD Dialog
- [x] `Dialog` with `max-w-xl`, `max-h-[90vh] overflow-y-auto`
- [x] ` DialogTitle ` shows "New" or "Edit"
- [x] Form fields: Name, Description (Textarea), Price (number), Stock (number), Category (Select), Tag (Input)
- [x] Images section with thumbnail grid (remove on hover via `X` button)
- [x] URL input + MediaPicker button
- [x] `handleSave` uses `createMutation` or `updateMutation`
- [x] Disabled during save with text "Saving..."
- [x] `confirm()` for delete
- [x] Close dialog on success

### React Query
- [x] `useQuery` key: `["products", "admin"]`
- [x] `createMutation`, `updateMutation`, `deleteMutation`
- [x] `onSuccess` invalidates `["products"]`
- [x] `useEffect` syncs `allProducts` → local `products` state

### Skeleton Loading
- [x] 6 skeleton cards shown while `isLoading`

### Empty State
- [x] `Card` with `border-dashed bg-muted/30`
- [x] `Package` icon, title, subtitle

### MediaPicker Integration
- [x] Opens on MediaPicker button click
- [x] `onSelect` appends URL to `editing.images[]` (dedup check: `includes`)
- [x] `MediaPicker` rendered at component bottom

### Missing / TODO
- [ ] Bulk delete / bulk status change
- [ ] Duplicate product button
- [ ] Import/export products (CSV)
- [ ] Product variants (size, color, material)
- [ ] SEO fields per product (meta title, description)
- [ ] Product rating display in card
- [ ] Draft/published toggle
- [ ] Drag to reorder images

---

## 5. AdminVideoManager (`src/pages/admin/AdminVideoManager.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Page heading + subtitle
- [x] `Card` for "Add Video" form

### Add Video Form
- [x] Type selector buttons: YouTube / External / Uploaded
- [x] `videoType` state controls active button
- [x] Title `Input` placeholder: "Sunday Service Highlights"
- [x] URL `Input` with auto-detection via `getVideoType()`
- [x] Detected type shown as `Badge variant="secondary"`
- [x] Description `Textarea`
- [x] Thumbnail URL `Input` + MediaPicker button
- [x] YouTube auto-detects thumbnail from video ID
- [x] "Add Video" button with `Plus` icon, disabled when empty

### Video Library
- [x] Search + status filter (`all`/`published`/`draft`)
- [x] Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [x] Video card: `aspect-video` image + status badge + ExternalLink button
- [x] `CardHeader`: title + URL (truncated)
- [x] Type badge + Delete button

### React Query
- [x] `useQuery` key: `["videos", "admin", statusFilter, searchQuery]`
- [x] `addMutation`, `deleteMutation`
- [x] `onSuccess` invalidates `["videos"]`

### MediaPicker
- [x] Opens on thumbnail image button click
- [x] `onSelect` sets `thumbnail` state

### Missing / TODO
- [ ] Edit existing video (form only adds new)
- [ ] Reorder videos
- [ ] Bulk delete
- [ ] Video duration display
- [ ] Published/draft toggle per video
- [ ] Delete confirmation dialog (currently no `confirm`)

---

## 6. AdminTestimonialManager (`src/pages/admin/AdminTestimonialManager.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Total/pending badges in header
- [x] "Pending Review" card section

### Pending Review Card
- [x] Each testimonial: `CardContent` with flex layout
- [x] Avatar: `Avatar` + `AvatarImage` + `AvatarFallback` (first letter)
- [x] Name + category displayed
- [x] "Pending" destructive `Badge`
- [x] Rating badge with `Star` icon
- [x] Quote text in `italic`, muted color
- [x] Approve `Button` (default, with `Check` icon)
- [x] Reject `Button` (destructive, with `X` icon)

### Approved Testimonials Card
- [x] Only shown if `approved.length > 0`
- [x] Each: `Card` with `bg-muted/30 border-muted`
- [x] Feature toggle: `Star` (featured, amber) / `StarOff` (not featured)
- [x] Delete `Button` (ghost, destructive)

### React Query
- [x] `useQuery` key: `["testimonials", "admin"]`
- [x] `approvalMutation`, `rejectMutation`, `featureMutation`
- [x] All invalidate `["testimonials", "admin"]` on success

### Missing / TODO
- [ ] Search/filter testimonials
- [ ] Bulk approve/reject
- [ ] Edit testimonial
- [ ] Export testimonials
- [ ] Location filter
- [ ] Category filter

---

## 7. AdminNewsletterManager (`src/pages/admin/AdminNewsletterManager.tsx`)

### Layout & Structure
- [x] `motion.div` entrance wrapper
- [x] Page heading + subtitle
- [x] Refresh + Export CSV buttons

### Stat Cards
- [x] 3-column grid: Total Subscribers, Active, Engagement Rate
- [x] `Progress` bar on Engagement Rate
- [x] Active count computed from `subscribers.filter(s => s.active).length`
- [x] Engagement rate: `Math.round((active/total)*100)`

### Subscribers Table
- [x] `Card` with search + status `Select` filter
- [x] `Select`: All / Active / Inactive
- [x] `Input` with `Search` icon, `pl-9`
- [x] Responsive `Table`: Email, Subscribed On (hidden on mobile), Status, Actions
- [x] Status badge: `CheckCircle2` (Active) / `XCircle` (Inactive)
- [x] Delete button with `Trash2` icon
- [x] `unsubscribeMutation` with `isPending` disabled

### React Query
- [x] `useQuery` key: `["newsletter", "subscribers", statusFilter, searchTerm]`
- [x] `queryFn` calls `newsletterApi.getSubscribers()`, maps fields
- [x] `unsubscribeMutation` calls `newsletterApi.unsubscribe(email)`
- [x] CSV export: builds blob, creates `<a>`, auto-downloads

### Missing / TODO
- [ ] Bulk unsubscribe
- [ ] Campaign creation form (currently just description card)
- [ ] Import subscribers (CSV upload)
- [ ] Email template editor
- [ ] Send campaign button (connected to email provider)
- [ ] Subscriber growth chart

---

## 8. AdminOrders (`src/pages/admin/AdminOrders.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Page heading + subtitle + Refresh button
- [x] 4 stat cards: Total, Pending, Processing, Delivered
- [x] Color-coded: `text-amber-600`, `text-blue-600`, `text-green-600`

### Orders Table
- [x] `Card` with `overflow-x-auto`
- [x] `Table` columns: Order ID, Customer, Email (hidden md), Payment (hidden lg), Shipping (hidden xl), Total, Status, Actions
- [x] Order ID: `slice(0, 8).toUpperCase()`, `font-mono text-xs`

### Status Select (per row)
- [x] `Select` with all 6 statuses: pending, processing, shipped, delivered, completed, cancelled
- [x] `useMutation` calling `ordersApi.updateStatus`
- [x] `onSuccess` invalidates `["orders", "admin"]`
- [x] Disabled during mutation

### Items Preview Dialog
- [x] `ItemsPreview` sub-component
- [x] `Dialog` with `max-w-lg`, `max-h-[50vh] overflow-y-auto`
- [x] Each item: `Card` with `Package` icon, name, qty, price `Badge`
- [x] Trigger: Button showing `{items.length} item(s)`

### React Query
- [x] `useQuery` key: `["orders", "admin"]`
- [x] `useMutation` inside `OrderRow` component
- [x] Error handling with `error` state showing message

### Missing / TODO
- [ ] Order search/filter (by customer name, email, status)
- [ ] Bulk status update (checkboxes + dropdown)
- [ ] Export orders (CSV)
- [ ] Order notes/fulfillment tracking
- [ ] Refund button
- [ ] Paginate orders

---

## 9. AdminReviews (`src/pages/admin/AdminReviews.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Page heading + subtitle
- [x] 3 stat cards: Total Reviews, Approved, Avg. Rating
- [x] Filter tabs in header

### Reviews Table
- [x] `Card` with `Select` filter: All, Pending, Approved, Rejected
- [x] `Table` columns: Reviewer, Product, Rating, Review (hidden md), Status, Actions
- [x] Reviewer: `r.name || "Anonymous"`
- [x] Product: `Package` icon + `r.product`
- [x] Rating: `Star` filled + `{r.rating}/5`
- [x] Status `Badge` computed via `getStatus()`
- [x] Approve button (green, ghost) — only for pending
- [x] Delete button (destructive, ghost)

### React Query
- [x] `useQuery` key: `["reviews", "admin", filter]`
- [x] `approveMutation`, `removeMutation`
- [x] `onSuccess` invalidates `["reviews"]`

### Missing / TODO
- [ ] Bulk approve/reject
- [ ] Review search
- [ ] View full review text in dialog
- [ ] Star rating display in table (actual stars not just text)
- [ ] Review response/form

---

## 10. AdminAnalytics (`src/pages/admin/AdminAnalytics.tsx`)

### Layout & Structure
- [x] Section spacing `space-y-6`
- [x] Page heading + subtitle
- [x] Period select (7d/30d/90d) + Live/Static toggle button
- [x] 4 stat cards: Page Views, Subscribers, Testimonials, Downloads

### Chart Card
- [x] `Tabs` for Bar/Line toggle
- [x] `ResponsiveContainer` with `h-72`
- [x] `BarChart` / `LineChart` from recharts
- [x] `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- [x] Tooltip styled with CSS vars for theme consistency
- [x] `Bar` / `Line` with `hsl(var(--primary))` fill
- [x] Data from `analyticsAdminApi.timeseries(days)`

### React Query
- [x] Dashboard query: `["analytics", "dashboard"]`
- [x] Timeseries query: `["analytics", "timeseries", days]`
- [x] `refetchInterval: isLive ? 5000 : false` for live mode
- [x] `useEffect` recomputes `days` when `period` changes

### Missing / TODO
- [ ] Date range picker (custom start/end)
- [ ] Export chart as image/PDF
- [ ] More chart types (area, pie for category breakdown)
- [ ] Metrics breakdown by source (organic, direct, referral)
- [ ] Real-time event stream

---

## 11. AdminSettings (`src/pages/admin/AdminSettings.tsx`)

### Layout & Structure
- [x] `motion.div` entrance wrapper
- [x] Page heading + subtitle with "Last saved" indicator
- [x] Reset + Save Changes buttons
- [x] Unsaved changes warning `Card` (amber border, shown when `hasUnsaved`)

### Tabs
- [x] 5 tabs: General, Notifications, Security, Account
- [x] `TabsList` with `overflow-x-auto`
- [x] Each `TabsTrigger` has icon + label

### General Tab
- [x] Site Name, Tagline, Site URL inputs
- [x] Maintenance Mode `Switch` with status text
- [x] Registration `Switch` with status text

### Notifications Tab
- [x] 4 toggle rows: New Order, New Subscriber, New Review, New Testimonial
- [x] Each: `Label` + description + `Switch`
- [x] Toggle state stored in local state

### Security Tab
- [x] Content Moderation: Moderate Reviews `Switch`
- [x] Content Moderation: Moderate Testimonials `Switch`

### Account Tab
- [x] `Avatar` with gradient fallback
- [x] Admin Email input
- [x] Change Password `Input type="password"`

### Save Mechanism
- [x] `handleSave` async with 600ms delay (simulated)
- [x] Console logs settings object
- [x] Sets `lastSaved` timestamp, clears `hasUnsaved`
- [x] `isSaving` disables button, shows "Saving..."

### Missing / TODO
- [ ] Actually persist settings to backend API
- [ ] Branding tab (logo upload, favicon, theme selector)
- [ ] SEO tab (meta title, description, OG image)
- [ ] Social tab (Twitter, Instagram, YouTube, TikTok URLs)
- [ ] Payment configuration tab (Stripe/Paystack/Flutterwave keys)
- [ ] SMTP configuration
- [ ] User management (add/remove admins)
- [ ] Two-factor authentication toggle

---

## 12. SHARED COMPONENTS

### MediaPicker (`src/components/MediaPicker.tsx`)
- [x] `Dialog` with `max-w-4xl max-h-[80vh] overflow-y-auto`
- [x] `DialogHeader` + `DialogTitle`
- [x] Loads items on `open` change via `mediaApi.getAll()`
- [x] Search input filters by URL
- [x] `Skeleton` grid while loading (6 items)
- [x] Grid: `grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- [x] Each item: border container, aspect-square image/video, `Check` icon
- [x] Video items: `<video>` with `muted`
- [x] Image items: `<img>` with `object-cover`
- [x] `onSelect` calls `onSelect(url)` then closes dialog
- [x] Empty state: "No media files found."
- [x] Loading state placeholder handled

### Missing / TODO
- [ ] Drag-and-drop upload inside MediaPicker
- [ ] Multi-select support
- [ ] Image metadata display (size, date)
- [ ] Pagination/infinite scroll for large libraries

### SearchBar (`src/components/SearchBar.tsx`)
- [x] `Input` with `Search` icon, `pl-10`, clear button
- [x] `useState` for `query` and `isOpen`
- [x] `onSearch` callback prop
- [x] Results dropdown: `animatePresence`, `motion.div`
- [x] Each result: type badge, title (font-heading), description
- [x] Click result clears search
- [x] `X` button to clear

### Missing / TODO
- [ ] Keyboard navigation (arrow keys, enter)
- [ ] Highlighted/slashed search text
- [ ] Grouped results by type

---

## CROSS-CUTTING PATTERNS AUDIT

### Applied Everywhere
- [x] `font-heading text-3xl tracking-wider` for page titles
- [x] `text-muted-foreground mt-1` for subtitles
- [x] `space-y-6` between major sections
- [x] shadcn/ui `Card`, `CardHeader`, `CardContent`, `CardTitle`
- [x] `motion.div` entrance (`initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}`)
- [x] Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- [x] Empty states with icon + title + description
- [x] Filter/search bars on all list pages
- [x] `Button variant="ghost"` for secondary actions
- [x] `Badge` for statuses and tags
- [x] `Skeleton` for loading states

### Inconsistent / Needs Standardization
- [ ] Some pages use `useEffect` + useState (legacy) instead of `useQuery` (e.g., AdminResourceManager still uses `useEffect`)
- [ ] Some pages have `useNavigate` import but don't need it
- [ ] Error boundaries not wrapping individual admin pages
- [ ] No `useToast` / `sonner` for success/error feedback (alerts used directly)
- [ ] `confirm()` used for deletes (should use `AlertDialog`)

---

## IMPLEMENTATION ORDER (for remaining gaps)

### Priority 1: Core UX Fixes
1. Replace all `alert()` with `useToast()` or `sonner` toast
2. Replace all `confirm()` with shadcn/ui `AlertDialog`
3. Convert AdminResourceManager from `useEffect` to `useQuery`/`useMutation`
4. Add edit functionality to AdminVideoManager

### Priority 2: Missing Features
5. Add bulk actions to AdminOrders (bulk status update)
6. Add order search/filter to AdminOrders
7. Add search/filter to AdminTestimonialManager
8. Add drag-and-drop to AdminMedia
9. Add product variants to AdminProductManager
10. Add image upload to non-hero sections in AdminContentManager

### Priority 3: Polish
11. Persist AdminSettings to backend
12. Add Branding/SEO/Social tabs to AdminSettings
13. Add pagination to AdminOrders
14. Add export to AdminOrders
15. Add campaign creation form to AdminNewsletterManager

### Priority 4: Nice-to-Have
16. Review bulk approve/reject
17. Video reorder
18. Product import/export CSV
19. Content version history
20. Keyboard navigation in SearchBar
