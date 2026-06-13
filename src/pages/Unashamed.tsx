import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Play, ExternalLink, Youtube, Instagram } from "lucide-react";
import { videosApi, Video } from "@/api/videos";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  episode: string;
  youtubeUrl: string;
  youtubeEmbedId?: string;
}

const videos: VideoItem[] = [
  {
    id: 1, title: "Being Ambitious for Christ", description: "What does it mean to be ambitious for Christ? This episode explores how to pursue boldness in your faith.",
    duration: "21:07", episode: "EP 01", youtubeUrl: "https://youtube.com/@tthetimeisnow", youtubeEmbedId: "pFyf6yPBr9A",
  },
  {
    id: 2, title: "The Gospel Simplified", description: "Understanding the simple, powerful message of the Gospel and how to share it boldly.",
    duration: "28:48", episode: "EP 02", youtubeUrl: "https://youtube.com/@tthetimeisnow", youtubeEmbedId: "ndP307bxp4k",
  },
  {
    id: 3, title: "The Ministry of the Holy Spirit in Evangelism", description: "Discover how the Holy Spirit empowers and guides us in proclaiming the Gospel.",
    duration: "1:25:44", episode: "EP 03", youtubeUrl: "https://youtube.com/@tthetimeisnow", youtubeEmbedId: "ahIbBSvVoQs",
  },
  {
    id: 4, title: "Unashamed Webinar 3.0", description: "Join us for another powerful webinar on living an unashamed life for Christ.",
    duration: "2:00:11", episode: "EP 04", youtubeUrl: "https://youtube.com/@tthetimeisnow", youtubeEmbedId: "oxGmlhJDUq0",
  },
];

const igShorts = [
  {
    id: 1,
    title: "30 Seconds of Boldness",
    description: "Quick encouragement to be bold in your faith today",
    views: "12.5K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://www.instagram.com/reel/C8placeholder1/",
  },
  {
    id: 2,
    title: "Preaching on the Bus",
    description: "Live footage of open air preaching on public transport",
    views: "8.3K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://www.instagram.com/reel/C8placeholder2/",
  },
  {
    id: 3,
    title: "Timidity vs. Boldness",
    description: "Quick comparison between timid and bold faith",
    views: "15.7K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://instagram.com/_thetimeisnow",
  },
  {
    id: 4,
    title: "The Time Is Now",
    description: "Why today is the day to be unashamed of the Gospel",
    views: "9.2K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://instagram.com/_thetimeisnow",
  },
  {
    id: 5,
    title: "Street Preaching Tips",
    description: "3 tips for effective street evangelism",
    views: "6.8K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://instagram.com/_thetimeisnow",
  },
  {
    id: 6,
    title: "Fear Not",
    description: "Biblical encouragement to overcome fear",
    views: "11.1K",
    thumbnail: "Short thumbnail placeholder",
    url: "https://instagram.com/_thetimeisnow",
  },
];

const Unashamed = () => {
  const [apiVideos, setApiVideos] = useState<Video[]>([]);

  useEffect(() => {
    videosApi.getAll()
      .then((data) => setApiVideos(Array.isArray(data) ? data : data.data || []))
      .catch(() => setApiVideos([]));
  }, []);

  const displayVideos = apiVideos.length
    ? apiVideos.map((v, i) => ({
        id: i + 1,
        title: v.title,
        description: v.description,
        duration: v.duration ? `${v.duration} min` : "—",
        episode: `EP ${String(i + 1).padStart(2, "0")}`,
        youtubeUrl: v.youtubeUrl || v.url,
        youtubeEmbedId: (v.youtubeUrl || v.url || '').includes("embed") ? (v.youtubeUrl || v.url || '').split("/").pop() : undefined,
      }))
    : videos;

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
            {displayVideos.map((video, i) => (
              <SectionWrapper key={video.id} delay={i * 0.1}>
                <div className="group block">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative aspect-video bg-primary flex items-center justify-center overflow-hidden">
                      {video.youtubeEmbedId ? (
                        <iframe
                          title={video.title}
                          src={`https://www.youtube.com/embed/${video.youtubeEmbedId}?modestbranding=1&rel=0&showinfo=0`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        >
                          <title>{video.title}</title>
                        </iframe>
                      ) : null}
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
                        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Open on YouTube">
                          <ExternalLink size={14} className="text-muted-foreground" />
                        </a>
                      </h3>
                      <p className="font-body text-muted-foreground text-sm leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </div>
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
                <a href={short.url} target="_blank" rel="noopener noreferrer" className="block">
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
                </a>
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
                  <iframe
                    title="Featured: Being Ambitious for Christ"
                    src="https://www.youtube.com/embed/pFyf6yPBr9A?autoplay=1&modestbranding=1&rel=0&showinfo=0"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-4">
                    Being Ambitious for Christ
                  </h3>
                  <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
                    What does it mean to be ambitious for Christ? This episode explores how to pursue boldness in your faith and live with purpose for His kingdom.
                  </p>
                  <a
                    href="https://youtube.com/@tthetimeisnow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-heading tracking-wider hover:bg-accent/90 transition-colors"
                  >
                    Watch More Videos
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
