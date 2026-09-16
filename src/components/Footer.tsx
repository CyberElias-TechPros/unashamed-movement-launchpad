import { Link } from "react-router-dom";
import { Instagram, Youtube, Music2, Mail, ArrowUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Partner Section */}
      <div className="section-padding bg-gradient-brand">
        <div className="container-custom text-center">
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Take Action
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-wider mb-4">
            Join the Movement
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Stop hiding your light. The world needs what you carry. Get updates, resources,
            and join a community of fearless believers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ category: "social", action: "click", label: "whatsapp_footer" })}
              className="inline-block bg-accent text-accent-foreground font-heading text-lg tracking-wider px-10 py-4 rounded-md hover:bg-accent/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Join the Movement
            </a>
            <Link
              to="/donate"
              onClick={() => trackEvent({ category: "navigation", action: "click", label: "donate_footer" })}
              className="inline-block border border-accent/60 text-accent font-heading text-lg tracking-wider px-10 py-4 rounded-md hover:bg-accent/10 transition-all duration-300"
            >
              Give Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-3xl tracking-wider mb-4">TTIN</h3>
            <p className="font-display italic text-lg text-primary-foreground/70 mb-6">
              "Is your comfort zone more important than someone else's eternity?"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl tracking-wider mb-4 text-accent">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {["Home", "About Us", "Testimonies", "Shop", "Unashamed", "Resources", "Events"].map(
                (link) => (
                  <Link
                    key={link}
                    to={`/${link === "Home" ? "" : link.toLowerCase().replace(" ", "-")}`}
                    className="text-primary-foreground/70 hover:text-accent transition-colors font-body"
                  >
                    {link}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-heading text-xl tracking-wider mb-4 text-accent">
              Follow Us
            </h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://instagram.com/__thetimeisnow"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: "social", action: "click", label: "instagram" })}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://tiktok.com/@__thetimeisnow"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: "social", action: "click", label: "tiktok" })}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label="TikTok"
              >
                <Music2 size={20} />
              </a>
              <a
                href="https://youtube.com/@tthetimeisnow"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: "social", action: "click", label: "youtube" })}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="mailto:thetimeisnow255@gmail.com"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm font-body">
            © {new Date().getFullYear()} TTIN — The Time Is Now. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-body">
            <Link to="/privacy" className="text-primary-foreground/50 hover:text-accent transition-colors">Privacy</Link>
            <Link to="/terms" className="text-primary-foreground/50 hover:text-accent transition-colors">Terms</Link>
            <Link to="/refunds" className="text-primary-foreground/50 hover:text-accent transition-colors">Refunds</Link>
            <Link to="/cookies" className="text-primary-foreground/50 hover:text-accent transition-colors">Cookies</Link>
            <Link to="/order-lookup" className="text-primary-foreground/50 hover:text-accent transition-colors">Track Order</Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
