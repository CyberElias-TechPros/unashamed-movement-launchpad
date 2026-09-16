import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Cinematic trailing cursor: a gold ring that springs after the pointer and
 * expands over interactive elements. Rendered only on devices with a fine
 * pointer (desktop) — touch devices never see it (CSS also hides it).
 */
const CustomCursor = () => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.6 });
  const dotX = useSpring(x, { stiffness: 1200, damping: 60, mass: 0.2 });
  const dotY = useSpring(y, { stiffness: 1200, damping: 60, mass: 0.2 });
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor]");
      ringRef.current?.classList.toggle("is-active", !!interactive);
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  return (
    <>
      <motion.div ref={ringRef} className="ttin-cursor" style={{ x: ringX, y: ringY }} aria-hidden="true" />
      <motion.div ref={dotRef} className="ttin-cursor-dot" style={{ x: dotX, y: dotY }} aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
