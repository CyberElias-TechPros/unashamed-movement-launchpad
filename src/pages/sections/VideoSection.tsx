import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { videosApi } from "@/api/videos";
import { Badge } from "@/components/ui/badge";

const VIDEO_FEED_QUERY_KEY = ["videos", "feed"];

const VideoSection = () => {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: VIDEO_FEED_QUERY_KEY,
    queryFn: async () => {
      const data = await videosApi.getAll();
      const videos = Array.isArray(data) ? data : data.data || [];
      return videos.filter((v) => v.isPublished !== false).slice(0, 4);
    },
  });

  return (
    <section className="section-padding bg-primary">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              The Movement
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
              The Time Is Now
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
              Watch bold Christians preaching open air around the world and sharing their faith.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto video-container">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                  <div className="absolute inset-0 bg-muted/20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p className="text-center text-primary-foreground/70">No videos available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto video-container">
              {videos.map((video, index) => {
                let embedUrl = video.youtubeUrl || video.url;
                if (embedUrl && (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be"))) {
                  const ytMatch = embedUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                  if (ytMatch) {
                    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?modestbranding=1&rel=0&showinfo=0&color=white`;
                  }
                }

                return (
                  <motion.div
                    key={video._id || video.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative bg-black rounded-2xl overflow-hidden aspect-video group"
                  >
                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-white font-heading text-lg">{video.title}</p>
                      {video.description && (
                        <p className="text-white/70 text-sm line-clamp-1">{video.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionWrapper>
      </div>
    </section>
  );
};

export default VideoSection;
