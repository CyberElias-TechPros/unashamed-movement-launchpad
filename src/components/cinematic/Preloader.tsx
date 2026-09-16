import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KineticText from "./KineticText";

/**
 * Opening cinematic: brand word rises out of black, then two curtains part to
 * reveal the page. Shown once per session (sessionStorage) and never longer
 * than ~2.4s so it never blocks the experience.
 */
const Preloader = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return !sessionStorage.getItem("ttin-intro-seen");
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("ttin-intro-seen", "1");
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-background"
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.3 } }}
          aria-hidden="true"
        >
          {/* parting curtains */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-primary"
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-primary"
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          />
          <div className="relative z-10 text-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 1.1 }}
              className="kicker mb-4"
            >
              The Time Is Now
            </motion.p>
            <h1 className="font-heading text-6xl sm:text-8xl tracking-wider text-foreground">
              <KineticText text="UNASHAMED" inView={false} stagger={0.05} />
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="mx-auto mt-6 h-px w-48 origin-center bg-accent/70"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
