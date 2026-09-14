import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, ArrowUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import Marquee from "@/components/cinematic/Marquee";
import EmberGlow from "@/components/cinematic/EmberGlow";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Testimonies", path: "/testimonies" },
  { name: "Shop", path: "/shop" },
  { name: "Unashamed", path: "/unashamed" },
  { name: "Resources", path: "/resources" },
  { name: "Events", path: "/events" },
];

const socials = [
  { icon: Instagram, href: "https://instagram.com/_thetimeisnow", label: "Instagram" },
  { icon: Twitter, href: "https://x.com", label: "Twitter / X" },
  { icon: Mail, href: "mailto:hello@ttin.org", label: "Email" },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-border bg-primary text-primary-foreground">
      {/* Partner CTA band */}
      <div className="relative">
        <EmberGlow intensity="high" />
        <div className="border-y border-border/60 bg-background/40 py-4">
          <Marquee duration={26}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="mx-6 flex items-center gap-6 font-heading text-2xl tracking-[0.25em] text-foreground/50">
                BE BOLD <span className="text-accent">✦</span> BE UNASHAMED <span className="text-accent">✦</span>
              </span>
            ))}
          </Marquee>
        </div>

        <div className="section-padding relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="kicker mb-5"
          >
            Partner With Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mx-auto max-w-4xl font-heading text-5xl sm:text-7xl tracking-wider leading-[0.95] mb-6"
          >
            Fuel the <span className="text-gradient-gold">Movement</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mb-10 max-w-2xl font-body text-lg text-muted-foreground"
          >
            Join us in spreading boldness across the world. Your support helps us reach
            more cities and create more resources for the kingdom.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link
              to="/donate"
              onClick={() => trackEvent({ category: "navigation", action: "click", label: "donate_footer" })}
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-10 py-4 font-heading text-xl tracking-[0.15em] text-accent-foreground transition-all duration-300 hover:glow-accent hover:scale-[1.03]"
            >
              Give Now
              <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom relative z-10 pb-12 pt-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-heading text-4xl tracking-wider mb-1">TTIN</p>
            <p className="font-body text-xs tracking-[0.35em] uppercase text-accent mb-6">The Time Is Now</p>
            <p className="font-display italic text-xl text-muted-foreground max-w-sm leading-relaxed">
              "Is your timidity worth someone else's eternity?"
            </p>
            <div className="mt-8 flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ category: "social", action: "click", label: label.toLowerCase() })}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-6">
              Navigate
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-body text-muted-foreground transition-colors hover:text-accent"
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/donate" className="font-body text-muted-foreground transition-colors hover:text-accent">
                Donate
              </Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-6">
              The Charge
            </h4>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              "For I am not ashamed of the gospel, because it is the power of God that
              brings salvation to everyone who believes."
            </p>
            <p className="mt-3 font-body text-xs tracking-[0.25em] uppercase text-foreground/60">
              Romans 1:16
            </p>
          </div>
        </div>

        {/* Giant watermark */}
        <div className="pointer-events-none mt-16 select-none overflow-hidden border-t border-border/60 pt-8" aria-hidden="true">
          <p className="text-center font-heading leading-none tracking-[0.08em] text-foreground/[0.05] text-[18vw]">
            UNASHAMED
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
          <p className="font-body text-sm text-muted-foreground/70">
            © {new Date().getFullYear()} TTIN — The Time Is Now. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:glow-accent"
          >
            <ArrowUp size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
