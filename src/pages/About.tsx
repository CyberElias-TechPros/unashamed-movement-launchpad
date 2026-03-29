import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import { Heart, Users, Globe, Target } from "lucide-react";

const values = [
  { icon: <Heart size={28} />, title: "Bold Love", desc: "We lead with love that's courageous, not comfortable." },
  { icon: <Users size={28} />, title: "Community", desc: "We grow stronger together, sharpening and supporting one another." },
  { icon: <Globe size={28} />, title: "Global Reach", desc: "Our mission extends to every nation, every tribe, every tongue." },
  { icon: <Target size={28} />, title: "Purpose-Driven", desc: "Everything we do is intentional and rooted in the Word." },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={18} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Our Story
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              About TTIN
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl leading-relaxed">
              The Timidity Is Not (TTIN) is a faith-based movement born out of a 
              burning desire to see Christians live boldly and unapologetically for Christ. 
              We exist to challenge the culture of silence and inspire believers to speak up.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionWrapper>
              <div className="bg-primary rounded-2xl aspect-[4/3] flex items-center justify-center">
                <span className="font-heading text-4xl sm:text-6xl lg:text-8xl text-accent tracking-wider">TTIN</span>
              </div>
            </SectionWrapper>
            <SectionWrapper delay={0.2}>
              <p className="font-body text-secondary text-sm tracking-[0.3em] uppercase mb-4">
                How It Started
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl tracking-wider text-foreground mb-6">
                The Beginning
              </h2>
              <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                TTIN began as a small group of passionate believers who noticed a troubling 
                trend — Christians shrinking back from their faith in a world that desperately 
                needs the truth. We decided that timidity was not an option.
              </p>
              <p className="font-body text-muted-foreground text-lg leading-relaxed">
                What started as conversations among friends has grown into a movement 
                that spans social media, live events, and now this platform — all dedicated 
                to one mission: empowering believers to be unashamed.
              </p>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-8 sm:mb-16">
              <p className="font-body text-secondary text-sm tracking-[0.3em] uppercase mb-4">
                What We Stand For
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground">
                Our Values
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <SectionWrapper key={v.title} delay={i * 0.1}>
                <TiltCard className="relative bg-background rounded-2xl p-8 text-center border border-border hover:border-accent transition-all duration-500 hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                    {v.icon}
                  </div>
                  <h3 className="font-heading text-xl tracking-wider text-foreground mb-3">
                    {v.title}
                  </h3>
                  <p className="font-body text-muted-foreground">{v.desc}</p>
                </TiltCard>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Leadership placeholder */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionWrapper>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              The People Behind The Movement
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-12">
              Leadership
            </h2>
          </SectionWrapper>
          <SectionWrapper delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-secondary mx-auto mb-4" />
                  <h4 className="font-heading text-xl tracking-wider text-primary-foreground">
                    Team Member
                  </h4>
                  <p className="font-body text-primary-foreground/60 text-sm">
                    Role / Title
                  </p>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default About;
