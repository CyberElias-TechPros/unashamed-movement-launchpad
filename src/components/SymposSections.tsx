import { motion } from "framer-motion";
import { ArrowRight, Calendar, Music, Users, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/SectionWrapper";
import { HeroVideo } from "./VideoPlayer";

// TTIN Hero Section with Video Background
export const SymposHero = () => (
  <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
    {/* Video Background - Uses VideoPlayer component */}
    <HeroVideo videoSrc="" posterSrc="" />

    {/* "The Time is Now" overlay text */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
      <h2 className="font-heading text-4xl sm:text-6xl lg:text-8xl tracking-wider text-primary-foreground drop-shadow-lg">
        The Time is Now
      </h2>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="container-custom text-center relative z-10 pt-20"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/80 backdrop-blur-md rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto border border-primary-foreground/20"
      >
        <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
          The Time Is Now
        </p>
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
          UNASHAMED
        </h1>
        <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-8">
          Step out of the shadows and into the bold, unashamed life God designed for you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" className="px-8">
            Join Our Community <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

// TTIN Mission Section (Sympos Layout Style)
export const SymposJoin = () => (
  <section className="section-padding bg-background">
    <div className="container-custom">
      <SectionWrapper>
        <div className="text-center mb-8">
          <span className="text-accent font-heading text-xl tracking-wider">
            Our Mission
          </span>
        </div>
      </SectionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <SectionWrapper delay={0.1}>
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-6">
              The Time Is Now Movement
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
              Empowering believers to step out of comfort zones and boldly proclaim the Gospel in everyday situations. From buses and ferries to malls and airports, we're transforming ordinary moments into divine opportunities.
            </p>
            <Button variant="hero" size="lg" className="px-8">
              Join Our Community <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20" />
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-white" />
              </div>
              <p className="font-heading text-2xl text-foreground">Community Image</p>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  </section>
);

// TTIN Impact Section (Sympos Layout Style)
export const SymposLineup = () => {
  const impacts = [
    { name: "100+ People Preached", img: "100+" },
    { name: "16 Countries Reached", img: "16" },
    { name: "158 Book Downloads", img: "158" },
    { name: "Multiple Locations", img: "ML" },
    { name: "Growing Community", img: "GC" },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <span className="text-accent font-heading text-xl tracking-wider">
              Impact
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-4">
              Lives transformed through bold faith
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {impacts.map((impact, index) => (
            <SectionWrapper key={impact.name} delay={index * 0.1}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="font-heading text-3xl text-primary-foreground/30">
                      {impact.img}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-all duration-300 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-heading text-sm tracking-wider">
                      {impact.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

// TTIN Statistics Section (Sympos Layout Style)
export const SymposImpact = () => (
  <section className="section-padding bg-primary">
    <div className="container-custom">
      <SectionWrapper>
        <div className="text-center mb-12">
          <span className="text-accent font-heading text-xl tracking-wider">
            Statistics
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-primary-foreground mb-4">
            The impact of bold faith
          </h2>
        </div>
      </SectionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {[
          { number: "100+", label: "People Preached To" },
          { number: "16", label: "Countries Reached" },
          { number: "158", label: "Book Downloads" },
        ].map((stat, index) => (
          <SectionWrapper key={stat.label} delay={index * 0.1}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-card rounded-2xl p-8 border border-primary-foreground/20">
                <div className="font-heading text-5xl lg:text-6xl text-accent mb-2">
                  {stat.number}
                </div>
                <div className="font-body text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          </SectionWrapper>
        ))}
      </div>

      <SectionWrapper delay={0.4}>
        <div className="text-center mt-12">
          <Button variant="hero" size="lg" className="px-8">
            Join Our Community <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </SectionWrapper>
    </div>
  </section>
);

// TTIN Locations Section (Sympos Layout Style)
export const SymposRundown = () => {
  const locations = [
    { time: "Daily", day: "L1", event: "Bus Preaching", desc: "Boldly sharing the Gospel on public transportation" },
    { time: "Daily", day: "L2", event: "Ferry Evangelism", desc: "Reaching commuters with the message of hope" },
    { time: "Daily", day: "L3", event: "Mall Outreach", desc: "Engaging shoppers in spiritual conversations" },
    { time: "Daily", day: "L4", event: "Airport Ministry", desc: "Sharing faith with travelers from around the world" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <span className="text-accent font-heading text-xl tracking-wider">
              Preaching Locations
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-4">
              Taking the Gospel everywhere
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {locations.map((item, index) => (
            <SectionWrapper key={index} delay={index * 0.1}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-heading text-foreground">{item.time}</span>
                      <span className="text-accent">-</span>
                      <span className="font-heading text-accent">{item.event}</span>
                    </div>
                    <p className="font-body text-muted-foreground text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

// TTIN Resources Section (Sympos Layout Style)
export const SymposEvent = () => {
  const resources = [
    { icon: "📚", title: "Books & Guides", desc: "Free resources to grow your faith" },
    { icon: "🎥", title: "Video Testimonies", desc: "Real stories of transformed lives" },
    { icon: "🎧", title: "Podcast Series", desc: "Bold faith discussions and teachings" },
    { icon: "🤝", title: "Community", desc: "Connect with other bold believers" },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <span className="text-accent font-heading text-xl tracking-wider">
              Resources
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-4">
              Everything you need to stay bold
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <SectionWrapper key={resource.title} delay={index * 0.1}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 text-center border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{resource.icon}</div>
                <h3 className="font-heading text-xl tracking-wider text-foreground mb-2">
                  {resource.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm">
                  {resource.desc}
                </p>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

// TTIN Newsletter Section (Sympos Layout Style)
export const SymposPricing = () => (
  <section className="section-padding bg-primary">
    <div className="container-custom">
      <SectionWrapper>
        <div className="text-center mb-12">
          <span className="text-accent font-heading text-xl tracking-wider">
            Stay Connected
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-primary-foreground mb-4">
            Join our newsletter for updates
          </h2>
        </div>
      </SectionWrapper>

      <div className="max-w-md mx-auto">
        <SectionWrapper delay={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 border border-primary-foreground/20"
          >
            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-2">
                Free Resources
              </h3>
              <div className="font-heading text-5xl lg:text-6xl text-accent mb-6">
                FREE
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Free books and guides",
                "Video testimonies and teachings",
                "Community access and support",
                "Regular encouragement and updates",
                "Bold faith challenges",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">+</span>
                  </div>
                  <span className="font-body text-card-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="w-full">
              Subscribe Now
            </Button>
          </motion.div>
        </SectionWrapper>
      </div>
    </div>
  </section>
);

// TTIN Testimonials Section (Sympos Layout Style)
export const SymposTestimonials = () => (
  <section className="section-padding bg-background">
    <div className="container-custom">
      <SectionWrapper>
        <div className="text-center mb-12">
          <span className="text-accent font-heading text-xl tracking-wider">
            Testimonials
          </span>
        </div>
      </SectionWrapper>

      <div className="max-w-4xl mx-auto">
        <SectionWrapper delay={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 lg:p-12 border border-border"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                <span className="font-heading text-3xl text-muted-foreground">TTIN</span>
              </div>
              <div className="lg:col-span-2">
                <blockquote className="font-display italic text-2xl lg:text-3xl text-card-foreground leading-relaxed mb-6">
                  "TTIN changed my life. I went from being afraid to share my faith to boldly proclaiming the Gospel everywhere I go."
                </blockquote>
                <p className="font-heading text-xl tracking-wider text-accent">
                  - Sarah T.
                </p>
              </div>
            </div>
          </motion.div>
        </SectionWrapper>
      </div>
    </div>
  </section>
);

// TTIN CTA Section (Sympos Layout Style)
export const SymposCTA = () => (
  <section className="section-padding bg-accent">
    <div className="container-custom text-center">
      <SectionWrapper>
        <span className="text-accent-foreground font-heading text-xl tracking-wider">
          The Time Is Now
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-wider text-accent-foreground mb-6">
          Don't Just Believe It, Live It.
        </h2>
        <p className="font-body text-accent-foreground/70 text-xl max-w-2xl mx-auto mb-10">
          Step out in bold faith. Transform your world. Join the movement.
        </p>
        <Button variant="brand" size="lg" className="px-8 bg-accent-foreground hover:bg-accent-foreground/90 text-accent">
          Join Our Community
        </Button>
      </SectionWrapper>
    </div>
  </section>
);
