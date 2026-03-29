import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Quote, ArrowRight } from "lucide-react";

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

      {/* Testimonies Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
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
              href="https://chat.whatsapp.com"
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
