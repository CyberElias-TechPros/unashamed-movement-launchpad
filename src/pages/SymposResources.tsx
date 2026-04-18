import { useState } from "react";
import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { Download, BookOpen, FileText, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Resource {
  id: number;
  title: string;
  author: string;
  description: string;
  type: "book" | "devotional" | "guide" | "podcast";
  free: boolean;
}

const resources: Resource[] = [
  { id: 1, title: "Foxe's Book Of Martyrs", author: "John Foxe", description: "Classic collection of Christian martyrdom stories", type: "book", free: true },
  { id: 2, title: "God's Generals - The Revivalists", author: "Roberts Liardon", description: "Biographies of revivalists who changed nations", type: "book", free: true },
  { id: 3, title: "Revival In The Hebrides", author: "Duncan Campbell", description: "Powerful revival in the Scottish islands", type: "book", free: true },
  { id: 4, title: "Tortured For Christ", author: "Richard Wurmbrand", description: "Faith under persecution", type: "book", free: true },
  { id: 5, title: "I Went To Hell", author: "Kenneth Hagin", description: "Personal testimony of divine encounter", type: "book", free: true },
  { id: 6, title: "Now That You Are Born Again", author: "Pastor Chris Oyakhilome", description: "Guide for new believers", type: "book", free: true },
  { id: 7, title: "The Power Of Tongues", author: "Pastor Chris Oyakhilome", description: "Teaching on speaking in tongues", type: "book", free: true },
  { id: 8, title: "30 Days of Boldness Devotional", author: "TTIN Team", description: "Transformative devotional", type: "devotional", free: true },
];

const categories = ["All", "Church History", "Inspiration", "TTIN Resources"];

const typeIcons: Record<string, JSX.Element> = {
  book: <BookOpen size={20} />,
  devotional: <BookOpen size={20} />,
  guide: <FileText size={20} />,
  podcast: <Headphones size={20} />,
};

const SymposResources = () => {
  const [filter, setFilter] = useState("All");

  return (
    <SymposLayout>
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container-custom text-center relative z-10"
        >
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Grow Your Faith
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
            Resources
          </h1>
          <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
            Tools, guides, and content to equip you for bold, unashamed living
          </p>
        </motion.div>
      </section>

      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {cat === "All" ? "All Resources" : cat}
            </button>
          ))}
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h3 className="font-heading text-2xl tracking-wider text-foreground mb-4">
              Join Our Community
            </h3>
            <p className="font-body text-muted-foreground text-lg mb-6">
              Connect with other bold believers
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
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-12 text-center">
            Browse Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    {typeIcons[resource.type]}
                  </div>
                  <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                    {resource.type}
                  </span>
                  {resource.free && (
                    <span className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-heading tracking-wider">
                      Free
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-lg tracking-wider text-card-foreground mb-2">
                  {resource.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm mb-1">
                  by {resource.author}
                </p>
                <p className="font-body text-muted-foreground text-sm mb-4 flex-1">
                  {resource.description}
                </p>
                <Button variant="default" size="sm" className="w-full gap-2">
                  <Download size={14} /> Download
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SymposLayout>
  );
};

export default SymposResources;