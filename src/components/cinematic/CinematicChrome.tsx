import { motion, useScroll, useSpring } from "framer-motion";
import CustomCursor from "./CustomCursor";

/**
 * Global cinematic chrome: film grain, scroll progress hairline, and the
 * custom cursor. Mounted once inside Layout so every route inherits it.
 */
const CinematicChrome = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />
      <motion.div
        className="fixed top-0 left-0 right-0 z-[110] h-[2px] origin-left bg-gradient-gold"
        style={{ scaleX }}
        aria-hidden="true"
      />
      <CustomCursor />
    </>
  );
};

export default CinematicChrome;
