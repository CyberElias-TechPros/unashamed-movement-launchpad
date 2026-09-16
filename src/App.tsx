import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import { LayoutProvider } from "@/context/LayoutContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { settingsApi } from "@/api/settings";

const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Testimonies = lazy(() => import("./pages/Testimonies.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const Unashamed = lazy(() => import("./pages/Unashamed.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Search = lazy(() => import("./pages/Search.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.tsx"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminContentManager = lazy(() => import("./pages/admin/AdminContentManager.tsx"));
const AdminVideoManager = lazy(() => import("./pages/admin/AdminVideoManager.tsx"));
const AdminTestimonialManager = lazy(() => import("./pages/admin/AdminTestimonialManager.tsx"));
const AdminNewsletterManager = lazy(() => import("./pages/admin/AdminNewsletterManager.tsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.tsx"));
const AdminResourceManager = lazy(() => import("./pages/admin/AdminResourceManager.tsx"));
const AdminProductManager = lazy(() => import("./pages/admin/AdminProductManager.tsx"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.tsx"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.tsx"));
const Donate = lazy(() => import("./pages/Donate.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const OrderLookup = lazy(() => import("./pages/OrderLookup.tsx"));
const Maintenance = lazy(() => import("./pages/Maintenance.tsx"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts.tsx"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents.tsx"));
const AdminDonations = lazy(() => import("./pages/admin/AdminDonations.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
import { PrivacyPolicy, TermsOfService, RefundPolicy, CookieNotice } from "./pages/Legal";

const PageLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ThemeManager = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('ttin-theme');
    if (savedTheme === 'bw-purple') {
      document.documentElement.classList.add("bw-purple-theme");
    }
  }, []);

  return null;
};

/**
 * Full-site maintenance gate: when the admin enables maintenance mode only
 * admins can pass through; everyone else sees a friendly "be right back".
 */
const MaintenanceGate = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings", "maintenance"],
    queryFn: settingsApi.getAll,
    staleTime: 60 * 1000,
    retry: false,
  });

  if (authLoading || settingsLoading) return <PageLoader />;
  if (settings?.maintenanceMode && !isAdmin) return <Maintenance />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/testimonies" element={<PageTransition><Testimonies /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
          <Route path="/unashamed" element={<PageTransition><Unashamed /></PageTransition>} />
          <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/content" element={<AdminContentManager />} />
            <Route path="/admin/videos" element={<AdminVideoManager />} />
            <Route path="/admin/testimonials" element={<AdminTestimonialManager />} />
            <Route path="/admin/newsletter" element={<AdminNewsletterManager />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/resources" element={<AdminResourceManager />} />
            <Route path="/admin/products" element={<AdminProductManager />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/donations" element={<AdminDonations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
          <Route path="/order-lookup" element={<PageTransition><OrderLookup /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/refunds" element={<PageTransition><RefundPolicy /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition><CookieNotice /></PageTransition>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LayoutProvider>
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <HelmetProvider>
                <ErrorBoundary>
                  <ThemeManager />
                  <Toaster />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <MaintenanceGate>
                    <ScrollToTop />
                    <AnimatedRoutes />
                    </MaintenanceGate>
                  </BrowserRouter>
                </ErrorBoundary>
              </HelmetProvider>
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </LayoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;