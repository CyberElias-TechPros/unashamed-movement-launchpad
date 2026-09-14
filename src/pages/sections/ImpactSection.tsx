import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import SectionWrapper from "@/components/SectionWrapper";
import KineticText from "@/components/cinematic/KineticText";

const stats = [
  { end: 100, suffix: "+", label: "People Preached To" },
  { end: 16, suffix: "", label: "Countries Reached" },
  { end: 7, suffix: "", label: "Types of Locations" },
  { end: 158, suffix: "", label: "Books Downloaded" },
];

const ImpactSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/30">
      {/* watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className="select-none font-heading text-[26vw] leading-none tracking-tight text-foreground/[0.03]">
          IMPACT
        </span>
      </div>

      <div className="section-padding relative">
        <div className="container-custom">
          <div className="mb-14 text-center sm:mb-20">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">By The Numbers</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="font-heading tracking-wide text-foreground">
                <KineticText text="FIRE SPREADS" className="text-5xl sm:text-7xl lg:text-8xl" />
              </h2>
            </SectionWrapper>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-background p-8 sm:p-12 text-center transition-colors duration-500 hover:bg-card"
              >
                <div className="font-heading text-6xl sm:text-7xl lg:text-8xl leading-none text-gradient-gold">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <p className="mt-4 font-body text-xs sm:text-sm uppercase tracking-[0.25em] text-muted-foreground transition-colors group-hover:text-foreground">
                  {stat.label}
                </p>
                <span className="absolute inset-x-8 bottom-0 block h-px scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
