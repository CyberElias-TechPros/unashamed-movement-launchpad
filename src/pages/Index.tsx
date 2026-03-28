import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ShoppingBag, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary-foreground/3 rounded-full" />
        </div>

        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="container-custom text-center relative z-10 pt-20"
        >
          <motion.p
            variants={itemVariant}
            className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-6"
          >
            The Timidity Is Not
          </motion.p>

          <motion.h1
            variants={itemVariant}
            className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-primary-foreground leading-none mb-8"
          >
            UNASHAMED
          </motion.h1>

          <motion.p
            variants={itemVariant}
            className="font-display italic text-xl sm:text-2xl lg:text-3xl text-primary-foreground/70 max-w-3xl mx-auto mb-4"
          >
            "Is your timidity worth someone else's eternity?"
          </motion.p>

          <motion.p
            variants={itemVariant}
            className="font-body text-primary-foreground/60 max-w-xl mx-auto mb-10 text-lg"
          >
            A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed.
          </motion.p>

          <motion.div
            variants={itemVariant}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/about">
              <Button variant="hero" size="lg" className="px-10">
                Join The Movement <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/unashamed">
              <Button variant="brand" size="lg" className="px-10">
                Watch Unashamed
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-16">
              <p className="font-body text-secondary text-sm tracking-[0.3em] uppercase mb-4">
                Our Purpose
              </p>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-wider text-foreground">
                Mission & Vision
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <SectionWrapper delay={0.1}>
              <div className="bg-primary rounded-2xl p-8 lg:p-12 h-full">
                <span className="text-accent font-heading text-xl tracking-wider">
                  Our Mission
                </span>
                <h3 className="font-heading text-3xl lg:text-4xl text-primary-foreground tracking-wider mt-4 mb-6">
                  Empower Bold Faith
                </h3>
                <p className="font-body text-primary-foreground/70 text-lg leading-relaxed">
                  To inspire and equip Christians to live out their faith boldly and unapologetically. 
                  We believe that timidity has no place in the life of a believer, and we exist to 
                  ignite courage in the hearts of those called to share the Gospel.
                </p>
              </div>
            </SectionWrapper>

            <SectionWrapper delay={0.2}>
              <div className="bg-secondary rounded-2xl p-8 lg:p-12 h-full">
                <span className="text-accent font-heading text-xl tracking-wider">
                  Our Vision
                </span>
                <h3 className="font-heading text-3xl lg:text-4xl text-secondary-foreground tracking-wider mt-4 mb-6">
                  A Fearless Generation
                </h3>
                <p className="font-body text-secondary-foreground/80 text-lg leading-relaxed">
                  To see a generation of Christians who are unashamed of the Gospel, 
                  transforming communities and nations through radical, fearless love. 
                  A world where every believer walks in the fullness of their calling.
                </p>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-16">
              <h2 className="font-heading text-5xl sm:text-6xl tracking-wider text-foreground">
                Get Involved
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar size={32} />,
                title: "Upcoming Events",
                desc: "Join us for life-changing events and gatherings designed to strengthen your faith.",
                link: "/events",
                label: "View Events",
              },
              {
                icon: <ShoppingBag size={32} />,
                title: "Shop Merch",
                desc: "Wear your faith boldly. Browse our collection of apparel and digital resources.",
                link: "/shop",
                label: "Shop Now",
              },
              {
                icon: <BookOpen size={32} />,
                title: "Resources",
                desc: "Access devotionals, guides, and tools to deepen your walk and sharpen your witness.",
                link: "/resources",
                label: "Explore",
              },
            ].map((item, i) => (
              <SectionWrapper key={item.title} delay={i * 0.15}>
                <Link to={item.link} className="group block">
                  <div className="bg-background rounded-2xl p-8 h-full border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                      {item.icon}
                    </div>
                    <h3 className="font-heading text-2xl tracking-wider text-foreground mb-3">
                      {item.title}
                    </h3>
                    <p className="font-body text-muted-foreground mb-6">
                      {item.desc}
                    </p>
                    <span className="font-heading text-lg tracking-wider text-accent group-hover:text-primary transition-colors inline-flex items-center gap-2">
                      {item.label} <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionWrapper>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Lives Changed
            </p>
            <h2 className="font-heading text-5xl sm:text-6xl tracking-wider text-primary-foreground mb-12">
              Testimonies
            </h2>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <blockquote className="font-display italic text-2xl sm:text-3xl text-primary-foreground/80 leading-relaxed mb-8">
                "TTIN changed my life. I went from being afraid to share my faith 
                to boldly proclaiming the Gospel everywhere I go."
              </blockquote>
              <p className="font-heading text-xl tracking-wider text-accent">
                — Community Member
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.3}>
            <Link to="/testimonies" className="inline-block mt-12">
              <Button variant="hero" size="lg" className="px-10">
                Read More Testimonies <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </SectionWrapper>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-padding bg-accent">
        <div className="container-custom text-center">
          <SectionWrapper>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-wider text-accent-foreground mb-6">
              Ready to Be Bold?
            </h2>
            <p className="font-body text-accent-foreground/70 text-xl max-w-2xl mx-auto mb-10">
              Stop hiding your light. The world needs what you carry. 
              Join a community of fearless believers today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/about">
                <Button variant="brand" size="lg" className="px-10">
                  Learn More
                </Button>
              </Link>
              <a href="https://chat.whatsapp.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="px-10 border-foreground text-foreground hover:bg-foreground hover:text-background">
                  Join Our Community
                </Button>
              </a>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
