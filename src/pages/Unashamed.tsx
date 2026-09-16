import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Eye, Clock, ArrowRight, X, Youtube, Instagram } from "lucide-react";
import { videosApi } from "@/api/videos";
import { getDriveVideoUrl, getDriveThumbnailUrl } from "@/components/ClickToPlayVideo";
import ClickToPlayVideo from "@/components/ClickToPlayVideo";

interface Episode {
  id: number;
  title: string;
  description: string;
  duration: string;
  episode: string;
  youtubeUrl: string;
  youtubeEmbedId?: string;
}

const fallbackEpisodes: Episode[] = [
  {
    id: 1,
    title: "The Gospel Simplified",
    description:
      "Breaking down the Gospel into its simplest, most powerful form. Learn how to share your faith with clarity and confidence.",
    duration: "28:48",
    episode: "EP 01",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "ndP307bxp4k",
  },
  {
    id: 2,
    title: "Being Ambitious for Christ",
    description:
      "What does it mean to be ambitious for Christ? This episode explores how to pursue boldness in your faith and live with purpose for His kingdom.",
    duration: "21:07",
    episode: "EP 02",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "pFyf6yPBr9A",
  },
  {
    id: 3,
    title: "Prayer & Conviction",
    description:
      "Discover the power of prayer and how conviction fuels a life of unashamed faith and bold evangelism.",
    duration: "32:38",
    episode: "EP 03",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "fYFnvIVeCaU",
  },
  {
    id: 4,
    title: "The Holy Spirit and Evangelism",
    description:
      "Explore the vital role of the Holy Spirit in evangelism and how He empowers believers to share the Gospel with boldness and effectiveness.",
    duration: "1:01:04",
    episode: "EP 04",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "-BslRdGMyKw",
  },
  {
    id: 5,
    title: "Would You Die For Christ?",
    description:
      "A powerful conversation about the cost of discipleship and what it truly means to be willing to lay down everything for Christ.",
    duration: "47:41",
    episode: "EP 05",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "gHvLu--M3fQ",
  },
  {
    id: 6,
    title: "Unashamed Webinar 5.0",
    description:
      "Another impactful webinar equipping believers to live unashamed and reach the lost with the Gospel message.",
    duration: "24:31",
    episode: "WEBINAR",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "DNoE8WdKJGU",
  },
  {
    id: 7,
    title: "The Ministry of the Holy Spirit in Evangelism",
    description:
      "Discover how the Holy Spirit empowers and guides us in proclaiming the Gospel with boldness.",
    duration: "1:25:44",
    episode: "WEBINAR",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "ahIbBSvVoQs",
  },
  {
    id: 8,
    title: "Unashamed Webinar 3.0",
    description:
      "Join us for another powerful webinar on living an unashamed life for Christ and reaching the lost.",
    duration: "2:00:11",
    episode: "WEBINAR",
    youtubeUrl: "https://youtube.com/@tthetimeisnow",
    youtubeEmbedId: "oxGmlhJDUq0",
  },
];

const instagramShorts = [
  { id: 1, title: "Quick Inspiration", description: "Bold faith encouragement", views: "12.5K", url: "https://www.instagram.com/p/DYiaJsyGR4a/" },
  { id: 2, title: "Quick Inspiration", description: "Bold faith encouragement", views: "8.3K", url: "https://www.instagram.com/p/DZw5osmqdGm/" },
  { id: 3, title: "Quick Inspiration", description: "Bold faith encouragement", views: "15.7K", url: "https://www.instagram.com/p/DT02IK-ko_F/" },
  { id: 4, title: "Quick Inspiration", description: "Bold faith encouragement", views: "9.2K", url: "https://www.instagram.com/p/DTyGkdakUxr/" },
  { id: 5, title: "Quick Inspiration", description: "Bold faith encouragement", views: "6.8K", url: "https://www.instagram.com/p/DToCBHdEocy/" },
  { id: 6, title: "Quick Inspiration", description: "Bold faith encouragement", views: "11.1K", url: "https://www.instagram.com/p/DTGW28VkqNs/" },
  { id: 7, title: "Quick Inspiration", description: "Bold faith encouragement", views: "7.5K", url: "https://www.instagram.com/p/DSvSLUGAsnC/" },
  { id: 8, title: "Quick Inspiration", description: "Bold faith encouragement", views: "5.2K", url: "https://www.instagram.com/p/DSbP515j7XH/" },
  { id: 9, title: "Quick Inspiration", description: "Bold faith encouragement", views: "10.4K", url: "https://www.instagram.com/p/DSN19qFEh-w/" },
  { id: 10, title: "Quick Inspiration", description: "Bold faith encouragement", views: "14.8K", url: "https://www.instagram.com/p/DRxhho2ksST/" },
];

const HERO_VIDEO_ID = "1QyjqlFPKOnQO7V4ow9ZrSzKMCUKPXHRO";

