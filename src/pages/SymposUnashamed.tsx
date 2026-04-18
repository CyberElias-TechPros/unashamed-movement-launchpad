import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { Play, Youtube, Instagram } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  episode: string;
}

const videos: VideoItem[] = [
  { id: 1, title: "The Cost of Silence", description: "What happens when believers choose comfort over conviction?", duration: "24:30", episode: "EP 01" },
  { id: 2, title: "Fear vs. Faith", description: "Understanding the battle between fear and faith", duration: "18:45", episode: "EP 02" },
  { id: 3, title: "Bold in the Workplace", description: "Practical ways to live out your faith", duration: "22:10", episode: "EP 03" },
  { id: 4, title: "The Unashamed Identity", description: "Discovering who you are in Christ", duration: "20:00", episode: "EP 04" },
];

const igShorts = [
  { id: 1, title: "30 Seconds of Boldness", views: "12.5K" },
  { id: 2, title: "Preaching on the Bus", views: "8.3K" },
  { id: 3, title: "Timidity vs. Boldness", views: "15.7K" },
  { id: 4, title: "The Time Is Now", views: "9.2K" },
  { id: 5, title: "Street Preaching Tips", views: "6.8K" },
  { id: 6, title: "Fear Not", views: "11.1K" },
];

const SymposUnashamed = () => {
  return (
    <SymposLayout>
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container-custom text-center relative z-10"
        >
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Video Series
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-9xl tracking-wider text-primary-foreground mb-6">
            UNASHAMED
          </h1>
          <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
            A video series challenging believers to step into the bold, unashamed life
          </p>
        </motion.div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Youtube className="w-8 h-8 text-red-600" />
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase">
              YouTube Podcast
            </p>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-12 text-center">
            Full Episodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-video bg-primary flex items-center justify-center">
                  <span className="font-heading text-4xl text-primary-foreground/20">
                    {video.episode}
                  </span>
                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/40 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg tracking-wider text-card-foreground mb-2">
                    {video.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm">
                    {video.description}
                  </p>
                  <p className="font-body text-muted-foreground text-xs mt-2">
                    {video.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Instagram className="w-8 h-8 text-pink-600" />
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase">
              Instagram Shorts
            </p>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-12 text-center">
            Quick Inspiration
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {igShorts.map((short, index) => (
              <motion.div
                key={short.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all"
              >
                <div className="relative aspect-[9/16] bg-primary flex items-center justify-center">
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-heading text-sm font-semibold">
                      {short.title}
                    </p>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <span>{short.views} views</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/40 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play size={12} className="text-black ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="https://instagram.com/_thetimeisnow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-heading tracking-wider hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-primary-foreground mb-6">
            Watch Now
          </h2>
          <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-10">
            Deep dives into living an unashamed Christian life
          </p>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-heading tracking-wider hover:bg-accent/90 transition-colors"
          >
            <Youtube className="w-5 h-5" />
            Watch on YouTube
          </a>
        </div>
      </section>
    </SymposLayout>
  );
};

export default SymposUnashamed;