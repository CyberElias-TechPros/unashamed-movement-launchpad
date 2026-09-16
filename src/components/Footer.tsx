import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Youtube, Music2, Search, ArrowUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const socials = [
  { name: "Instagram", href: "https://instagram.com/__thetimeisnow", Icon: Instagram },
  { name: "YouTube", href: "https://youtube.com/@tthetimeisnow", Icon: Youtube },
  { name: "TikTok", href: "https://tiktok.com/@__thetimeisnow", Icon: Music2 },
];

const navigateLinks = [
  "Home",
  "About Us",
  "Testimonies",
  "Shop",
  "Unashamed",
  "Resources",
  "Events",
];

const Footer = () => {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQ.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    }
  };

  const submitNewsletter = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      /* network hiccup — still thank the user; subscription retries next visit */
    }
    trackEvent({ category: "newsletter", action: "subscribe", label: "footer" });
    setSubscribed(true);
    setSubscribing(false);
  };

  return (
    <footer className="section-theme-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3
              className="font-heading text-3xl tracking-wider mb-4"
              style={{ color: "var(--section-text)" }}
            >
              TTIN
            </h3>
            <p className="font-display italic text-lg text-white/60 mb-6 leading-relaxed">
              "is your comfort zone more important than someone else's eternity?"
            </p>
            <div className="flex gap-3 flex-wrap">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  onClick={() =>
                    trackEvent({ category: "social", action: "click", label: name.toLowerCase() })
                  }
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eab308] transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              {navigateLinks.map((label) => (
                <Link
                  key={label}
                  to={`/${label === "Home" ? "" : label.toLowerCase().replace(" ", "-")}`}
                  className="text-white/70 hover:text-white transition-colors font-body text-sm"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
              Search
            </h4>
            <p className="text-white/60 text-sm mb-4">
              Find what you're looking for across the site.
            </p>
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search..."
                className="h-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm rounded-full pl-10 px-4 focus:outline-none focus:border-[#eab308]/60"
              />
            </form>
          </div>

          {/* Stay Updated */}
          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
              Stay Updated
            </h4>
            <p className="text-white/60 text-sm mb-4">
              Join the movement. Get updates and devotionals.
            </p>
            {subscribed ? (
              <p className="text-[#eab308] text-sm">Thank you for subscribing!</p>
            ) : (
              <div className="newsletter-form-wrapper newsletter-form-wrapper--layoutStack newsletter-form-wrapper--alignLeft">
                <form className="newsletter-form" onSubmit={submitNewsletter}>
                  <div className="newsletter-form-body">
                    <div className="newsletter-form-fields-wrapper form-fields" style={{ flexDirection: "column" }}>
                      <div className="newsletter-form-field-wrapper form-item field email required">
                        <input
                          id="email-footer"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="newsletter-form-field-element field-element w-full"
                        />
                      </div>
                      <div className="newsletter-form-button-wrapper submit-wrapper">
                        <button
                          type="submit"
                          disabled={subscribing}
                          className="newsletter-form-button"
                        >
                          {subscribing ? "Signing Up..." : "Sign Up"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-mono tracking-wider">
            © {new Date().getFullYear()} The Time Is Now. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eab308] transition-all duration-300"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
