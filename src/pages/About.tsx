import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import PageHero from "@/components/cinematic/PageHero";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import TiltCard from "@/components/TiltCard";
import { Heart, Users, Globe, Target } from "lucide-react";
import { teamMembers } from "@/data/team";

const values = [
  { icon: <Heart size={26} />, title: "Bold Love", desc: "We lead with love that's courageous, not comfortable." },
  { icon: <Users size={26} />, title: "Community", desc: "We grow stronger together, sharpening and supporting one another." },
  { icon: <Globe size={26} />, title: "Global Reach", desc: "Our mission extends to every nation, every tribe, every tongue." },
  { icon: <Target size={26} />, title: "Purpose-Driven", desc: "Everything we do is intentional and rooted in the Word." },
];

const About = () => {
  return (
    <Layout>
      <PageHero
        kicker="Our Story"
        title="ABOUT TTIN"
        italic="born from a whispered yes"
        description="The Time Is Now is a faith movement born of a burning desire to see Christians live boldly and unapologetically for Christ. We exist to challenge the culture of silence and inspire believers to speak up."
      />

      {/* Origin story — editorial long-form */}
      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom">
            <div className="mx-auto max-w-3xl">
              <SectionWrapper>
                <div className="mb-10 flex items-center gap-4">
                  <span className="h-px w-12 bg-accent/70" />
                  <p className="kicker">How It Started</p>
                </div>
                <h2 className="mb-12 font-heading leading-[0.95] tracking-wide text-foreground">
                  <KineticText text="THE BIRTH OF" className="text-5xl sm:text-7xl" />
                  <span className="block font-display italic font-normal text-gradient-gold text-4xl sm:text-6xl">
                    a movement
                  </span>
                </h2>
              </SectionWrapper>

              <SectionWrapper delay={0.1}>
                <div className="space-y-8 border-l-2 border-accent/30 pl-8 sm:pl-12">
                  <p className="font-body text-lg sm:text-xl leading-relaxed text-foreground/90">
                    <span className="float-left mr-3 mt-1 font-heading text-7xl leading-[0.7] text-gradient-gold">F</span>
                    ebruary 2025. I'm sitting in a Pastor's training program, listening to my Pastor,
                    Pastor Chris Oyakhilome, talk about Christians who preach open air. And the way he's
                    talking about them… it's different. There's honor in his voice, almost like heaven
                    itself is proud of people who live that boldly.
                  </p>
                  <p className="font-body text-lg sm:text-xl leading-relaxed text-foreground/90">
                    While he's ministering, the Holy Spirit speaks to me so clearly:{" "}
                    <em className="font-display text-gradient-gold not-italic">
                      "This shouldn't be rare. This is supposed to be normal."
                    </em>{" "}
                    Boldness for Christ isn't for a "special few". It's the standard. Every Christian
                    is meant to be daring. Unashamed. Public.
                  </p>
                  <p className="font-body text-lg sm:text-xl leading-relaxed text-foreground/90">
                    Then the Lord showed me a vision of myself preaching on the plane back home. He said,
                    "You know what you have to do." I didn't argue, I didn't negotiate. I just said,
                    "Yes, Lord. I'll do it."
                  </p>
                  <p className="font-body text-lg sm:text-xl leading-relaxed text-foreground/90">
                    So I did. I preached, recorded it and posted it on Instagram. The video started
                    spreading — shares, messages, comments. Then one message stopped me in my tracks: a
                    lady watched the video, and it inspired her to preach on a bus. After she preached,
                    two other Christians got stirred and preached on buses too.
                  </p>
                  <p className="font-display italic text-2xl sm:text-3xl leading-snug text-gradient-gold">
                    That's when it hit me. This wasn't just a moment — it was a movement.
                  </p>
                </div>
              </SectionWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* The first video */}
      <section className="relative overflow-hidden border-y border-border bg-card/30">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">The Moment That Started It All</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-6 font-heading tracking-wide text-foreground">
                <KineticText text="THE FIRST VIDEO" className="text-5xl sm:text-7xl" />
              </h2>
              <p className="mx-auto mb-12 max-w-2xl font-body text-lg text-muted-foreground">
                Watch the original plane preaching video that sparked a global movement.
              </p>
            </SectionWrapper>

            <SectionWrapper delay={0.15}>
              <div className="relative mx-auto max-w-5xl">
                <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-b from-accent/20 to-transparent blur-xl" aria-hidden="true" />
                <div className="vignette relative aspect-video overflow-hidden rounded-2xl border border-border bg-black">
                  <video
                    src="/videos/plane-preaching.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    <source src="/videos/plane-preaching.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper delay={0.25}>
              <p className="mx-auto mt-12 max-w-3xl text-center font-body text-lg leading-relaxed text-muted-foreground">
                This single act of obedience sparked a chain reaction reaching over{" "}
                <span className="text-accent">16 countries</span> and inspiring more than{" "}
                <span className="text-accent">100 people</span> to preach openly. What began as one
                "Yes" has become a global movement of unashamed believers taking the Gospel to every
                corner of society.
              </p>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom max-w-3xl">
            <SectionWrapper>
              <div className="mb-10 flex items-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Our Journey</p>
              </div>
            </SectionWrapper>
            <ol className="relative space-y-12 border-l border-accent/40 pl-10">
              {[
                { year: "2024", title: "The spark", desc: "Believers began sharing bold faith stories online and in small groups." },
                { year: "Feb 2025", title: "Plane preaching", desc: "Open-air preaching on a flight ignited a global movement across 16 countries." },
                { year: "2025", title: "TTIN launches", desc: "Resources, merch, events, and testimonies unite under The Time Is Now." },
                { year: "Now", title: "The fire spreads", desc: "A growing family of the unashamed in 16 nations — and counting." },
              ].map((item, i) => (
                <motion.li
                  key={item.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="relative"
                >
                  <span className="absolute -left-[3.05rem] top-1 h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_14px_hsl(41_75%_52%/0.8)]" />
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">{item.year}</p>
                  <h3 className="mt-1 font-heading text-3xl tracking-wider text-foreground">{item.title}</h3>
                  <p className="mt-2 font-body text-muted-foreground">{item.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden border-y border-border bg-card/20">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">What We Stand For</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-16 font-heading tracking-wide text-foreground">
                <KineticText text="OUR VALUES" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <SectionWrapper key={v.title} delay={i * 0.08}>
                  <TiltCard className="group relative h-full rounded-2xl border border-border bg-background p-8 text-center transition-all duration-500 hover:border-accent/60">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                      {v.icon}
                    </div>
                    <h3 className="mb-3 font-heading text-2xl tracking-wider text-foreground">{v.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{v.desc}</p>
                  </TiltCard>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom text-center">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">The People Behind The Movement</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-14 font-heading tracking-wide text-foreground">
                <KineticText text="LEADERSHIP" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>
            <SectionWrapper delay={0.15}>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="group rounded-2xl border border-border bg-card/50 p-8 transition-all duration-500 hover:border-accent/50 hover:bg-card"
                  >
                    <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border-2 border-accent/30 bg-secondary font-heading text-4xl text-accent transition-all duration-500 group-hover:border-accent group-hover:shadow-[0_0_30px_hsl(41_75%_52%/0.35)]">
                      {member.name.charAt(0)}
                    </div>
                    <h4 className="font-heading text-2xl tracking-wider text-foreground">{member.name}</h4>
                    <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                      {member.role}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">{member.bio}</p>
                  </div>
                ))}
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
