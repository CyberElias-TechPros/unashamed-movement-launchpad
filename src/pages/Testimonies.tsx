import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote, ArrowRight, Users, Globe, Download, Play, Book, Share2, MapPin } from "lucide-react";
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
    const category = params.get('category');
    const country = params.get('country');
    if (category) setActiveCategory(category);
    setCountryFilter(country);
    setPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const data = await testimonialsApi.getAll();
        const approved = data.filter(t => t.isApproved !== false);
        setTestimonials(approved);
      } catch (err) {
        setError("Failed to load testimonials");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const newUrl = category === 'All' ? '/testimonies' : `/testimonies?category=${category}`;
    navigate(newUrl, { replace: true });
    trackEvent({
      category: 'engagement',
      action: 'filter',
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

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-8 border border-border">
                  <Skeleton className="w-10 h-10 mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="section-padding bg-primary pt-20">
          <div className="container-custom text-center">
            <p className="text-primary-foreground/70">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={15} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Real Stories, Real Faith
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Testimonies
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              Lives transformed by the courage to be unashamed. These are stories 
              from our community of bold believers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background sticky top-0 z-40 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                By The Numbers
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Our Impact
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "100+", label: "People Preached Open Air", icon: <Users className="w-6 h-6" /> },
              { number: "16", label: "Countries Reached", icon: <Globe className="w-6 h-6" /> },
              { number: "158", label: "Books Downloaded", icon: <Download className="w-6 h-6" /> },
              { number: "7", label: "Types of Locations", icon: <MapPin className="w-6 h-6" /> },
            ].map((stat, index) => (
              <SectionWrapper key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                    {stat.icon}
                  </div>
                  <div className="font-heading text-4xl lg:text-5xl text-accent mb-2">
                    {stat.number}
                  </div>
                  <div className="font-body text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Global Reach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
                Interactive World Map
              </h2>
              <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
                See where people are preaching around the world
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-primary-foreground/20">
              <WorldMap
                onCountrySelect={(_code, name) => {
                  navigate(`/testimonies?country=${encodeURIComponent(name)}`);
                }}
              />
              {countryFilter && (
                <p className="text-center mt-4 text-primary-foreground/80">
                  Filtering by: <strong>{countryFilter}</strong>
                  <Button variant="link" className="ml-2 text-accent" onClick={() => navigate("/testimonies")}>
                    Clear
                  </Button>
                </p>
              )}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Preaching Locations */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Where We Preach
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Different Places People Have Preached
              </h2>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {preachingLocations.map((location, index) => (
              <SectionWrapper key={location} delay={index * 0.05}>
                <div className="bg-card rounded-xl p-6 text-center border border-border hover:border-accent transition-colors">
                  <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                  <p className="font-heading text-foreground">{location}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Watch & Learn
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Professionally Recorded Testimonials
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                Hear directly from people impacted by TTIN
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoTestimonials.map((video, index) => (
              <SectionWrapper key={video.id} delay={index * 0.1}>
                <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
                  <div className="relative aspect-video bg-black/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label={`Play ${video.title}`}
                        onClick={() => setActiveVideo(video)}
                        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:bg-accent/90 transition-colors cursor-pointer"
                      >
                        <Play className="w-6 h-6 text-white ml-1" />
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
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Written Testimonies */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Real Stories
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Written Testimonies Of TTIN Impact
              </h2>
            </div>
          </SectionWrapper>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {paginated.map((t, i) => (
                <motion.div
                  key={t.id || t._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group"
                >
                  <Quote className="text-accent mb-4" size={28} />
                  <p className="font-body text-card-foreground/80 leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-heading text-lg tracking-wider text-card-foreground">
                        {t.name}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {t.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-body bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        {t.category}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          trackEvent({
                            category: 'engagement',
                            action: 'share',
                            label: 'testimony_copy_link',
                          });
                        }}
                        className="text-xs font-body text-accent hover:text-accent/80 px-2 py-1 rounded"
                        aria-label="Share this testimony"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="font-body text-muted-foreground self-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{activeVideo?.title}</DialogTitle>
          </DialogHeader>
          {activeVideo && (
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={activeVideo.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Book Testimonials */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <SectionWrapper>
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Book Reviews
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
                Testimonials Of The Book
              </h2>
              <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
                See what readers are saying about our book
              </p>
            </div>
          </SectionWrapper>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {bookTestimonials.map((review, index) => (
                  <div key={review.id} className="text-center">
                    <Book className="w-12 h-12 text-accent mx-auto mb-4" />
                    <p className="font-body text-card-foreground italic leading-relaxed mb-4">
                      "{review.quote}"
                    </p>
                    <p className="font-heading text-accent">
                      — {review.reader}, {review.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <SectionWrapper>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
              Have A Story To Share?
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-10">
              Your testimony could inspire someone else to be bold. Join our community 
              and share how God has moved in your life.
            </p>
            <TestimonySubmissionForm />
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonies;
