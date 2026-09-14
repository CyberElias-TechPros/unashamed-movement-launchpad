import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";

const pillars = [
  {
    number: "01",
    label: "Our Mission",
    title: "Empower Bold Faith",
    body: "To inspire and equip Christians to live out their faith boldly and unapologetically. Timidity has no place in the life of a believer — we exist to ignite courage in the hearts of those called to share the Gospel.",
  },
  {
    number: "02",
    label: "Our Vision",
    title: "A Fearless Generation",
    body: "To see a generation of Christians who are unashamed of the Gospel, transforming communities and nations through radical, fearless love — a world where every believer walks in the fullness of their calling.",
  },
  {
    number: "03",
    label: "Our Charge",
    title: "The Time Is Now",
    body: "Every street is a pulpit. Every conversation is a summons. We go where the silence is loudest — campuses, buses, marketplaces, timelines — and we speak until the fire spreads.",
  },
];

const MissionSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <EmberGlow intensity="low" />
      <div className="section-padding">
        <div className="container-custom">
          <div className="mb-14 sm:mb-20 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionWrapper>
                <div className="mb-5 flex items-center gap-4">
                  <span className="h-px w-12 bg-accent/70" />
                  <p className="kicker">Our Purpose</p>
                </div>
                <h2 className="font-heading leading-[0.95] tracking-wide text-foreground">
                  <KineticText text="MISSION" className="text-6xl sm:text-8xl lg:text-9xl" />
                  <span className="block font-display italic font-normal text-gradient-gold text-4xl sm:text-6xl lg:text-7xl">
                    &amp; vision
                  </span>
                </h2>
              </SectionWrapper>
            </div>
            <SectionWrapper delay={0.15} className="lg:col-span-4">
              <p className="max-w-sm font-body text-lg leading-relaxed text-muted-foreground lg:ml-auto">
                Three convictions carry everything we build, print, preach, and post.
              </p>
            </SectionWrapper>
          </div>

          <div className="border-t border-border">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group grid gap-4 border-b border-border py-10 transition-colors duration-500 hover:bg-card/50 sm:py-12 lg:grid-cols-12 lg:gap-8"
              >
                <div className="lg:col-span-2">
                  <span className="font-heading text-5xl sm:text-6xl text-foreground/15 transition-colors duration-500 group-hover:text-accent/80">
                    {pillar.number}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <p className="kicker mb-3">{pillar.label}</p>
                  <h3 className="font-heading text-3xl sm:text-4xl tracking-wider text-foreground">
                    {pillar.title}
                  </h3>
                </div>
                <div className="lg:col-span-6">
                  <p className="font-body text-base sm:text-lg leading-relaxed text-muted-foreground">
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <SectionWrapper delay={0.15} className="mt-12">
            <Link
              to="/about"
              className="group inline-flex items-center gap-3 font-body text-sm font-semibold uppercase tracking-[0.25em] text-accent"
            >
              Read our full story
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              <span className="block h-px w-24 bg-accent/40 transition-all duration-500 group-hover:w-36 group-hover:bg-accent" />
            </Link>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
