import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import PageHero from "@/components/cinematic/PageHero";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote, Users, Globe, Download, Play, Book, Share2, MapPin } from "lucide-react";
import { TestimonySubmissionForm } from "@/components/TestimonySubmissionForm";
import WorldMap from "@/components/WorldMap";
import { testimonialsApi, Testimonial } from "@/api/testimonials";
import { trackEvent } from "@/lib/analytics";

const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];
const categories = ["All", "Evangelism", "Youth", "Apologetics", "Lifestyle", "Workplace"];

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

const bookTestimonials = [
  { id: 1, quote: "This book completely transformed my understanding of what it means to be a bold witness for Christ.", reader: "Michael P.", location: "Australia" },
  { id: 2, quote: "I couldn't put it down! Every chapter challenged me to step out in faith.", reader: "Rachel S.", location: "Canada" },
  { id: 3, quote: "The most practical guide to evangelism I've ever read. Highly recommend!", reader: "David L.", location: "United States" },
];

const stats = [
  { number: "100+", label: "People Preached Open Air", icon: <Users size={20} /> },
  { number: "16", label: "Countries Reached", icon: <Globe size={20} /> },
  { number: "158", label: "Books Downloaded", icon: <Download size={20} /> },
  { number: "7", label: "Types of Locations", icon: <MapPin size={20} /> },
];

