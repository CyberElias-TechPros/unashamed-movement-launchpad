import Marquee from "@/components/cinematic/Marquee";

const items = [
  "The Time Is Now",
  "Be Bold",
  "Be Unashamed",
  "Preach Everywhere",
  "16 Nations",
  "One Gospel",
];

/**
 * Kinetic brand ribbon separating major acts of the page.
 */
const RibbonSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-card/40 py-6 sm:py-8" aria-hidden="true">
      <Marquee duration={30}>
        {items.map((item, i) => (
          <span key={i} className="mx-8 flex items-center gap-8">
            <span className="font-heading text-4xl sm:text-6xl tracking-[0.08em] text-foreground/90 whitespace-nowrap">
              {item}
            </span>
            <span className="text-accent text-2xl sm:text-3xl">✦</span>
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
};

export default RibbonSection;