const Unashamed = () => {
  const [episodes, setEpisodes] = useState<Episode[]>(fallbackEpisodes);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [activeShort, setActiveShort] = useState<{ id: number; url: string } | null>(null);

  useEffect(() => {
    videosApi
      .getAll()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.data || [];
        if (items.length) {
          setEpisodes(
            items.map((v, i) => ({
              id: i + 1,
              title: v.title,
              description: v.description || "",
              duration: v.duration ? `${v.duration} min` : "—",
              episode: `EP ${String(i + 1).padStart(2, "0")}`,
              youtubeUrl: v.youtubeUrl || v.url || "https://youtube.com/@tthetimeisnow",
              youtubeEmbedId: (v.youtubeUrl || v.url || "").includes("embed")
                ? (v.youtubeUrl || v.url || "").split("/").pop()
                : undefined,
            }))
          );
        }
      })
      .catch(() => setEpisodes(fallbackEpisodes));
  }, []);

  const featured = episodes[0];

  return (
    <Layout>
      {/* Hero — drive video background */}
      <section
        className="page-section full-bleed-section section-theme-dark section-height--large"
        data-test="page-section"
        data-section-theme="dark"
      >
        <div className="section-border" />
        <div className="section-background">
          <div className="absolute inset-0">
            <ClickToPlayVideo
              src={getDriveVideoUrl(HERO_VIDEO_ID)}
              thumbnailUrl={getDriveThumbnailUrl(HERO_VIDEO_ID)}
              aspectRatio="aspect-video"
              className="absolute inset-0 w-full h-full opacity-30"
              muted
              loop
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#0a0a0a]/95" />
        </div>
        <div className="content-wrapper relative z-10">
          <div className="content container-custom pt-32 pb-16 md:pt-44 md:pb-24">
            <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
              Video Series
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white mb-6">
              UNASHAMED POD
            </h1>
          </div>
        </div>
      </section>

      {/* Featured Episode */}
      <section
        className="page-section full-bleed-section section-theme-dark"
        data-test="page-section"
        data-section-theme="dark"
      >
        <div className="section-border" />
        <div className="section-background">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
        </div>
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
                Featured Episode
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-white mb-6">
                Watch Now
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-[20px] overflow-hidden shadow-2xl"
                style={{ backgroundColor: "#1f1919" }}
              >
                <div className="relative aspect-video bg-black">
                  {featured?.youtubeEmbedId ? (
                    <iframe
                      title={featured.title}
                      src={`https://www.youtube.com/embed/${featured.youtubeEmbedId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={`Play ${featured?.title}`}
                      onClick={() => featured && setActiveEpisode(featured)}
                      className="absolute inset-0 w-full h-full flex items-center justify-center group"
                    >
                      <span className="w-20 h-20 bg-[#eab308] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div className="text-center mt-8">
                <a
                  href="https://youtube.com/@tthetimeisnow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sqs-button-element--tertiary text-sm"
                >
                  <Youtube className="w-4 h-4 mr-2 inline" /> Watch More Videos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Episodes */}
      <section
        className="page-section full-bleed-section section-theme-bright"
        data-test="page-section"
        data-section-theme="bright"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                YouTube Podcast
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Full Episodes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="template-card bg-card border border-border overflow-hidden group"
                >
                  <button
                    type="button"
                    onClick={() => setActiveEpisode(ep)}
                    className="block w-full text-left cursor-pointer"
                    aria-label={`Play ${ep.title}`}
                  >
                    <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                      {ep.youtubeEmbedId ? (
                        <img
                          src={`https://i.ytimg.com/vi/${ep.youtubeEmbedId}/hqdefault.jpg`}
                          alt={ep.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#eab308]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider bg-black/70 text-[#eab308] px-2 py-1 rounded-full">
                        {ep.episode}
                      </span>
                      {ep.duration && ep.duration !== "—" && (
                        <span className="absolute bottom-3 right-3 text-xs text-white/90 bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ep.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg tracking-wider text-card-foreground mb-2 line-clamp-2">
                        {ep.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground line-clamp-3">
                        {ep.description}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Shorts */}
      <section
        className="page-section full-bleed-section section-theme-bright-inverse"
        data-test="page-section"
        data-section-theme="bright-inverse"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Instagram Shorts
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Quick Inspiration
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {instagramShorts.map((short) => (
                <a
                  key={short.id}
                  href={short.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                  onClick={() => setActiveShort({ id: short.id, url: short.url })}
                >
                  <div className="template-card bg-card border border-border overflow-hidden group">
                    <div className="relative aspect-[9/16] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Instagram className="w-8 h-8 text-white/30" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-heading text-sm font-semibold mb-1 line-clamp-1">
                          {short.title}
                        </p>
                        <p className="text-white/60 text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {short.views} views
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Episode dialog */}
      <Dialog open={!!activeEpisode} onOpenChange={() => setActiveEpisode(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-white/10 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{activeEpisode?.title}</DialogTitle>
          </DialogHeader>
          {activeEpisode && (
            <div className="aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeEpisode.youtubeEmbedId || "fYFnvIVeCaU"}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
                title={activeEpisode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
              <button
                onClick={() => setActiveEpisode(null)}
                aria-label="Close video"
                className="absolute top-0 right-0 m-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Instagram short dialog */}
      <Dialog open={!!activeShort} onOpenChange={() => setActiveShort(null)}>
        <DialogContent className="max-w-md p-0 bg-black border-white/10 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Instagram Short</DialogTitle>
          </DialogHeader>
          {activeShort && (
            <iframe
              src={`https://www.instagram.com/p/${activeShort.url.split("/p/")[1]?.split("/")[0]}/embed`}
              className="w-full aspect-[9/16]"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title="Instagram short"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Unashamed;
