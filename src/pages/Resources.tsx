import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, BookOpen, FileText, Headphones, ExternalLink, Eye, ArrowRight } from "lucide-react";
import PdfViewer from "@/components/PdfViewer";
import { resourcesApi, Resource } from "@/api/resources";
import { trackDownload } from "@/lib/analytics";

const categories = ["All", "Church History & Martyrs for Christ", "Other Inspiration", "TTIN Resources"];

const typeIcons: Record<string, React.ReactNode> = {
  book: <BookOpen size={20} />,
  devotional: <BookOpen size={20} />,
  guide: <FileText size={20} />,
  article: <FileText size={20} />,
  podcast: <Headphones size={20} />,
};

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("category") || "All");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Resource | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const setCategory = (cat: string) => {
    setFilter(cat);
    if (cat === "All") searchParams.delete("category");
    else searchParams.set("category", cat);
    setSearchParams(searchParams, { replace: true });
  };

  const handlePreview = async (resource: Resource) => {
    setPreview(resource);
    if (resource.type === 'book') {
      // Absolute paths ("/resources/...", "/api/uploads/...") are same-origin —
      // don't prefix them with the API base (that produced broken URLs).
      let previewUrl = resource.downloadUrl || '';
      if (previewUrl && !/^https?:\/\//i.test(previewUrl) && !previewUrl.startsWith('/')) {
        const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
        previewUrl = `${base}/${previewUrl}`;
      }
      setPdfUrl(previewUrl);
    } else {
      setPdfUrl(null);
    }
  };

  const handleClosePdf = () => {
    setPdfUrl(null);
  };

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await resourcesApi.getAll(filter !== "All" ? { category: filter } : undefined);
        setResources(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError("Failed to load resources");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filter]);

  const filtered = resources;

  return (
    <Layout>
      <PageHero
        kicker="Equip Yourself"
        title="RESOURCES"
        italic="sharpen your witness"
        description="Tools, guides, and content to equip you for bold, unashamed living."
        align="center"
      />

      {/* Filter */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md sm:top-20">
        <div className="container-custom flex flex-wrap justify-center gap-2 py-4">
          {categories.map((t) => (
            <button
              key={t}
              onClick={() => setCategory(t)}
              className={`rounded-full px-5 py-2 font-heading text-sm tracking-wider transition-all duration-300 ${
                filter === t
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              {t === "All" ? "All Resources" : t}
            </button>
          ))}
        </div>
      </section>

      {/* Community band */}
      <section className="border-b border-border bg-card/20">
        <div className="container-custom py-10">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="mb-1 font-heading text-2xl tracking-wider text-foreground">
                Want it straight from the source?
              </h3>
              <p className="font-body text-muted-foreground">
                Connect with bold believers and get exclusive resources, discussions, and encouragement.
              </p>
            </div>
            <a
              href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-heading tracking-wider text-accent-foreground transition-all duration-300 hover:glow-accent"
            >
              Join The Community
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Resources grid */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-8">
                    <Skeleton className="mb-4 h-10 w-10" />
                    <Skeleton className="mb-4 h-3 w-16" />
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="mb-2 h-3 w-1/2" />
                    <Skeleton className="mb-4 h-16 flex-1" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center font-body text-muted-foreground">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-center font-body text-muted-foreground">
                Nothing in this category yet — check back soon.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={filter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((resource, i) => (
                    <motion.div
                      key={resource.id || resource._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:bg-card"
                    >
                      <span className="pointer-events-none absolute -right-4 -top-6 select-none font-heading text-8xl leading-none text-foreground/[0.04]" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                          {typeIcons[resource.type] || <FileText size={20} />}
                        </div>
                        <div>
                          <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {resource.type}
                          </span>
                          {(resource.free ?? (resource as { isFree?: boolean }).isFree) && (
                            <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 font-heading text-xs tracking-wider text-accent-foreground">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="mb-1.5 font-heading text-xl tracking-wider text-card-foreground">
                        {resource.title}
                      </h3>
                      <p className="mb-2 font-body text-xs uppercase tracking-[0.15em] text-accent">
                        by {resource.author}
                      </p>
                      <p className="mb-4 flex-1 font-body text-sm text-muted-foreground line-clamp-3">
                        {resource.description}
                      </p>
                      {resource.downloadCount != null && resource.downloadCount > 0 && (
                        <p className="mb-4 font-body text-xs text-muted-foreground">
                          {resource.downloadCount} downloads
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handlePreview(resource)}
                        >
                          <Eye size={14} /> {resource.type === "book" ? "Read" : "Preview"}
                        </Button>
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                          onClick={async () => {
                            const resourceId = resource._id || resource.id;
                            trackDownload(resourceId?.toString() || "", resource.title);
                            if (resourceId) {
                              try {
                                await resourcesApi.download(resourceId.toString());
                              } catch {
                                /* still open link */
                              }
                            }
                          }}
                        >
                          <Button size="sm" className="w-full gap-2">
                            {resource.type === "podcast" ? (
                              <>Listen <ExternalLink size={14} /></>
                            ) : (
                              <>Get <Download size={14} /></>
                            )}
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="border-border bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wider">{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-accent">
                by {preview.author}
              </p>
              <p className="font-body text-muted-foreground">{preview.description}</p>
              {preview.downloadCount != null && (
                <p className="font-body text-sm text-muted-foreground">
                  {preview.downloadCount} downloads
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PdfViewer url={pdfUrl || ""} title={preview?.title || "PDF"} open={!!pdfUrl} onClose={handleClosePdf} />
    </Layout>
  );
};

export default Resources;
