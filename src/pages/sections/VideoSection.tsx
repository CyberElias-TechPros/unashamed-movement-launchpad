import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { videosApi, Video } from "@/api/videos";

const VIDEO_FEED_QUERY_KEY = ["videos", "feed"];

const fallbackVideos: Video[] = [
  { title: "Being Ambitious for Christ", episode: "EP 01", youtubeUrl: "https://www.youtube.com/watch?v=pFyf6yPBr9A", description: "A call to holy ambition.", duration: "" },
  { title: "The Gospel Simplified", episode: "EP 02", youtubeUrl: "https://www.youtube.com/watch?v=ndP307bxp4k", description: "The Gospel, stripped to its power.", duration: "" },
  { title: "The Ministry of the Holy Spirit in Evangelism", episode: "EP 03", youtubeUrl: "https://www.youtube.com/watch?v=ahIbBSvVoQs", description: "Partnering with the Spirit to win souls.", duration: "" },
  { title: "Unashamed Webinar 3.0", episode: "EP 04", youtubeUrl: "https://www.youtube.com/watch?v=oxGmlhJDUq0", description: "Equipping the bold.", duration: "" },
];

const toEmbedUrl = (video: Video) => {
  const embedUrl = video.youtubeUrl || video.url || "";
  if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
    const ytMatch = embedUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?modestbranding=1&rel=0&showinfo=0&color=white`;
    }
  }
  return embedUrl;
};

const VideoFrame = ({ video, large = false }: { video: Video; large?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-8%" }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className={`group relative overflow-hidden rounded-2xl border border-border bg-black aspect-video transition-colors duration-500 hover:border-accent/50 ${large ? "glow-accent/0 hover:glow-accent" : ""}`}
  >
    <iframe
      src={toEmbedUrl(video)}
      className="absolute inset-0 h-full w-full"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={video.title}
      loading="lazy"
    />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <p className="font-heading text-lg tracking-wider text-white">{video.title}</p>
      {video.description && <p className="text-sm text-white/70 line-clamp-1">{video.description}</p>}
    </div>
  </motion.div>
);

const VideoSection = () => {
  const { data: videos = fallbackVideos, isLoading } = useQuery({
    queryKey: VIDEO_FEED_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await videosApi.getAll();
        const list = Array.isArray(data) ? data : data.data || [];
        const published = list.filter((v) => v.isPublished !== false && v.isActive !== false);
        return published.length ? published.slice(0, 4) : fallbackVideos;
      } catch {
        return fallbackVideos;
      }
    },
  });

  const [featured, ...rest] = videos.length ? videos : fallbackVideos;

  return (
    <section id="watch" className="relative overflow-hidden bg-background">
      <EmberGlow intensity="low" />
      <div className="section-padding">
        <div className="container-custom">
          <div className="mb-14 text-center sm:mb-20">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Watch The Fire</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="font-heading leading-[0.95] tracking-wide text-foreground">
                <KineticText text="OPEN-AIR" className="text-5xl sm:text-7xl lg:text-8xl" />
                <span className="block font-display italic font-normal text-gradient-gold text-4xl sm:text-6xl lg:text-7xl">
                  sermons &amp; stories
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
                Bold Christians preaching in the wild — buses, jets, campuses and city streets.
              </p>
            </SectionWrapper>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="aspect-video animate-pulse rounded-2xl bg-card lg:col-span-2 lg:row-span-2" />
              <div className="aspect-video animate-pulse rounded-2xl bg-card" />
              <div className="aspect-video animate-pulse rounded-2xl bg-card" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <VideoFrame video={featured} large />
              </div>
              <div className="flex flex-col gap-6">
                {rest.slice(0, 2).map((video) => (
                  <VideoFrame key={video._id || video.id || video.title} video={video} />
                ))}
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  href="https://youtube.com/@TheTimeIsNow255"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-1 items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-6 transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                >
                  <div>
                    <p className="font-heading text-2xl tracking-wider text-accent transition-colors group-hover:text-accent-foreground">
                      Full Archive
                    </p>
                    <p className="font-body text-sm text-muted-foreground transition-colors group-hover:text-accent-foreground/80">
                      Every episode on YouTube
                    </p>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110">
                    <Play size={18} className="ml-0.5" />
                  </span>
                </motion.a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
