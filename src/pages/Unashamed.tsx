import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import { Play, ExternalLink } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  episode: string;
  youtubeUrl: string;
}

const videos: VideoItem[] = [
  {
    id: 1, title: "The Cost of Silence", description: "What happens when believers choose comfort over conviction? This episode explores the real cost of staying quiet.",
    duration: "24:30", episode: "EP 01", youtubeUrl: "https://youtube.com",
  },
  {
    id: 2, title: "Fear vs. Faith", description: "Understanding the battle between fear and faith, and how to let your faith lead every time.",
    duration: "18:45", episode: "EP 02", youtubeUrl: "https://youtube.com",
  },
  {
    id: 3, title: "Bold in the Workplace", description: "Practical ways to live out your faith in professional settings without compromise.",
    duration: "22:10", episode: "EP 03", youtubeUrl: "https://youtube.com",
  },
  {
    id: 4, title: "The Unashamed Identity", description: "Discovering who you are in Christ and why that identity demands boldness.",
    duration: "20:00", episode: "EP 04", youtubeUrl: "https://youtube.com",
  },
  {
    id: 5, title: "Evangelism Redefined", description: "Moving beyond traditional approaches to sharing the Gospel in the modern world.",
    duration: "26:15", episode: "EP 05", youtubeUrl: "https://youtube.com",
  },
  {
    id: 6, title: "When They Persecute You", description: "How to stand firm when your faith is challenged, mocked, or attacked.",
    duration: "21:50", episode: "EP 06", youtubeUrl: "https://youtube.com",
  },
];

const Unashamed = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-48 h-48 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Video Series
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-9xl tracking-wider text-primary-foreground mb-6">
              UNASHAMED
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              A video series challenging believers to step out of the shadows 
              and into the bold, unashamed life God designed for them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Videos */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground">
                All Episodes
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, i) => (
              <SectionWrapper key={video.id} delay={i * 0.1}>
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-primary flex items-center justify-center overflow-hidden">
                      <span className="font-heading text-6xl text-primary-foreground/10 tracking-wider">
                        {video.episode}
                      </span>
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 bg-accent/90 text-accent-foreground text-xs font-heading tracking-wider px-3 py-1 rounded-full">
                        {video.episode}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-foreground/80 text-background text-xs font-body px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2 flex items-center gap-2">
                        {video.title}
                        <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="font-body text-muted-foreground text-sm leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </a>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Unashamed;
