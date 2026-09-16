import { useEffect, useRef, useState } from "react";
import { Users, Globe, MessagesSquare, HeartHandshake, Eye, MessageCircle, Instagram, Youtube, Music2 } from "lucide-react";
import Layout from "@/components/Layout";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { trackEvent } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/* Prototype data (recovered from Index-B7e6x5hS.js)                    */
/* ------------------------------------------------------------------ */

const igReels = [
  { id: "DZw5osmqdGm", title: "Preaching Open Air" },
  { id: "DaBROdxhSJl", title: "Bold Faith" },
  { id: "DWur5fHCqhJ", title: "Unashamed Witness" },
];

const stats = [
  { end: 150, suffix: "+", label: "People Preached Open Air", Icon: Users },
  { end: 33, suffix: "", label: "Countries Reached", Icon: Globe },
  { end: 1200, suffix: "+", label: "Community Members", Icon: MessagesSquare },
  { end: 45, suffix: "+", label: "Volunteers", Icon: HeartHandshake },
  { end: 20, suffix: "M+", label: "Social Media Views", Icon: Eye },
  { end: 800, suffix: "+", label: "Gospel Conversations Started", Icon: MessageCircle },
];

const videoCards = [
  { title: "Bold on the Streets", thumb: "/images/home-bold-streets.jpg" },
  { title: "Faith in Action", thumb: "/images/home-faith-action.jpg" },
  { title: "Unashamed Witness", thumb: "/images/home-unashamed-witness.jpg" },
];

const quotes = [
  "Is your comfort zone more important than someone else’s eternity?",
  "Lukewarm Christianity has become the norm and that’s why true Christianity is deemed radical",
  "If heaven is real and eternity is forever, silence is no longer an option.",
  "Our mission is simple: make radical Christianity normal again.",
  "Take the gospel out of the Church and into the streets.",
  "Be unashamed of the gospel.",
];

const socials = [
  { name: "Instagram", href: "https://instagram.com/__thetimeisnow", Icon: Instagram },
  { name: "YouTube", href: "https://youtube.com/@tthetimeisnow", Icon: Youtube },
  { name: "TikTok", href: "https://tiktok.com/@__thetimeisnow", Icon: Music2 },
];

const WHATSAPP = "https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna";

/* ------------------------------------------------------------------ */
/* Scroll reveal (template-fade-in -> template-visible)                 */
/* ------------------------------------------------------------------ */

