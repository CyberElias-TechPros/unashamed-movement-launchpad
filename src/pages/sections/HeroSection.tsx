import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { Button } from "@/components/ui/button";
import TextReveal from "@/components/TextReveal";
import FloatingParticles from "@/components/FloatingParticles";
import { trackEvent } from "@/lib/analytics";
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/api/content';

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const HeroSection = () => {
  const { data: hero } = useQuery({
    queryKey: ['content', 'hero'],
    queryFn: () => contentApi.getByKey('hero'),
  });

  const heading = hero?.title || 'UNASHAMED';
  const subheading = hero?.content || '"Is your timidity worth someone else\'s eternity?"';
  const blurb = hero?.metadata?.blurb || 'A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed.';

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
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
          {hero?.metadata?.kicker || 'The Time Is Now'}
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
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
