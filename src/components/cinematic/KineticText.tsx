import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KineticTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** When false, plays on mount instead of on scroll into view. */
  inView?: boolean;
}

/**
 * Per-character rise + rotate reveal with soft blur — the signature headline
 * treatment. Falls back to a plain string for screen readers via aria-label.
 */
const KineticText = ({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  stagger = 0.03,
  once = true,
  inView = true,
}: KineticTextProps) => {
  const chars = Array.from(text);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const child = {
    hidden: { opacity: 0, y: "0.7em", rotate: 6, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: "0em",
      rotate: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 16, stiffness: 140 },
    },
  };

  return (
    <motion.span
      role="text"
      aria-label={text}
      variants={container}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible" as const, viewport: { once, margin: "-12% 0px" } }
        : { animate: "visible" as const })}
      className={cn("inline-block overflow-visible", className)}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          variants={child}
          className={cn("inline-block will-change-transform", char === " " && "w-[0.28em]", charClassName)}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default KineticText;
