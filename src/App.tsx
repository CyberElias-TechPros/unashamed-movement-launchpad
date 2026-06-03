import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import { LayoutProvider } from "@/context/LayoutContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

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

const PageLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
  </div>
);

const queryClient = new QueryClient();

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
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute adminOnly><AdminContentManager /></ProtectedRoute>} />
          <Route path="/admin/videos" element={<ProtectedRoute adminOnly><AdminVideoManager /></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute adminOnly><AdminTestimonialManager /></ProtectedRoute>} />
          <Route path="/admin/newsletter" element={<ProtectedRoute adminOnly><AdminNewsletterManager /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/resources" element={<ProtectedRoute adminOnly><AdminResourceManager /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProductManager /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute adminOnly><AdminMedia /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
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
                    <ScrollToTop />
                    <AnimatedRoutes />
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
