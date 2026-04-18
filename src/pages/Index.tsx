import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ShoppingBag, BookOpen, Play, MapPin, Users, Globe, MessageSquare } from "lucide-react";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import MagneticButton from "@/components/MagneticButton";
import TextReveal from "@/components/TextReveal";
import TiltCard from "@/components/TiltCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLayout } from "@/context/LayoutContext";
import SymposIndex from "./SymposIndex";

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
  const { layoutMode } = useLayout();
  const { toast } = useToast();
  
  // Render Sympos layout if active
  if (layoutMode === "sympos") {
    return <SymposIndex />;
  }
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our latest updates.",
    });
  };
  
  const testimonials = [
    "TTIN changed my life. I went from being afraid to share my faith to boldly proclaiming the Gospel everywhere I go.",
    "After watching the plane preaching video, I felt compelled to preach on my bus. Three people accepted Christ that day!",
    "The community here is amazing. I finally found people who understand the urgency of the Gospel.",
    "I never thought I could preach in public, but TTIN gave me the courage and tools I needed.",
    "The resources and testimonies have equipped me to be a bold witness in my workplace.",
    "Because of TTIN, I've seen 15 people come to Christ in my neighborhood this year alone."
  ];
  
  const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] border border-primary-foreground/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] border border-primary-foreground/3 rounded-full" />
        </div>

        <FloatingParticles count={25} color="hsl(43 78% 56%)" />

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
            The Time Is Now
          </motion.p>

          <TextReveal
            text="UNASHAMED"
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-wider text-primary-foreground leading-none mb-8"
            delay={0.3}
          />

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
            <MagneticButton>
              <Link to="/about">
                <Button variant="hero" size="lg" className="px-10">
                  Join The Movement <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/unashamed">
                <Button variant="brand" size="lg" className="px-10">
                  Watch Unashamed
                </Button>
              </Link>
            </MagneticButton>
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
            <div className="text-center mb-8 sm:mb-16">
              <p className="font-body text-secondary text-sm tracking-[0.3em] uppercase mb-4">
                Our Purpose
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-wider text-foreground">
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

      {/* Video Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                The Movement
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                The Time Is Now
              </h2>
              <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
                Watch bold Christians preaching open air around the world
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden bg-black/20 aspect-video max-w-5xl mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-accent/90 transition-colors cursor-pointer">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-primary-foreground/80 text-lg">
                    Video of people preaching open air with "The Time is Now"
                  </p>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Testimonials Slider - Scrolling across screen */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Real Stories
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Lives Transformed
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Hear from people who have been impacted by the movement
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="relative">
              <div className="overflow-x-auto pb-8 hide-scrollbar">
                <div className="flex gap-6 animate-scroll">
                  {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index % testimonials.length) * 0.1 }}
                      className="flex-shrink-0 w-[350px] md:w-[400px]"
                    >
                      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border h-full">
                        <div className="flex items-start gap-3 mb-4">
                          <MessageSquare className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <p className="font-body text-muted-foreground text-xs uppercase tracking-wider">
                            #{index + 1}
                          </p>
                        </div>
                        <p className="font-body text-foreground text-base leading-relaxed mb-4 line-clamp-4">
                          "{testimonial}"
                        </p>
                        <p className="font-heading text-accent text-sm">
                          — TTIN Community
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-accent/30" />
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                By The Numbers
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Our Impact
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "100+", label: "People Preached", icon: <Users className="w-6 h-6" /> },
              { number: "16", label: "Countries Reached", icon: <Globe className="w-6 h-6" /> },
              { number: "7", label: "Types of Locations", icon: <MapPin className="w-6 h-6" /> },
              { number: "158", label: "Books Downloaded", icon: <BookOpen className="w-6 h-6" /> },
            ].map((stat, index) => (
              <SectionWrapper key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                    {stat.icon}
                  </div>
                  <div className="font-heading text-4xl lg:text-5xl text-accent mb-2">
                    {stat.number}
                  </div>
                  <div className="font-body text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Preaching Locations */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Where We Preach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                Bold Everywhere
              </h2>
              <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
                From buses to airplanes, we're taking the Gospel to every corner of society
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {preachingLocations.map((location, index) => (
              <SectionWrapper key={location} delay={index * 0.05}>
                <div className="bg-card rounded-xl p-6 text-center border border-primary-foreground/20 hover:border-accent transition-colors">
                  <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                  <p className="font-heading text-primary-foreground">{location}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Reached */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Global Reach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Countries Reached
              </h2>
            </div>
          </SectionWrapper>

          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {["Canada", "United States", "United Kingdom", "Australia", "Nigeria", "Hungary", "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi", "Cameroon", "Poland", "Spain"].map((country) => (
              <span
                key={country}
                className="px-4 py-2 bg-accent/10 text-accent rounded-full font-body border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="section-padding bg-accent">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <SectionWrapper>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-accent-foreground mb-6">
                Stay Connected
              </h2>
              <p className="font-body text-accent-foreground/80 text-xl mb-8">
                Get the latest updates, testimonies, and resources delivered to your inbox
              </p>
            </SectionWrapper>

            <SectionWrapper delay={0.2}>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/10 border-accent-foreground/20 text-accent-foreground placeholder:text-accent-foreground/50 h-12"
                    required
                  />
                </div>
                <Button type="submit" className="bg-accent-foreground hover:bg-accent-foreground/90 text-accent px-8 h-12">
                  Subscribe
                </Button>
              </form>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground">
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
                  <TiltCard className="relative bg-background rounded-2xl p-8 h-full border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
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
                  </TiltCard>
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
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-12">
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
              <MagneticButton>
                <Button variant="hero" size="lg" className="px-10">
                  Read More Testimonies <ArrowRight className="ml-2" size={18} />
                </Button>
              </MagneticButton>
            </Link>
          </SectionWrapper>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionWrapper>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-wider text-primary-foreground mb-6">
              Ready to Be Bold?
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-10">
              Stop hiding your light. The world needs what you carry. 
              Join a community of fearless believers today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link to="/about">
                  <Button variant="hero" size="lg" className="px-10">
                    Learn More
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna" target="_blank" rel="noopener noreferrer">
                  <Button variant="brand" size="lg" className="px-10">
                    Join Our Community
                  </Button>
                </a>
              </MagneticButton>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
