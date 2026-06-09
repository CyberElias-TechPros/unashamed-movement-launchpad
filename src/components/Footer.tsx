import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, ArrowUp } from "lucide-react";
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
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-wider mb-4">
            Partner With Us
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Join us in spreading boldness across the world. Your support helps us 
            reach more people and create more resources for the kingdom.
          </p>
          <Link
            to="/donate"
            onClick={() => trackEvent({ category: "navigation", action: "click", label: "donate_footer" })}
            className="inline-block bg-accent text-accent-foreground font-heading text-lg tracking-wider px-10 py-4 rounded-md hover:bg-accent/90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Give Now
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-3xl tracking-wider mb-4">TTIN</h3>
            <p className="font-display italic text-lg text-primary-foreground/70 mb-6">
              "Is your timidity worth someone else's eternity?"
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
              Connect
            </h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://instagram.com/_thetimeisnow"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: "social", action: "click", label: "instagram" })}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:hello@ttin.org"
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300"
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