const Testimonies = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const PAGE_SIZE = 6;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const country = params.get("country");
    if (category) setActiveCategory(category);
    setCountryFilter(country);
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const data = await testimonialsApi.getAll();
        const approved = (Array.isArray(data) ? data : data.data || []).filter((t) => t.isApproved !== false);
        setTestimonials(approved);
      } catch (err) {
        setError("Failed to load testimonies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const newUrl = category === "All" ? "/testimonies" : `/testimonies?category=${category}`;
    navigate(newUrl, { replace: true });
    trackEvent({
      category: "engagement",
      action: "filter",
      label: `testimony_${category}`,
    });
  };

  const filtered = testimonials.filter((t) => {
    if (activeCategory !== "All" && t.category !== activeCategory) return false;
    if (countryFilter && !t.location?.toLowerCase().includes(countryFilter.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <PageHero
        kicker="Real Stories, Real Faith"
        title="TESTIMONIES"
        italic="fire can't be faked"
        description="Lives transformed by the courage to be unashamed — straight from the community of bold believers."
      />

      {/* Sticky filter bar */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md sm:top-20">
        <div className="container-custom flex flex-wrap justify-center gap-2 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-5 py-2 font-heading text-sm tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Impact numbers */}
      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">By The Numbers</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-14 font-heading tracking-wide text-foreground">
                <KineticText text="OUR IMPACT" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="group flex flex-col items-center bg-background p-8 text-center transition-colors duration-500 hover:bg-card sm:p-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                    {stat.icon}
                  </div>
                  <div className="font-heading text-4xl text-gradient-gold lg:text-5xl">{stat.number}</div>
                  <div className="mt-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive map */}
      <section className="relative overflow-hidden border-y border-border bg-card/20">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Global Reach</p>
              </div>
              <h2 className="mb-4 font-heading tracking-wide text-foreground">
                <KineticText text="WHERE THE FIRE BURNED" className="text-5xl sm:text-7xl" />
              </h2>
              <p className="mb-10 max-w-2xl font-body text-muted-foreground">
                Tap a country to filter the stories from that part of the world.
              </p>
            </SectionWrapper>

            <SectionWrapper delay={0.15}>
              <div className="rounded-2xl border border-border bg-background p-6 sm:p-10">
                <WorldMap
                  onCountrySelect={(_code, name) => {
                    navigate(`/testimonies?country=${encodeURIComponent(name)}`);
                  }}
                />
                {countryFilter && (
                  <p className="mt-4 text-center font-body text-muted-foreground">
                    Filtering by: <strong className="text-accent">{countryFilter}</strong>
                    <Button variant="link" className="ml-2 text-accent" onClick={() => navigate("/testimonies")}>
                      Clear
                    </Button>
                  </p>
                )}
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* Where we preach */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Where We Preach</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-12 font-heading tracking-wide text-foreground">
                <KineticText text="EVERYWHERE COUNTS" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="flex flex-wrap justify-center gap-3">
              {preachingLocations.map((loc, index) => (
                <SectionWrapper key={loc} delay={index * 0.05}>
                  <div className="group flex items-center gap-2.5 rounded-full border border-border bg-card/50 px-6 py-3.5 transition-all duration-300 hover:border-accent/60 hover:bg-accent/10">
                    <MapPin size={16} className="text-accent" />
                    <p className="font-heading text-lg tracking-wider text-foreground">{loc}</p>
                  </div>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recorded stories */}
      <section className="relative overflow-hidden border-y border-border bg-card/20">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Watch &amp; Learn</p>
              </div>
              <h2 className="mb-12 font-heading tracking-wide text-foreground">
                <KineticText text="RECORDED STORIES" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoTestimonials.map((video, index) => (
                <SectionWrapper key={video.id} delay={index * 0.1}>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(video)}
                    className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-500 hover:-translate-y-1 hover:border-accent/60"
                  >
                    <div className="vignette relative aspect-video bg-black">
                      <img
                        src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                        alt={video.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110">
                          <Play size={22} className="ml-1" fill="currentColor" />
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="mb-1 font-heading text-lg tracking-wider text-card-foreground line-clamp-1">{video.title}</p>
                      <p className="font-body text-sm text-muted-foreground">
                        {video.speaker} · {video.location}
                      </p>
                    </div>
                  </button>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Written testimonies */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">In Their Words</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-14 font-heading tracking-wide text-foreground">
                <KineticText text="WRITTEN TESTIMONIES" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-8">
                    <Skeleton className="mb-4 h-10 w-10" />
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="mb-4 h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center font-body text-muted-foreground">{error}</p>
            ) : paginated.length === 0 ? (
              <p className="text-center font-body text-muted-foreground">
                No testimonies in this filter yet — be the first to share below.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${countryFilter}-${page}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {paginated.map((t, i) => (
                    <motion.article
                      key={t.id || t._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:bg-card"
                    >
                      <Quote size={26} className="mb-4 text-accent" />
                      <p className="mb-6 flex-1 font-body leading-relaxed text-card-foreground/85">
                        "{t.text}"
                      </p>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <p className="font-heading text-lg tracking-wider text-card-foreground">{t.name}</p>
                          <p className="font-body text-sm text-muted-foreground">{t.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.category && (
                            <span className="rounded-full bg-accent/10 px-3 py-1 font-body text-xs text-accent">
                              {t.category}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              trackEvent({ category: "engagement", action: "share", label: "testimony_copy_link" });
                            }}
                            className="p-2 text-muted-foreground transition-colors hover:text-accent"
                            aria-label="Share this testimony"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {totalPages > 1 && !loading && !error && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="self-center px-4 font-body text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl border-border bg-background p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{activeVideo?.title}</DialogTitle>
          </DialogHeader>
          {activeVideo && (
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                className="h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={activeVideo.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Book reviews */}
      <section className="relative overflow-hidden border-t border-border bg-card/20">
        <div className="section-padding">
          <div className="container-custom">
            <SectionWrapper className="text-center">
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Book Reviews</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-14 font-heading tracking-wide text-foreground">
                <KineticText text="WHAT READERS SAY" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {bookTestimonials.map((review, i) => (
                <SectionWrapper key={review.id} delay={i * 0.1}>
                  <div className="h-full rounded-2xl border border-border bg-background p-8 text-center transition-all duration-500 hover:border-accent/50">
                    <Book size={32} className="mx-auto mb-5 text-accent" />
                    <p className="mb-5 font-body italic leading-relaxed text-card-foreground/85">
                      "{review.quote}"
                    </p>
                    <p className="font-heading tracking-wider text-accent">
                      — {review.reader}, {review.location}
                    </p>
                  </div>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Share yours */}
      <section className="relative overflow-hidden bg-primary vignette">
        <EmberGlow intensity="medium" />
        <div className="section-padding">
          <div className="container-custom text-center">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Your Chapter Next</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="mb-6 font-heading tracking-wide text-primary-foreground">
                <KineticText text="SHARE YOUR STORY" className="text-5xl sm:text-7xl" />
              </h2>
              <p className="mx-auto mb-10 max-w-2xl font-body text-lg text-muted-foreground">
                Your testimony could be the spark someone else needs. Join the community
                and tell us how God has moved in your life.
              </p>
              <TestimonySubmissionForm />
            </SectionWrapper>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonies;
