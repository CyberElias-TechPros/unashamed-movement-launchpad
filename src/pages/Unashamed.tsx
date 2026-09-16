import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import PageHero from "@/components/cinematic/PageHero";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { motion } from "framer-motion";
import { Play, ExternalLink, Youtube, Instagram } from "lucide-react";
import { videosApi, Video } from "@/api/videos";

interface DisplayVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  episode: string;
  youtubeUrl: string;
  youtubeEmbedId?: string;
}

const extractYouTubeId = (url: string): string | undefined => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1];
};

const fallbackVideos: DisplayVideo[] = [
  {
    id: "1", title: "Being Ambitious for Christ", description: "What does it mean to be ambitious for Christ? This episode explores how to pursue boldness in your faith.",
    duration: "21:07", episode: "EP 01", youtubeUrl: "https://www.youtube.com/watch?v=pFyf6yPBr9A", youtubeEmbedId: "pFyf6yPBr9A",
  },
  {
    id: "2", title: "The Gospel Simplified", description: "Understanding the simple, powerful message of the Gospel and how to share it boldly.",
    duration: "28:48", episode: "EP 02", youtubeUrl: "https://www.youtube.com/watch?v=ndP307bxp4k", youtubeEmbedId: "ndP307bxp4k",
  },
  {
    id: "3", title: "The Ministry of the Holy Spirit in Evangelism", description: "Discover how the Holy Spirit empowers and guides us in proclaiming the Gospel.",
    duration: "1:25:44", episode: "EP 03", youtubeUrl: "https://www.youtube.com/watch?v=ahIbBSvVoQs", youtubeEmbedId: "ahIbBSvVoQs",
  },
  {
    id: "4", title: "Unashamed Webinar 3.0", description: "Join us for another powerful webinar on living an unashamed life for Christ.",
    duration: "2:00:11", episode: "EP 04", youtubeUrl: "https://www.youtube.com/watch?v=oxGmlhJDUq0", youtubeEmbedId: "oxGmlhJDUq0",
  },
];

const igShorts = [
  { id: 1, title: "30 Seconds of Boldness", views: "12.5K", url: "https://instagram.com/_thetimeisnow" },
  { id: 2, title: "Preaching on the Bus", views: "8.3K", url: "https://instagram.com/_thetimeisnow" },
  { id: 3, title: "Timidity vs. Boldness", views: "15.7K", url: "https://instagram.com/_thetimeisnow" },
  { id: 4, title: "The Time Is Now", views: "9.2K", url: "https://instagram.com/_thetimeisnow" },
  { id: 5, title: "Street Preaching Tips", views: "6.8K", url: "https://instagram.com/_thetimeisnow" },
  { id: 6, title: "Fear Not", views: "11.1K", url: "https://instagram.com/_thetimeisnow" },
];

const Unashamed = () => {
  const { data: displayVideos = fallbackVideos } = useQuery({
    queryKey: ["unashamed", "videos"],
    queryFn: async (): Promise<DisplayVideo[]> => {
      try {
        const data = await videosApi.getAll();
        const list: Video[] = Array.isArray(data) ? data : data.data || [];
        const published = list.filter((v) => v.isPublished !== false && v.isActive !== false);
        if (!published.length) return fallbackVideos;
        return published.map((v, i) => {
          const url = v.youtubeUrl || v.url || "";
          return {
            id: v._id || v.id || String(i),
            title: v.title,
            description: v.description,
            duration: v.duration ? `${v.duration} min` : "—",
            episode: v.episode || `EP ${String(i + 1).padStart(2, "0")}`,
            youtubeUrl: url,
            youtubeEmbedId: extractYouTubeId(url),
          };
        });
      } catch {
        return fallbackVideos;
      }
    },
  });

  const featured = displayVideos[0] || fallbackVideos[0];

  return (
    <Layout>
      <PageHero
        kicker="The Video Series"
        title="UNASHAMED"
        italic="out of the shadows"
        description="A series challenging believers to step out of the shadows and into the bold, unashamed life God designed for them."
        align="center"
      />

      {/* Featured episode */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding pt-0">
          <div className="container-custom">
            <SectionWrapper>
              <div className="relative mx-auto max-w-5xl">
                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-accent/25 to-transparent blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                  <div className="relative aspect-video bg-black">
                    {featured.youtubeEmbedId && (
                      <iframe
                        title={`Featured: ${featured.title}`}
                        src={`https://www.youtube.com/embed/${featured.youtubeEmbedId}?modestbranding=1&rel=0&showinfo=0&color=white`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
                    <div>
                      <p className="kicker mb-2">Featured Episode</p>
                      <h3 className="font-heading text-3xl tracking-wider text-card-foreground">
                        {featured.title}
                      </h3>
                    </div>
                    <a
                      href="https://youtube.com/@TheTimeIsNow255"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 font-heading tracking-wider text-accent-foreground transition-all duration-300 hover:glow-accent"
                    >
                      Watch More <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Episodes */}
      <section className="relative overflow-hidden border-y border-border bg-card/20">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker flex items-center gap-2">
                  <Youtube size={16} /> Full Episodes
                </p>
              </div>
              <h2 className="mb-14 font-heading leading-[0.95] tracking-wide text-foreground">
                <KineticText text="DEEP DIVES" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                  className="group"
                >
                  <div className="h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_60px_-24px_hsl(41_75%_52%/0.3)]">
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {video.youtubeEmbedId ? (
                        <iframe
                          title={video.title}
                          src={`https://www.youtube.com/embed/${video.youtubeEmbedId}?modestbranding=1&rel=0&showinfo=0`}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Play size={24} className="ml-1" fill="currentColor" />
                          </span>
                        </a>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {video.episode}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">{video.duration}</span>
                      </div>
                      <h3 className="mb-2 flex items-center gap-2 font-heading text-xl tracking-wider text-card-foreground">
                        {video.title}
                      </h3>
                      <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram wall */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker flex items-center gap-2">
                  <Instagram size={16} /> Shorts &amp; Reels
                </p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-6 font-heading tracking-wide text-foreground">
                <KineticText text="QUICK FIRE" className="text-5xl sm:text-7xl" />
              </h2>
              <p className="mx-auto mb-14 max-w-2xl font-body text-lg text-muted-foreground">
                Bite-sized fuel for your bold faith journey.
              </p>
            </SectionWrapper>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {igShorts.map((short, index) => (
                <motion.a
                  key={short.id}
                  href={short.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="group block"
                >
                  <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-background transition-all duration-500 group-hover:-translate-y-1 group-hover:border-accent/60">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 transition-opacity group-hover:opacity-60">
                      <Instagram size={40} className="text-accent" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className="mb-1 font-heading text-sm leading-tight text-white line-clamp-2">
                        {short.title}
                      </p>
                      <p className="font-body text-xs text-white/60">{short.views} views</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-100">
                        <Play size={16} className="ml-0.5" fill="currentColor" />
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="https://instagram.com/_thetimeisnow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-7 py-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <Instagram size={17} /> Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Unashamed;
