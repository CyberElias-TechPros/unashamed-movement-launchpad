import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, BookOpen, FileText, Headphones, ExternalLink, Eye } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import PdfViewer from "@/components/PdfViewer";
import { resourcesApi, Resource } from "@/api/resources";
import { trackDownload } from "@/lib/analytics";

const categories = ["All", "Church History & Martyrs for Christ", "Other Inspiration", "TTIN Resources"];

const typeIcons = {
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
    if (resource.type === 'book') {
      const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      const previewUrl = resource.downloadUrl && !resource.downloadUrl.startsWith('http')
        ? `${base}${resource.downloadUrl}`
        : resource.downloadUrl;
      setPdfUrl(previewUrl || '');
      setPreview(null);
    } else {
      setPreview(resource);
      setPdfUrl(null);
    }
  };

  const handleClosePdf = () => {
    setPdfUrl(null);
  };

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await resourcesApi.getAll(filter !== "All" ? filter : undefined);
        setResources(data);
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

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-8 border border-border flex flex-col">
                  <Skeleton className="w-full h-32 rounded-lg mb-4" />
                  <Skeleton className="w-10 h-10 mb-4" />
                  <Skeleton className="h-3 w-16 mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-10 flex-1 mb-4" />
                  <Skeleton className="h-8 w-full" />
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
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-secondary/15 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={12} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">Grow Your Faith</p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">Resources</h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
              Tools, guides, and content to equip you for bold, unashamed living.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {categories.map((t) => (
            <button
              key={t}
              onClick={() => setCategory(t)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {t === "All" ? "All Resources" : t}
            </button>
          ))}
        </div>
      </section>

      {/* Community Link */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-lg border border-border">
              <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-4">
                Join Our Community
              </h3>
              <p className="font-body text-muted-foreground text-lg mb-6">
                Connect with other bold believers and get access to exclusive resources, discussions, and encouragement.
              </p>
              <a
                href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-heading tracking-wider hover:bg-accent/90 transition-colors"
              >
                Join Our Community Here!
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((resource, i) => (
                <motion.div
                  key={resource.id || resource._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col overflow-hidden"
                >
                  <LazyImage
                    src="/techpros.png"
                    alt=""
                    className="w-full h-32 object-cover rounded-lg mb-4 opacity-80"
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      {typeIcons[resource.type]}
                    </div>
                    <div>
                      <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                        {resource.type}
                      </span>
                      {resource.free && (
                        <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-heading tracking-wider">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2">
                    {resource.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm mb-1">
                    by {resource.author}
                  </p>
                  <p className="font-body text-muted-foreground text-sm mb-2 flex-1">
                    {resource.description}
                  </p>
                  {resource.downloadCount != null && resource.downloadCount > 0 && (
                    <p className="text-xs text-muted-foreground mb-4">{resource.downloadCount} downloads</p>
                  )}
                  {resource.type === 'book' ? (
                    <Button variant="outline" size="sm" className="w-full gap-2 mb-2" onClick={() => handlePreview(resource)}>
                      <Eye size={14} /> Read
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full gap-2 mb-2" onClick={() => setPreview(resource)}>
                      <Eye size={14} /> Preview
                    </Button>
                  )}
                  <a
                      href={resource.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                      onClick={async (e) => {
                        const resourceId = resource._id || resource.id;
                        trackDownload(resourceId?.toString() || '', resource.title);
                        if (resourceId) {
                          try {
                            await resourcesApi.download(resourceId.toString());
                          } catch {
                            /* still open link */
                          }
                        }
                      }}
                    >
                      <Button variant="default" size="sm" className="w-full gap-2">
                        {resource.type === "podcast" ? (
                          <>Listen <ExternalLink size={14} /></>
                        ) : (
                          <>Download <Download size={14} /></>
                        )}
                      </Button>
                    </a>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">by {preview.author}</p>
              <p className="font-body">{preview.description}</p>
              {preview.downloadCount != null && (
                <p className="text-sm text-muted-foreground">{preview.downloadCount} downloads</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PdfViewer url={pdfUrl || ''} title={preview?.title || 'PDF'} open={!!pdfUrl} onClose={handleClosePdf} />
    </Layout>
  );
};

export default Resources;
