import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Youtube, Music2 } from "lucide-react";

const navLinks = [
  { name: "About", path: "/about" },
  { name: "Testimonies", path: "/testimonies" },
  { name: "Unashamed Pod", path: "/unashamed" },
  { name: "Resources", path: "/resources" },
  { name: "Contact Us", path: "/contact" },
];

const socials = [
  { name: "Instagram", href: "https://instagram.com/__thetimeisnow", Icon: Instagram },
  { name: "YouTube", href: "https://youtube.com/@tthetimeisnow", Icon: Youtube },
  { name: "TikTok", href: "https://tiktok.com/@__thetimeisnow", Icon: Music2 },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-[#0a0a0a]/95 backdrop-blur-xl shadow-xl"
            : "bg-transparent backdrop-blur-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4 lg:py-5">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/ttin-primary.svg"
              alt="TTIN"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-mono text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                    isActive ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-[#eab308]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/donate"
              className="inline-flex sqs-button-element--primary text-[11px]"
            >
              Partner With Us
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-[#0a0a0a] z-50 overflow-y-auto">
          <div className="flex justify-end p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="px-6 pb-12 flex flex-col gap-8 pt-8">
            <Link
              to="/"
              className="font-heading text-3xl tracking-wider text-white/80 hover:text-white transition-colors block"
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-heading text-3xl tracking-wider text-white/80 hover:text-white transition-colors block"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-8 border-t border-white/10">
              <Link
                to="/donate"
                className="inline-block sqs-button-element--primary text-xs w-full text-center"
              >
                Partner With Us
              </Link>
              <div className="flex items-center gap-4 mt-8">
                {socials.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eab308] transition-all duration-300"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