const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`template-fade-in ${visible ? "template-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */

const HeroSection = () => (
  <section
    className="page-section full-bleed-section section-theme-black"
    data-test="page-section"
    data-section-theme="black"
    style={{ minHeight: "100vh" }}
  >
    <div className="section-border" />
    <div className="section-background">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/front-video.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(234,179,8,0.18),transparent_60%)]" />
    </div>
    <div className="content-wrapper relative z-10">
      <div className="content container-custom min-h-screen flex flex-col items-center justify-center text-center px-4 py-24">
        <p className="font-mono text-[#eab308] text-xs sm:text-sm tracking-[0.35em] uppercase mb-6 animate-fade-in" />
        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white leading-[0.95] mb-6 animate-fade-in">
          THE TIME IS NOW
        </h1>
        <p className="font-body text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in">
          Making radical Christianity normal again
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ category: "social", action: "click", label: "whatsapp_hero" })}
            className="sqs-button-element--primary text-sm"
          >
            Join the Movement
          </a>
        </div>
      </div>
    </div>
  </section>
);

const ReelsSection = () => (
  <section
    className="page-section full-bleed-section section-theme-dark"
    data-test="page-section"
    data-section-theme="dark"
  >
    <div className="section-border" />
    <div className="section-background">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
    </div>
    <div className="content-wrapper">
      <div className="content container-custom py-20 md:py-28">
        <div className="mb-16 template-fade-in template-visible" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {igReels.map((reel, i) => (
            <Reveal key={reel.id} delay={i * 0.1}>
              <div className="template-card bg-white/5 border border-white/10 overflow-hidden group">
                <div className="relative aspect-[9/16] bg-[#0a0a0a] overflow-hidden">
                  <iframe
                    src={`https://www.instagram.com/p/${reel.id}/embed`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={reel.title}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <h3 className="font-heading text-xl tracking-wider text-white">{reel.title}</h3>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ImpactSection = () => (
  <section
    className="page-section full-bleed-section section-theme-dark scroll-mt-24"
    data-test="page-section"
    data-section-theme="dark"
  >
    <div className="section-border" />
    <div className="section-background">
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
      </div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#eab308]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#eab308]/5 blur-3xl pointer-events-none" />
    </div>
    <div className="content-wrapper relative z-10">
      <div className="content container-custom py-20 md:py-28">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          <div className="w-full lg:w-5/12 sticky lg:sticky top-24">
            <Reveal>
              <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
                By The Numbers
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white mb-6">
                Our Impact
              </h2>
              <p className="font-body text-white/50 text-lg leading-relaxed">
                From bus stops to airplanes, the Gospel is reaching the unreached. Every number
                represents a life touched, a soul awakened, and a testimony of God's faithfulness.
              </p>
            </Reveal>
          </div>
          <div className="w-full lg:w-7/12 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.05}>
                  <div className="template-card bg-white/5 border border-white/10 p-8 h-full">
                    <div className="w-14 h-14 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308] mb-5">
                      <stat.Icon className="w-6 h-6" />
                    </div>
                    <div className="font-heading text-4xl lg:text-5xl text-white mb-2">
                      <AnimatedCounter
                        end={stat.end}
                        suffix={stat.suffix}
                        className="font-heading text-4xl lg:text-5xl text-white"
                      />
                    </div>
                    <div className="font-body text-white/40 text-sm uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TestimoniesSection = () => (
  <section
    className="page-section full-bleed-section section-theme-dark"
    data-test="page-section"
    data-section-theme="dark"
  >
    <div className="section-border" />
    <div className="section-background">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#eab308]/5 blur-3xl pointer-events-none" />
    </div>
    <div className="content-wrapper">
      <div className="content container-custom py-20 md:py-28">
        <Reveal className="text-center mb-16">
          <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
            Testimonies
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white mb-4">
            Lives Transformed
          </h2>
          <p className="font-body text-white/50 text-lg max-w-3xl mx-auto">
            Hear from people who have been impacted by the movement
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videoCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <div className="template-card bg-white/5 border border-white/10 overflow-hidden group">
                <div className="relative aspect-[9/16] bg-[#0a0a0a] overflow-hidden">
                  <img
                    src={card.thumb}
                    alt={card.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                    <h3 className="font-heading text-xl tracking-wider text-white">{card.title}</h3>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section
    className="page-section full-bleed-section section-theme-dark relative overflow-hidden"
    data-test="page-section"
    data-section-theme="dark"
  >
    <div className="section-border" />
    <div className="section-background">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#eab308]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#eab308]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
    </div>
    <div className="content-wrapper relative z-10">
      <div className="content container-custom py-20 md:py-28">
        <Reveal className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
            Take Action
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-7xl tracking-wider text-white mb-6">
            Join the Movement
          </h2>
          <p className="font-body text-white/50 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop hiding your light. The world needs what you carry. Get updates, resources, and
            join a community of fearless believers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ category: "social", action: "click", label: "whatsapp_cta" })}
              className="sqs-button-element--primary text-sm"
            >
              Join the Movement
            </a>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="font-mono text-white/40 text-xs tracking-[0.2em] uppercase mb-5">
              Follow Us
            </p>
            <div className="flex items-center justify-center gap-4">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  onClick={() => trackEvent({ category: "social", action: "click", label: name.toLowerCase() })}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#eab308] transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const QuoteSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="page-section full-bleed-section section-theme-dark"
      data-test="page-section"
      data-section-theme="dark"
    >
      <div className="section-border" />
      <div className="section-background">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
        <div className="absolute top-0 left-1/2 w-64 h-64 bg-[#eab308]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#eab308]/5 rounded-full translate-y-1/2 blur-3xl pointer-events-none" />
      </div>
      <div className="content-wrapper relative z-10">
        <div className="content container-custom py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center template-fade-in template-visible">
            <p
              key={index}
              className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-wider text-white/80 leading-relaxed italic animate-fade-in"
            >
              “{quotes[index]}”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ReelsSection />
      <ImpactSection />
      <TestimoniesSection />
      <CTASection />
      <QuoteSection />
    </Layout>
  );
};

export default Index;
