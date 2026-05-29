import { useState, useEffect, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/context/LayoutContext";
import LayoutToggle from "./LayoutToggle";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Testimonies", path: "/testimonies" },
  { name: "Shop", path: "/shop" },
  { name: "Unashamed", path: "/unashamed" },
  { name: "Resources", path: "/resources" },
  { name: "Events", path: "/events" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { layoutMode, colorMode } = useLayout();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQ.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Determine if we should show dark navbar (Sympos layout or B&W purple theme)
  const isDarkNavbar = layoutMode === "sympos" || colorMode === "bw-purple";
  
  // Get appropriate classes based on mode
  const getNavbarClasses = () => {
    const base = "fixed top-0 left-0 right-0 z-50 transition-all duration-500";
    
    if (scrolled) {
      if (colorMode === "bw-purple") {
        return `${base} bg-black/95 backdrop-blur-md shadow-xl py-3`;
      }
      return `${base} bg-primary/95 backdrop-blur-md shadow-xl py-3`;
    }
    
    // Not scrolled - transparent
    if (colorMode === "bw-purple") {
      return `${base} bg-black/80 py-5`;
    }
    if (layoutMode === "sympos") {
      return `${base} bg-background/80 py-5`;
    }
    // Default TTIN layout - use primary color
    return `${base} bg-primary/80 py-5`;
  };

  const getTextColor = () => {
    if (colorMode === "bw-purple") {
      return "text-white";
    }
    if (layoutMode === "sympos" && !scrolled) {
      return "text-foreground";
    }
    return "text-primary-foreground";
  };

  const getMobileMenuBg = () => {
    if (colorMode === "bw-purple") {
      return "bg-black/98";
    }
    if (layoutMode === "sympos") {
      return "bg-background/98";
    }
    return "bg-primary/98";
  };

  const getMobileTextColor = () => {
    if (colorMode === "bw-purple") {
      return "text-white";
    }
    return "text-primary-foreground";
  };

  return (
    <nav className={getNavbarClasses()}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-heading text-3xl tracking-wider ${getTextColor()}`}>
            TTIN
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              aria-current={location.pathname === link.path ? "page" : undefined}
              className={`relative font-body text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:text-accent group ${
                location.pathname === link.path
                  ? "text-accent"
                  : getTextColor()
              }`}
            >
              {link.name}
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] bg-accent"
                initial={{ width: location.pathname === link.path ? "100%" : "0%" }}
                animate={{ width: location.pathname === link.path ? "100%" : "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          ))}
          <form onSubmit={submitSearch} className="hidden xl:flex items-center">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="h-9 w-40 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              aria-label="Search site"
            />
          </form>
          <LayoutToggle />
          <Link
            to="/cart"
            className={`relative p-2 rounded-full transition-colors hover:text-accent ${getTextColor()}`}
            aria-label={`Cart, ${totalItems} items`}
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden p-2 ${getTextColor()}`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`lg:hidden ${getMobileMenuBg()} backdrop-blur-md overflow-hidden`}
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`font-heading text-2xl tracking-wider transition-colors ${
                      location.pathname === link.path
                        ? "text-accent"
                        : getMobileTextColor()
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile Toggles */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-4 border-t border-border/20 mt-2"
              >
                <p className={`font-body text-sm tracking-wider uppercase mb-3 ${getMobileTextColor()}`}>
                  Settings
                </p>
                <LayoutToggle />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;