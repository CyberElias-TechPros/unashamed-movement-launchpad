import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight, Users, Globe, Download, Play, MapPin, Book } from "lucide-react";

interface Testimony {
  id: number;
  name: string;
  location: string;
  text: string;
  category: string;
}

const testimonies: Testimony[] = [
  {
    id: 1, name: "Sarah M.", location: "Lagos, Nigeria",
    text: "TTIN changed everything for me. I was a closet Christian — afraid to speak up at work, afraid to share my faith with friends. After joining the community, I found the courage to start a Bible study group in my office. 12 people have given their lives to Christ since then.",
    category: "Evangelism",
  },
  {
    id: 2, name: "David K.", location: "London, UK",
    text: "I grew up in church but never truly lived out my faith publicly. TTIN challenged me to stop being comfortable and start being courageous. I now share the Gospel on university campuses every week.",
    category: "Youth",
  },
  {
    id: 3, name: "Grace O.", location: "Houston, TX",
    text: "The resources and community from TTIN gave me the tools I needed to defend my faith with confidence. I no longer shy away from tough conversations about God.",
    category: "Apologetics",
  },
  {
    id: 4, name: "James A.", location: "Accra, Ghana",
    text: "Being part of TTIN showed me that boldness isn't about being loud — it's about being consistent. I've learned to live my faith in every area of my life, from my business to my relationships.",
    category: "Lifestyle",
  },
  {
    id: 5, name: "Priscilla N.", location: "Toronto, Canada",
    text: "I was struggling with fear of persecution as a Christian in my workplace. TTIN taught me that the fear of God should outweigh the fear of man. I am now unapologetic about my faith.",
    category: "Workplace",
  },
  {
    id: 6, name: "Emmanuel R.", location: "Nairobi, Kenya",
    text: "The Unashamed series was a game-changer for me. Every episode pushed me closer to living the bold life God called me to. I've since led 3 outreach programs in my community.",
    category: "Evangelism",
  },
];

const videoTestimonials = [
  {
    id: 1,
    title: "From Fear to Freedom",
    speaker: "Maria Rodriguez",
    location: "Spain",
    thumbnail: "Video thumbnail placeholder",
  },
  {
    id: 2,
    title: "Preaching on the London Underground",
    speaker: "James Thompson",
    location: "United Kingdom",
    thumbnail: "Video thumbnail placeholder",
  },
  {
    id: 3,
    title: "Campus Revival in Nairobi",
    speaker: "Samuel K",
    location: "Kenya",
    thumbnail: "Video thumbnail placeholder",
  },
];

const bookTestimonials = [
  {
    id: 1,
    quote: "This book completely transformed my understanding of what it means to be a bold witness for Christ.",
    reader: "Michael P.",
    location: "Australia",
  },
  {
    id: 2,
    quote: "I couldn't put it down! Every chapter challenged me to step out in faith.",
    reader: "Rachel S.",
    location: "Canada",
  },
  {
    id: 3,
    quote: "The most practical guide to evangelism I've ever read. Highly recommend!",
    reader: "David L.",
    location: "United States",
  },
];

const countries = [
  { name: "Canada", preachers: 8 },
  { name: "United States", preachers: 15 },
  { name: "United Kingdom", preachers: 12 },
  { name: "Australia", preachers: 6 },
  { name: "Nigeria", preachers: 18 },
  { name: "Hungary", preachers: 4 },
  { name: "Ghana", preachers: 10 },
  { name: "Kenya", preachers: 9 },
  { name: "Eswatini", preachers: 3 },
  { name: "Indonesia", preachers: 7 },
  { name: "Israel", preachers: 5 },
  { name: "India", preachers: 11 },
  { name: "Burundi", preachers: 2 },
  { name: "Cameroon", preachers: 4 },
  { name: "Poland", preachers: 3 },
  { name: "Spain", preachers: 5 },
];

const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];

const categories = ["All", "Evangelism", "Youth", "Apologetics", "Lifestyle", "Workplace"];

const Testimonies = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? testimonies
    : testimonies.filter((t) => t.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={15} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Real Stories, Real Faith
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Testimonies
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              Lives transformed by the courage to be unashamed. These are stories 
              from our community of bold believers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background sticky top-0 z-40 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
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
              { number: "100+", label: "People Preached Open Air", icon: <Users className="w-6 h-6" /> },
              { number: "16", label: "Countries Reached", icon: <Globe className="w-6 h-6" /> },
              { number: "158", label: "Books Downloaded", icon: <Download className="w-6 h-6" /> },
              { number: "7", label: "Types of Locations", icon: <MapPin className="w-6 h-6" /> },
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

      {/* Interactive Map Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Global Reach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                Interactive World Map
              </h2>
              <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
                See where people are preaching around the world
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-primary-foreground/20">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {countries.map((country) => (
                  <div
                    key={country.name}
                    className="bg-primary-foreground/10 rounded-lg p-4 text-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <div className="font-heading text-primary-foreground font-semibold">
                      {country.name}
                    </div>
                    <div className="font-body text-primary-foreground/60 text-sm mt-1">
                      {country.preachers} preachers
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Preaching Locations */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Where We Preach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Different Places People Have Preached
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {preachingLocations.map((location, index) => (
              <SectionWrapper key={location} delay={index * 0.05}>
                <div className="bg-card rounded-xl p-6 text-center border border-border hover:border-accent transition-colors">
                  <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                  <p className="font-heading text-foreground">{location}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Watch & Learn
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Professionally Recorded Testimonials
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Hear directly from people impacted by TTIN
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoTestimonials.map((video, index) => (
              <SectionWrapper key={video.id} delay={index * 0.1}>
                <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
                  <div className="relative aspect-video bg-black/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:bg-accent/90 transition-colors cursor-pointer">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-heading text-lg">{video.title}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="font-heading text-foreground mb-2">{video.speaker}</p>
                    <p className="font-body text-muted-foreground text-sm">{video.location}</p>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Written Testimonies */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Real Stories
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Written Testimonies Of TTIN Impact
              </h2>
            </div>
          </SectionWrapper>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group"
                >
                  <Quote className="text-accent mb-4" size={28} />
                  <p className="font-body text-card-foreground/80 leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-heading text-lg tracking-wider text-card-foreground">
                        {t.name}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {t.location}
                      </p>
                    </div>
                    <span className="text-xs font-body bg-muted text-muted-foreground px-3 py-1 rounded-full">
                      {t.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Book Testimonials */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Book Reviews
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Testimonials Of The Book
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                See what readers are saying about our book
              </p>
            </div>
          </SectionWrapper>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {bookTestimonials.map((review, index) => (
                  <div key={review.id} className="text-center">
                    <Book className="w-12 h-12 text-accent mx-auto mb-4" />
                    <p className="font-body text-card-foreground italic leading-relaxed mb-4">
                      "{review.quote}"
                    </p>
                    <p className="font-heading text-accent">
                      — {review.reader}, {review.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionWrapper>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
              Have A Story To Share?
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-10">
              Your testimony could inspire someone else to be bold. Join our community 
              and share how God has moved in your life.
            </p>
            <a
              href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="lg" className="px-10">
                Join Our Community <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonies;
