import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Quote,
  Play,
  Users,
  Globe,
  MessagesSquare,
  HeartHandshake,
  Eye,
  MessageCircle,
  MapPin,
  ArrowRight,
  X,
} from "lucide-react";
import { TestimonySubmissionForm } from "@/components/TestimonySubmissionForm";
import { testimonialsApi, Testimonial } from "@/api/testimonials";

const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];

const impactStats = [
  { number: "150+", label: "People Preached Open Air", Icon: Users },
  { number: "33", label: "Countries Reached", Icon: Globe },
  { number: "1,200+", label: "Community Members", Icon: MessagesSquare },
  { number: "45+", label: "Volunteers", Icon: HeartHandshake },
  { number: "20M+", label: "Social Media Views", Icon: Eye },
  { number: "800+", label: "Gospel Conversations Started", Icon: MessageCircle },
];

type VideoTestimonial = {
  id: number;
  title: string;
  speaker: string;
  location: string;
  videoId: string;
};

const videoTestimonials: VideoTestimonial[] = [
  { id: 1, title: "Being Ambitious for Christ", speaker: "TTIN", location: "Global", videoId: "pFyf6yPBr9A" },
  { id: 2, title: "The Gospel Simplified", speaker: "TTIN", location: "Global", videoId: "ndP307bxp4k" },
  { id: 3, title: "The Ministry of the Holy Spirit in Evangelism", speaker: "TTIN", location: "Global", videoId: "ahIbBSvVoQs" },
];

const equipCards = [
  {
    title: "FAQs About Evangelism",
    description: "Answers to common questions about sharing your faith boldly.",
    image: "/images/Picture1.png",
    href: "https://thetimeisnow.gumroad.com/l/FAQsaboutevangelism",
  },
  {
    title: "Unashamed Challenge",
    description: "A challenge designed to push you out of your comfort zone and into bold evangelism.",
    image: "/images/Picture2.png",
    href: "https://thetimeisnow.gumroad.com/l/unashamedchallenge",
  },
];

const Testimonies = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await testimonialsApi.getAll();
        const items = Array.isArray(data) ? data : data.data || [];
        setTestimonials(items.filter((t: Testimonial) => t.isApproved !== false));
      } catch (err) {
        setError("Failed to load testimonies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section
        className="page-section full-bleed-section section-theme-dark section-height--large"
        data-test="page-section"
        data-section-theme="dark"
      >
        <div className="section-border" />
        <div className="section-background">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#eab308]/10 blur-3xl pointer-events-none" />
        </div>
        <div className="content-wrapper relative z-10">
          <div className="content container-custom pt-32 pb-16 md:pt-44 md:pb-24">
            <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
              Real Stories, Real Faith
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white mb-6">
              Testimonies
            </h1>
            <p className="font-body text-white/50 text-lg max-w-3xl">
              Lives transformed by the courage to be unashamed. These are stories from our
              community of bold believers.
            </p>
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section
        className="page-section full-bleed-section section-theme-bright"
        data-test="page-section"
        data-section-theme="bright"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <div className="text-center mb-16">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                By The Numbers
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Our Impact
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {impactStats.map(({ number, label, Icon }) => (
                <div key={label} className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-heading text-4xl lg:text-5xl text-accent mb-2">{number}</div>
                  <div className="font-body text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Where We Preach */}
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
                Locations Map
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Different Places People Have Preached
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {preachingLocations.map((loc) => (
                <div key={loc} className="template-card bg-card border border-border p-6 text-center">
                  <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                  <p className="font-heading text-foreground">{loc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonies of Impact (videos) */}
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
                Watch &amp; Learn
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Testimonies of Impact
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Hear directly from people impacted by TTIN
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoTestimonials.map((video) => (
                <div
                  key={video.id}
                  className="template-card bg-card border border-border overflow-hidden group"
                >
                  <div className="relative aspect-video bg-[#0a0a0a]">
                    <div className="absolute inset-0 bg-[#0a0a0a]/40 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label={`Play ${video.title}`}
                        onClick={() => setActiveVideo(video)}
                        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:bg-accent/90 transition-colors cursor-pointer"
                      >
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-heading text-lg">{video.title}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="font-heading text-foreground mb-2">{video.speaker}</p>
                    <p className="font-body text-muted-foreground text-sm">{video.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real Stories */}
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
                Real Stories
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Testimonies From The Movement
              </h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="template-card bg-card border border-border p-8">
                    <Skeleton className="h-6 w-6 mb-4" />
                    <Skeleton className="h-24 w-full mb-6" />
                    <Skeleton className="h-10 w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted-foreground">{error}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                  <div
                    key={t.id ?? i}
                    className="template-card bg-card border border-border p-8 group"
                  >
                    <Quote className="text-accent mb-4" size={28} />
                    <p className="font-body text-card-foreground/80 leading-relaxed mb-6 line-clamp-6">
                      “{t.text}”
                    </p>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#eab308] flex items-center justify-center text-white font-heading text-sm">
                          {(t.name || "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-heading text-lg tracking-wider text-card-foreground">
                            {t.name}
                          </p>
                          <p className="font-body text-sm text-muted-foreground">{t.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Get Equipped */}
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
                Resources
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Get Equipped
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Download resources to help you grow in bold evangelism
              </p>
            </div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {equipCards.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="template-card bg-card border border-border p-8 group hover:border-accent/50 transition-all block"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-lg mb-6 shadow-card"
                  />
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="font-body text-muted-foreground mb-6">{card.description}</p>
                  <span className="inline-flex items-center gap-2 text-accent font-heading text-sm tracking-wider group-hover:gap-3 transition-all">
                    Get It <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Story */}
      <section
        className="page-section full-bleed-section section-theme-dark relative overflow-hidden"
        data-test="page-section"
        data-section-theme="dark"
      >
        <div className="section-border" />
        <div className="section-background">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
          <div className="absolute top-0 left-1/2 w-64 h-64 bg-[#eab308]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        </div>
        <div className="content-wrapper relative z-10">
          <div className="content container-custom py-20 md:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
                Community
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-white mb-6">
                Have A Story To Share?
              </h2>
              <p className="font-body text-white/60 text-lg max-w-2xl mx-auto mb-10">
                Your testimony could inspire someone else to be bold. Join our community and share
                how God has moved in your life.
              </p>
              <div className="text-left">
                <TestimonySubmissionForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video dialog */}
      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-white/10 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{activeVideo?.title}</DialogTitle>
          </DialogHeader>
          {activeVideo && (
            <div className="aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="absolute -top-0 right-0 m-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Testimonies;
