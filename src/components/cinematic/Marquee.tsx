import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  /** Duplicate content enough times to loop seamlessly (default 2 copies shown, animated -50%). */
  copies?: number;
}

/**
 * Infinite horizontal ribbon. Content is duplicated so the -50% loop is
 * seamless; pause on hover via group-hover when wrapped.
 */
const Marquee = ({ children, className = "", duration = 40, reverse = false, copies = 2 }: MarqueeProps) => {
  const track = Array.from({ length: copies });
  return (
    <div className={cn("relative flex overflow-hidden select-none", className)} aria-hidden="true">
      <div
        className={cn("flex shrink-0 items-center animate-marquee", reverse && "marquee-reverse")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {track.map((_, i) => (
          <div key={i} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
