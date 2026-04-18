import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Play, ExternalLink, Youtube, Instagram } from "lucide-react";

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

const igShorts = [
  {
    id: 1,
    title: "30 Seconds of Boldness",
    description: "Quick encouragement to be bold in your faith today",
    views: "12.5K",
    thumbnail: "Short thumbnail placeholder",
  },
  {
    id: 2,
    title: "Preaching on the Bus",
    description: "Live footage of open air preaching on public transport",
    views: "8.3K",
    thumbnail: "Short thumbnail placeholder",
  },
  {
    id: 3,
    title: "Timidity vs. Boldness",
    description: "Quick comparison between timid and bold faith",
    views: "15.7K",
    thumbnail: "Short thumbnail placeholder",
  },
  {
    id: 4,
    title: "The Time Is Now",
    description: "Why today is the day to be unashamed of the Gospel",
    views: "9.2K",
    thumbnail: "Short thumbnail placeholder",
  },
  {
    id: 5,
    title: "Street Preaching Tips",
    description: "3 tips for effective street evangelism",
    views: "6.8K",
    thumbnail: "Short thumbnail placeholder",
  },
  {
    id: 6,
    title: "Fear Not",
    description: "Biblical encouragement to overcome fear",
    views: "11.1K",
    thumbnail: "Short thumbnail placeholder",
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
        <FloatingParticles count={20} color="hsl(43 78% 56%)" />
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

      {/* YouTube Podcast Episodes */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Youtube className="w-8 h-8 text-red-600" />
                <p className="font-body text-accent text-sm tracking-[0.3em] uppercase">
                  YouTube Podcast
                </p>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-6">
                Full Episodes
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Deep dives into living an unashamed Christian life
              </p>
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

      {/* Instagram Shorts */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Instagram className="w-8 h-8 text-pink-600" />
                <p className="font-body text-accent text-sm tracking-[0.3em] uppercase">
                  Instagram Shorts
                </p>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-6">
                Quick Inspiration
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Bite-sized content to fuel your bold faith journey
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {igShorts.map((short, index) => (
              <SectionWrapper key={short.id} delay={index * 0.05}>
                <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
                  <div className="relative aspect-[9/16] bg-primary flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-heading text-sm font-semibold mb-1 line-clamp-2">
                        {short.title}
                      </p>
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <span>{short.views} views</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                        <Play size={16} className="text-black ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>

          <SectionWrapper delay={0.4}>
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
          </SectionWrapper>
        </div>
      </section>

      {/* Featured Episode */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Featured Episode
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                Watch Now
              </h2>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/20">
                <div className="relative aspect-video bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-accent/90 transition-colors cursor-pointer">
                        <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                      </div>
                      <p className="text-white text-xl font-heading mb-2">
                        The Cost of Silence
                      </p>
                      <p className="text-white/80">
                        EP 01 • 24:30
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-4">
                    The Cost of Silence
                  </h3>
                  <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                    What happens when believers choose comfort over conviction? This episode explores the real cost of staying quiet and challenges viewers to step into their calling as bold witnesses for Christ.
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
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Unashamed;
