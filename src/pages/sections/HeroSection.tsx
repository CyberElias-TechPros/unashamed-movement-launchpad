import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { trackEvent } from "@/lib/analytics";
import { useQuery } from "@tanstack/react-query";
import { contentApi, SiteContent } from "@/api/content";

const fallbackHero: SiteContent = {
  key: "hero",
  title: "UNASHAMED",
  content: '"Is your timidity worth someone else\'s eternity?"',
  type: "hero",
  metadata: {},
};

const HeroSection = () => {
  const { data: hero } = useQuery({
    queryKey: ["content", "hero"],
    queryFn: () => contentApi.getByKey("hero").catch(() => fallbackHero),
  });

  const heading = hero?.title || "UNASHAMED";
  const subheading = hero?.content || '"Is your timidity worth someone else\'s eternity?"';
  const blurb = String(
    hero?.metadata?.blurb ??
      "A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed."
  );
  const kicker = String(hero?.metadata?.kicker ?? "The Time Is Now Movement");

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-background vignette">
      {/* Cinematic video backdrop */}
      <motion.div className="absolute inset-0" style={{ y: videoY }}>
        <video
          className="h-full w-full object-cover duotone-candle"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-preaching.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/35 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_38%,transparent_30%,hsl(30_14%_5%/0.5)_100%)]" />
      </motion.div>

      <EmberGlow intensity="low" />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pt-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mb-7 flex items-center gap-4"
        >
          <span className="h-px w-8 sm:w-14 bg-accent/70" />
          <p className="kicker">{kicker}</p>
          <span className="h-px w-8 sm:w-14 bg-accent/70" />
        </motion.div>

        <h1 className="font-heading leading-[0.85] tracking-[0.02em] text-foreground">
          <KineticText
            text={heading.toUpperCase()}
            inView={false}
            delay={0.5}
            stagger={0.06}
            className="text-[19vw] sm:text-[17vw] lg:text-[13rem] drop-shadow-[0_10px_60px_rgba(0,0,0,0.65)]"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25 }}
          className="mt-6 max-w-3xl font-display italic text-xl sm:text-2xl lg:text-[2rem] text-foreground/85 leading-snug"
        >
          {subheading}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.45 }}
          className="mt-5 max-w-xl font-body text-base sm:text-lg text-muted-foreground"
        >
          {blurb}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.65 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton>
            <Link
              to="/unashamed"
              onClick={() => trackEvent({ category: "navigation", action: "click", label: "hero_join_movement" })}
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-9 py-4 font-heading text-lg tracking-[0.15em] text-accent-foreground transition-all duration-300 hover:glow-accent"
            >
              Join the Movement
              <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a
              href="#watch"
              onClick={() => trackEvent({ category: "navigation", action: "click", label: "hero_watch" })}
              className="group inline-flex items-center gap-3 rounded-full border border-foreground/25 px-8 py-4 font-body text-sm font-semibold tracking-[0.2em] uppercase text-foreground/85 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:text-accent"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Play size={14} className="ml-0.5" />
              </span>
              Watch the Fire
            </a>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-foreground/50">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 w-px bg-gradient-to-b from-accent/80 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
