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
    queryKey: ['content', 'hero'],
    queryFn: () => contentApi.getByKey('hero').catch(() => ({
      key: 'hero',
      title: 'UNASHAMED',
      content: '"Is your timidity worth someone else\'s eternity?"',
      type: 'hero' as const,
      metadata: {} as Record<string, unknown>,
    })),
  });

  const heroMeta = (hero?.metadata ?? {}) as Record<string, string | undefined>;
  const heading = hero?.title || 'UNASHAMED';
  const subheading = hero?.content || '"Is your timidity worth someone else\'s eternity?"';
  const blurb = heroMeta.blurb || 'A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed.';

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const startAutoplay = useCallback(() => {
    if (!emblaApi) return;
    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    
    const initialTimeout = setTimeout(() => {
      emblaApi.scrollNext();
    }, 10000);
    
    startAutoplay();
    return () => {
      emblaApi.off('select', onSelect);
      stopAutoplay();
      clearTimeout(initialTimeout);
    };
  }, [emblaApi, onSelect, startAutoplay, stopAutoplay]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section 
      className="relative min-h-screen"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div ref={emblaRef} className="overflow-hidden h-screen">
        <div className="flex h-full">
          <div className="relative min-w-0 shrink-0 grow-0 basis-full flex items-center justify-center bg-primary">
            {/* Poster is always rendered as the backdrop; the (optional) hero
                video layers on top when present — fixes the broken/blank hero
                when the video file is missing. */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/videos/hero-poster.jpg')" }}
              aria-hidden="true"
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/videos/hero-poster.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            >
              <source src="/videos/hero-preaching.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-secondary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] border border-primary-foreground/5 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] border border-primary-foreground/3 rounded-full" />
            </div>

            <FloatingParticles count={25} color="hsl(43 78% 56%)" />

            <motion.div
              variants={heroVariants}
              initial="hidden"
              animate="visible"
              className="container-custom text-center relative z-10 pt-20"
            >
              <motion.p variants={itemVariant} className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-6">
                {heroMeta.kicker || 'The Time Is Now'}
              </motion.p>

              <TextReveal
                text={heading}
                className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-wider text-primary-foreground leading-none mb-8"
                delay={0.3}
              />

              <motion.p variants={itemVariant} className="font-display italic text-xl sm:text-2xl lg:text-3xl text-primary-foreground/70 max-w-3xl mx-auto mb-4">
                {subheading}
              </motion.p>

              <motion.p variants={itemVariant} className="font-body text-primary-foreground/60 max-w-xl mx-auto mb-10 text-lg">
                {blurb}
              </motion.p>

              <motion.div variants={itemVariant} className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton>
                  <Link
                    to="/about"
                    onClick={() => trackEvent({ category: "cta", action: "click", label: "hero_join_movement" })}
                  >
                    <Button variant="hero" size="lg" className="px-10">
                      Join The Movement <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    to="/unashamed"
                    onClick={() => trackEvent({ category: "cta", action: "click", label: "hero_watch_unashamed" })}
                  >
                    <Button variant="brand" size="lg" className="px-10">
                      Watch Unashamed
                    </Button>
                  </Link>
                </MagneticButton>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
