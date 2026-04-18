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
  author: string;
  description: string;
  type: "book" | "devotional" | "guide" | "article" | "podcast";
  downloadUrl: string;
  free: boolean;
  category: string;
}

const resources: Resource[] = [
  // Church History & Martyrs for Christ
  { id: 1, title: "Foxe's Book Of Martyrs", author: "John Foxe", description: "Classic collection of Christian martyrdom stories that inspire courage and faith.", type: "book", downloadUrl: "#", free: true, category: "Church History & Martyrs for Christ" },
  { id: 2, title: "God's Generals - The Revivalists", author: "Roberts Liardon", description: "Biographies of men and women who used their God-given gifts to impact nations.", type: "book", downloadUrl: "#", free: true, category: "Church History & Martyrs for Christ" },
  { id: 3, title: "God's Generals - Why They Succeeded And Why Some Failed", author: "Roberts Liardon", description: "Insights into what made revivalists successful and lessons from their failures.", type: "book", downloadUrl: "#", free: true, category: "Church History & Martyrs for Christ" },
  { id: 4, title: "Revival In The Hebrides", author: "Duncan Campbell", description: "Firsthand account of the powerful revival that swept through the Scottish islands.", type: "book", downloadUrl: "#", free: true, category: "Church History & Martyrs for Christ" },
  { id: 5, title: "Tortured For Christ", author: "Richard Wurmbrand", description: "Powerful testimony of faith under persecution in communist Romania.", type: "book", downloadUrl: "#", free: true, category: "Church History & Martyrs for Christ" },
  
  // Other Inspiration
  { id: 6, title: "I went To Hell", author: "Kenneth Hagin", description: "A personal testimony of divine encounter and spiritual revelation.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 7, title: "Kathryn Kuhlman - Her Spiritual Legacy and its Impact on my Life", author: "Benny Hinn", description: "Insights into the life and ministry of one of history's great evangelists.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 8, title: "Now That You Are Born Again", author: "Pastor Chris Oyakhilome", description: "Essential guide for new believers on understanding their new life in Christ.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 9, title: "Recreating Your World", author: "Pastor Chris Oyakhilome", description: "Learn how to transform your circumstances through the power of God's Word.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 10, title: "The Power Of Tongues", author: "Pastor Chris Oyakhilome", description: "Comprehensive teaching on the power and purpose of speaking in tongues.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 11, title: "The Seven Spirits Of God", author: "Pastor Chris Oyakhilome", description: "Deep dive into understanding the seven spirits mentioned in scripture.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  { id: 12, title: "When God Visits You", author: "Pastor Chris Oyakhilome", description: "Understanding divine visitations and how to position yourself for God's presence.", type: "book", downloadUrl: "#", free: true, category: "Other Inspiration" },
  
  // TTIN Original Resources
  { id: 13, title: "The Time Is Now - Complete Guide", author: "TTIN Team", description: "Comprehensive guide to living an unashamed Christian life in today's world.", type: "guide", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 14, title: "30 Days of Boldness Devotional", author: "TTIN Team", description: "A transformative devotional that walks you through 30 days of building courage in your faith.", type: "devotional", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 15, title: "How to Share Your Faith", author: "TTIN Team", description: "A practical, no-fluff guide to starting gospel conversations naturally.", type: "guide", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 16, title: "The Unashamed Manifesto", author: "TTIN Team", description: "Our foundational document outlining what it means to live a life unashamed of the Gospel.", type: "article", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 17, title: "Bold Faith Podcast — Season 1", author: "TTIN Team", description: "Listen to conversations with believers who are changing the world through unashamed faith.", type: "podcast", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 18, title: "Scripture Memory Cards", author: "TTIN Team", description: "Printable cards with key scriptures on boldness, courage, and faith for daily meditation.", type: "guide", downloadUrl: "#", free: true, category: "TTIN Resources" },
  { id: 19, title: "Evangelism Conversation Starters", author: "TTIN Team", description: "50+ natural conversation starters to help you transition into gospel conversations.", type: "guide", downloadUrl: "#", free: true, category: "TTIN Resources" },
];

const categories = ["All", "Church History & Martyrs for Christ", "Other Inspiration", "TTIN Resources"];

const typeIcons = {
  book: <BookOpen size={20} />,
  devotional: <BookOpen size={20} />,
  guide: <FileText size={20} />,
  article: <FileText size={20} />,
  podcast: <Headphones size={20} />,
};

const Resources = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? resources : resources.filter((r) => r.category === filter);

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
          {categories.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {t === "All" ? "All Resources" : t}
            </button>
          ))}
        </div>
      </section>

      {/* Community Link */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border">
              <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-4">
                Join Our Community
              </h3>
              <p className="font-body text-muted-foreground text-lg mb-6">
                Connect with other bold believers and get access to exclusive resources, discussions, and encouragement.
              </p>
              <a
                href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-heading tracking-wider hover:bg-accent/90 transition-colors"
              >
                Join Our Community Here!
              </a>
            </div>
          </div>
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
                        <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-heading tracking-wider">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2">
                    {resource.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm mb-1">
                    by {resource.author}
                  </p>
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
