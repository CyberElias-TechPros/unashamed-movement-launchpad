import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import TiltCard from "@/components/TiltCard";
import { Heart, Users, Globe, Target, Play } from "lucide-react";

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
              The Time Is Now (TTIN) is a faith-based movement born out of a 
              burning desire to see Christians live boldly and unapologetically for Christ. 
              We exist to challenge the culture of silence and inspire believers to speak up.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                How It Started
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                The Birth of a Movement
              </h2>
            </div>
          </SectionWrapper>

          <div className="max-w-4xl mx-auto">
            <SectionWrapper delay={0.2}>
              <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border">
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-foreground text-xl leading-relaxed mb-6">
                    It's February 2025. I'm sitting in a Pastor's training program, listening to my Pastor, Pastor Chris Oyakhilome, talk about Christians who preach open air. And the way he's talking about them... it's different. There's honor in his voice, almost like heaven itself is proud of people who live that boldly.
                  </p>
                  
                  <p className="font-body text-foreground text-xl leading-relaxed mb-6">
                    While he's ministering, the Holy Spirit speaks to me so clearly. He says, <strong>"This shouldn't be rare. This is supposed to be normal."</strong> He showed me that boldness for Christ isn't for a "special few". It's the standard. Every Christian is meant to be daring. Unashamed. Public.
                  </p>
                  
                  <p className="font-body text-foreground text-xl leading-relaxed mb-6">
                    Then the Lord showed me a vision of myself preaching on the plane back home. He said, "You know what you have to do." I didn't argue, I didn't negotiate. I just said, "Yes, Lord. I'll do it."
                  </p>
                  
                  <p className="font-body text-foreground text-xl leading-relaxed mb-8">
                    So I did. I preached, recorded it and I posted it on Instagram. And honestly? I didn't expect what happened next. The video started spreading. Shares. Messages. Comments. But then one message stopped me in my tracks. A lady told me she watched the video, and it inspired her to preach on a bus. After she preached, two other Christians who were there got stirred and they also were inspired to preach on buses.
                  </p>
                  
                  <p className="font-body text-foreground text-xl leading-relaxed font-semibold text-accent">
                    That's when it hit me. This wasn't just a moment, it was a movement. And that's how The Time is Now was born.
                  </p>
                </div>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Plane Preaching Video Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                The Moment That Started It All
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                The First Video
              </h2>
              <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
                Watch the original plane preaching video that sparked a global movement
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden bg-black/20 aspect-video max-w-5xl mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-accent/90 transition-colors cursor-pointer">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-primary-foreground text-xl font-heading">
                    Initial video of me preaching on the plane
                  </p>
                  <p className="text-primary-foreground/60 mt-2">
                    The video that started it all
                  </p>
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.3}>
            <div className="text-center mt-12">
              <div className="max-w-3xl mx-auto">
                <p className="font-body text-primary-foreground/80 text-lg leading-relaxed">
                  This single act of obedience sparked a chain reaction that has now reached 
                  over 16 countries and inspired more than 100 people to preach openly. 
                  What began as one person saying "Yes" to God has become a global movement 
                  of unashamed believers taking the Gospel to every corner of society.
                </p>
              </div>
            </div>
          </SectionWrapper>
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
