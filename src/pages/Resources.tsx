import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, FileText, Headphones, ExternalLink } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "devotional" | "guide" | "article" | "podcast";
  downloadUrl: string;
  free: boolean;
}

const resources: Resource[] = [
  { id: 1, title: "30 Days of Boldness", description: "A transformative devotional that walks you through 30 days of building courage in your faith.", type: "devotional", downloadUrl: "#", free: false },
  { id: 2, title: "How to Share Your Faith", description: "A practical, no-fluff guide to starting gospel conversations naturally.", type: "guide", downloadUrl: "#", free: true },
  { id: 3, title: "The Unashamed Manifesto", description: "Our foundational document outlining what it means to live a life unashamed of the Gospel.", type: "article", downloadUrl: "#", free: true },
  { id: 4, title: "Bold Faith Podcast — Season 1", description: "Listen to conversations with believers who are changing the world through unashamed faith.", type: "podcast", downloadUrl: "#", free: true },
  { id: 5, title: "Scripture Memory Cards", description: "Printable cards with key scriptures on boldness, courage, and faith for daily meditation.", type: "guide", downloadUrl: "#", free: true },
  { id: 6, title: "Evangelism Conversation Starters", description: "50+ natural conversation starters to help you transition into gospel conversations.", type: "guide", downloadUrl: "#", free: false },
];

const typeIcons = {
  devotional: <BookOpen size={20} />,
  guide: <FileText size={20} />,
  article: <FileText size={20} />,
  podcast: <Headphones size={20} />,
};

const types = ["All", "devotional", "guide", "article", "podcast"];

const Resources = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? resources : resources.filter((r) => r.type === filter);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={12} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">Grow Your Faith</p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">Resources</h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
              Tools, guides, and content to equip you for bold, unashamed living.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 capitalize ${
                filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {t === "All" ? "All Resources" : t}
            </button>
          ))}
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      {typeIcons[resource.type]}
                    </div>
                    <div>
                      <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                        {resource.type}
                      </span>
                      {resource.free && (
                        <span className="ml-2 text-xs bg-dark-spruce text-parchment px-2 py-0.5 rounded-full font-heading tracking-wider">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-3">
                    {resource.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm mb-6 flex-1">
                    {resource.description}
                  </p>
                  <Button variant="default" size="sm" className="w-full gap-2">
                    {resource.type === "podcast" ? (
                      <>Listen <ExternalLink size={14} /></>
                    ) : (
                      <>Download <Download size={14} /></>
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
