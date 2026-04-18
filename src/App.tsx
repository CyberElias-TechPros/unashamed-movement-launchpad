import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "@/components/PageTransition";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";
import Index from "./pages/Index.tsx";
import SymposIndex from "./pages/SymposIndex.tsx";
import About from "./pages/About.tsx";
import SymposAbout from "./pages/SymposAbout.tsx";
import Testimonies from "./pages/Testimonies.tsx";
import SymposTestimonies from "./pages/SymposTestimonies.tsx";
import Shop from "./pages/Shop.tsx";
import SymposShop from "./pages/SymposShop.tsx";
import Unashamed from "./pages/Unashamed.tsx";
import SymposUnashamed from "./pages/SymposUnashamed.tsx";
import Resources from "./pages/Resources.tsx";
import SymposResources from "./pages/SymposResources.tsx";
import Events from "./pages/Events.tsx";
import Contact from "./pages/Contact.tsx";
import SymposContact from "./pages/SymposContact.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ThemeManager = () => {
  const { colorMode } = useLayout();
  
  useEffect(() => {
    if (colorMode === "bw-purple") {
      document.documentElement.classList.add("bw-purple-theme");
    } else {
      document.documentElement.classList.remove("bw-purple-theme");
    }
  }, [colorMode]);
  
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { layoutMode } = useLayout();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition>{layoutMode === "sympos" ? <SymposIndex /> : <Index />}</PageTransition>} />
        <Route path="/about" element={<PageTransition>{layoutMode === "sympos" ? <SymposAbout /> : <About />}</PageTransition>} />
        <Route path="/testimonies" element={<PageTransition>{layoutMode === "sympos" ? <SymposTestimonies /> : <Testimonies />}</PageTransition>} />
        <Route path="/shop" element={<PageTransition>{layoutMode === "sympos" ? <SymposShop /> : <Shop />}</PageTransition>} />
        <Route path="/unashamed" element={<PageTransition>{layoutMode === "sympos" ? <SymposUnashamed /> : <Unashamed />}</PageTransition>} />
        <Route path="/resources" element={<PageTransition>{layoutMode === "sympos" ? <SymposResources /> : <Resources />}</PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/contact" element={<PageTransition>{layoutMode === "sympos" ? <SymposContact /> : <Contact />}</PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LayoutProvider>
        <ThemeManager />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </LayoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
