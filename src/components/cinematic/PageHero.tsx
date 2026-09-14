import { ReactNode } from "react";
import { motion } from "framer-motion";
import KineticText from "./KineticText";
import EmberGlow from "./EmberGlow";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  kicker: string;
  title: string;
  /** Second line rendered in italic Playfair for editorial contrast. */
  italic?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
  backgroundImage?: string;
}

/**
 * Cinematic hero for interior pages: oversized kinetic display type, gold
 * kicker with hairline rules, ambient ember light, and a slow parallax fade
 * as the section leaves the viewport.
 */
const PageHero = ({
  kicker,
  title,
  italic,
  description,
  children,
  className = "",
  align = "left",
  backgroundImage,
}: PageHeroProps) => {
  const centered = align === "center";
  return (
    <section className={cn("relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24 vignette", className)}>
      {backgroundImage && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={backgroundImage} alt="" className="h-full w-full object-cover duotone-candle opacity-25" />
        </motion.div>
      )}
      <EmberGlow />

      <div className={cn("container-custom relative z-10", centered && "text-center")}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={cn("flex items-center gap-4 mb-6", centered && "justify-center")}
        >
          <span className="hidden sm:block h-px w-10 bg-accent/60" />
          <p className="kicker">{kicker}</p>
          <span className="hidden sm:block h-px w-10 bg-accent/60" />
        </motion.div>

        <h1 className="font-heading leading-[0.9] tracking-wide text-foreground">
          <KineticText text={title} inView={false} stagger={0.045} className="text-6xl sm:text-8xl lg:text-9xl" />
          {italic && (
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 block font-display italic font-normal text-gradient-gold text-4xl sm:text-6xl lg:text-7xl tracking-normal"
            >
              {italic}
            </motion.span>
          )}
        </h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className={cn("font-body text-muted-foreground text-lg sm:text-xl max-w-2xl mt-7 leading-relaxed", centered && "mx-auto")}
          >
            {description}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
