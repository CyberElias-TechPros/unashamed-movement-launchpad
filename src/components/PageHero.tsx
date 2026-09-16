import { ReactNode } from "react";

interface PageHeroProps {
  kicker: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  theme?: "dark" | "black";
  background?: ReactNode;
}

/**
 * Prototype page hero — full-bleed dark section with gold mono kicker,
 * giant heading and optional background layers (video / gradients / orbs).
 * Mirrors ttin.techpros.com.ng page headers.
 */
const PageHero = ({
  kicker,
  title,
  subtitle,
  children,
  theme = "dark",
  background,
}: PageHeroProps) => {
  return (
    <section
      className={`page-section full-bleed-section section-theme-${theme} section-height--large`}
      data-test="page-section"
      data-section-theme={theme}
    >
      <div className="section-border" />
      <div className="section-background">
        {background ?? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#eab308]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#eab308]/5 blur-3xl pointer-events-none" />
          </>
        )}
      </div>
      <div className="content-wrapper relative z-10">
        <div className="content container-custom pt-32 pb-16 md:pt-44 md:pb-24">
          <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
            {kicker}
          </p>
          <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-white/50 text-lg max-w-3xl">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
