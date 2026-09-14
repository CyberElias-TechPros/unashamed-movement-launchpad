import { useState, useEffect, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

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

const menuVariants = {
  closed: { opacity: 0, transition: { duration: 0.35, ease: "easeInOut" as const } },
  open: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const linkVariants = {
  closed: { opacity: 0, y: 40, rotate: 2 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQ.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? "glass-panel py-3 shadow-[0_8px_40px_rgba(0,0,0,0.45)]" : "bg-transparent py-5"
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          <Link to="/" className="group flex items-baseline gap-2" aria-label="TTIN home">
            <span className="font-heading text-3xl tracking-wider text-foreground transition-colors group-hover:text-accent">
              TTIN
            </span>
            <span className="hidden sm:block font-display italic text-xs text-muted-foreground tracking-wide">
              the time is now
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {navLinks.slice(1).map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? "page" : undefined}
                  className={`relative font-body text-[13px] font-medium tracking-[0.18em] uppercase transition-colors duration-300 hover:text-accent ${
                    active ? "text-accent" : "text-foreground/75"
                  }`}
                >
                  {link.name}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-px bg-accent"
                    initial={false}
                    animate={{ width: active ? "100%" : "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              );
            })}

            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 text-foreground/75 transition-colors hover:text-accent"
              aria-label="Search site"
            >
              <Search size={19} />
            </button>

            <Link
              to="/cart"
              className="relative p-2 text-foreground/75 transition-colors hover:text-accent"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
              )}
            </Link>

            <Link
              to="/donate"
              className="group relative ml-2 inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-accent/50 px-5 py-2 font-body text-[13px] font-semibold tracking-[0.18em] uppercase text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:glow-accent"
            >
              Donate
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </nav>

          <div className="flex items-center gap-1 lg:hidden">
            <Link to="/cart" className="relative p-2 text-foreground/85" aria-label={`Cart, ${totalItems} items`}>
              <ShoppingCart size={21} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold px-1">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Inline search drawer (desktop) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block overflow-hidden glass-panel border-t border-x-0 border-b-0"
            >
              <form onSubmit={submitSearch} className="container-custom flex items-center gap-4 py-4">
                <Search size={18} className="text-accent shrink-0" />
                <Input
                  autoFocus
                  type="search"
                  placeholder="Search the movement — products, resources, videos…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="h-11 border-0 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label="Search site"
                />
                <span className="text-xs text-muted-foreground tracking-widest uppercase">Enter ↵</span>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-[95] lg:hidden bg-background/95 backdrop-blur-2xl"
          >
            <div className="grain-overlay opacity-[0.04]" />
            <div className="container-custom flex h-full flex-col justify-center pt-16">
              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const active = location.pathname === link.path;
                    return (
                      <li key={link.path} className="overflow-hidden">
                        <motion.div custom={i} variants={linkVariants} initial="closed" animate="open" exit="closed">
                          <Link
                            to={link.path}
                            aria-current={active ? "page" : undefined}
                            className={`group flex items-baseline gap-4 py-2 font-heading text-5xl sm:text-6xl tracking-wider transition-colors ${
                              active ? "text-accent" : "text-foreground/85 hover:text-accent"
                            }`}
                          >
                            <span className="font-body text-xs text-muted-foreground tracking-[0.3em]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {link.name}
                          </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                custom={navLinks.length}
                variants={linkVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="mt-10 flex flex-col gap-5"
              >
                <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-border pb-3">
                  <Search size={18} className="text-accent" />
                  <Input
                    type="search"
                    placeholder="Search…"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    className="border-0 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                    aria-label="Search site"
                  />
                </form>
                <Link
                  to="/donate"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-7 py-3 font-body text-sm font-bold tracking-[0.2em] uppercase text-accent-foreground"
                >
                  Donate <ArrowUpRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
