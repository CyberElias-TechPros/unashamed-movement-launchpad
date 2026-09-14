import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmberGlowProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

/**
 * Layered ambient light: slow-drifting gold radial washes + a faint conic
 * beam. Sits behind content (absolute, -z or place first) and gives every
 * dark section a sense of stage light.
 */
const EmberGlow = ({ className = "", intensity = "medium" }: EmberGlowProps) => {
  const opacity = intensity === "high" ? 0.9 : intensity === "low" ? 0.4 : 0.65;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <motion.div
        className="absolute -top-[30%] left-1/2 h-[70vh] w-[110vw] -translate-x-1/2 rounded-[100%]"
        style={{
          opacity,
          background:
            "radial-gradient(ellipse at center, hsl(41 75% 52% / 0.14) 0%, hsl(41 75% 40% / 0.05) 45%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [opacity, opacity * 1.25, opacity] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[45%] -left-[20%] h-[80vh] w-[70vw] rounded-full"
        style={{
          opacity: opacity * 0.6,
          background: "radial-gradient(ellipse at center, hsl(28 60% 30% / 0.2) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "conic-gradient(from 210deg at 70% -10%, transparent 0deg, hsl(41 75% 52% / 0.05) 26deg, transparent 52deg, transparent 320deg, hsl(41 75% 52% / 0.04) 344deg, transparent 360deg)",
        }}
      />
    </div>
  );
};

export default EmberGlow;
