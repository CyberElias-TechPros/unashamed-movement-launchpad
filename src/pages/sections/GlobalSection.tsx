import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import KineticText from "@/components/cinematic/KineticText";
import Marquee from "@/components/cinematic/Marquee";
import EmberGlow from "@/components/cinematic/EmberGlow";

const countries = [
  "Canada", "United States", "United Kingdom", "Australia", "Nigeria", "Hungary",
  "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi",
  "Cameroon", "Poland", "Spain",
];

const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];

const GlobalSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <EmberGlow intensity="low" />
      <div className="section-padding">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionWrapper>
                <div className="mb-5 flex items-center gap-4">
                  <span className="h-px w-12 bg-accent/70" />
                  <p className="kicker">Global Reach</p>
                </div>
                <h2 className="font-heading leading-[0.95] tracking-wide text-foreground">
                  <KineticText text="16" className="text-[10rem] leading-[0.8] sm:text-[14rem] text-gradient-gold" />
                  <span className="mt-4 block text-5xl sm:text-6xl">NATIONS &amp; COUNTING</span>
                </h2>
                <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-muted-foreground">
                  The fire doesn't respect borders. From Lagos buses to London streets, the
                  unashamed are rising everywhere.
                </p>
              </SectionWrapper>
            </div>

            <div className="lg:col-span-7">
              <SectionWrapper delay={0.15}>
                <p className="mb-6 font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Where we preach
                </p>
                <div className="border-t border-border">
                  {preachingLocations.map((location, i) => (
                    <motion.div
                      key={location}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-8%" }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="group flex items-baseline justify-between border-b border-border py-4 sm:py-5 transition-colors hover:bg-card/40"
                    >
                      <span className="font-heading text-2xl sm:text-4xl tracking-wider text-foreground/85 transition-colors group-hover:text-accent">
                        {location}
                      </span>
                      <span className="font-body text-xs tracking-[0.3em] text-muted-foreground/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </SectionWrapper>
            </div>
          </div>
        </div>

        {/* Country ribbons */}
        <div className="mt-16 space-y-3" aria-hidden="true">
          <Marquee duration={42} className="opacity-90">
            {countries.slice(0, 8).map((country) => (
              <span key={country} className="mx-4 rounded-full border border-border px-6 py-2.5 font-body text-sm tracking-wider text-foreground/80 whitespace-nowrap">
                {country}
              </span>
            ))}
          </Marquee>
          <Marquee duration={48} reverse className="opacity-60">
            {countries.slice(8).map((country) => (
              <span key={country} className="mx-4 rounded-full border border-accent/30 px-6 py-2.5 font-body text-sm tracking-wider text-accent whitespace-nowrap">
                {country}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default GlobalSection;
