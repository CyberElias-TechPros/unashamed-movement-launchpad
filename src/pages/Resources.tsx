import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, BookOpen, FileText, Headphones, ExternalLink, Eye } from "lucide-react";
import PdfViewer from "@/components/PdfViewer";
import { resourcesApi, Resource } from "@/api/resources";
import { trackDownload } from "@/lib/analytics";

const categories = ["All", "Church History", "Martyrs for Christ", "Spiritual Edification"];

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
    setPreview(resource);
    if (resource.type === "book") {
      let previewUrl = resource.downloadUrl || "";
      if (previewUrl && !/^https?:\/\//i.test(previewUrl) && !previewUrl.startsWith("/")) {
        const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
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
      try {
        // Fetch everything, then filter client-side with "includes" semantics
        // (the prototype's chips are substrings of the full categories).
        const data = await resourcesApi.getAll({ limit: 100 });
        const items = Array.isArray(data) ? data : data.data || [];
        setResources(
          filter !== "All"
            ? items.filter((r: Resource) => (r.category || "").includes(filter))
            : items
        );
      } catch (err) {
        setError("Failed to load resources");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filter]);

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="template-card bg-card border border-border p-8 flex flex-col">
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
        <section className="py-20 md:py-28 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white/60">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

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
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full opacity-30 object-cover"
              src="/videos/front-video.mp4"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#0a0a0a]/95" />
        </div>
        <FloatingParticles count={12} color="#eab308" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28 text-center">
            <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
              Grow Your Faith
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white mb-6">
              Resources
            </h1>
            <p className="font-body text-white/60 text-lg max-w-xl mx-auto">
              Tools, guides, and content to equip you for bold, unashamed living.
            </p>
          </div>
        </div>
      </section>

      {/* Community card */}
      <section
        className="page-section full-bleed-section section-theme-bright"
        data-test="page-section"
        data-section-theme="bright"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28 relative z-10">
            <div className="template-card bg-card border border-border p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/3">
                  <img
                    src="/images/home-faith-action.jpg"
                    alt="Join our community"
                    className="w-full aspect-[3/4] object-cover rounded-lg shadow-card"
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-4">
                    Join Our Community
                  </h3>
                  <p className="font-body text-card-foreground/60 mb-6">
                    Connect with other bold believers and get access to exclusive resources,
                    discussions, and encouragement.
                  </p>
                  <a
                    href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sqs-button-element--primary text-sm"
                  >
                    Join Our Community Here!
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section
        className="page-section full-bleed-section section-theme-bright-inverse"
        data-test="page-section"
        data-section-theme="bright-inverse"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${
                    filter === cat
                      ? "bg-[#eab308] text-[#0a0a0a]"
                      : "bg-muted text-muted-foreground hover:bg-[#eab308]/20"
                  }`}
                >
                  {cat === "All" ? "All Resources" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Books grid */}
      <section
        className="page-section full-bleed-section section-theme-bright"
        data-test="page-section"
        data-section-theme="bright"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="template-card bg-card border border-border p-8 flex flex-col"
                >
                  {resource.imageUrl ? (
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover rounded-lg mb-4 shadow-card"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-lg mb-4 shadow-card bg-[#e8dccc] flex items-center justify-center text-[#0a0a0a]/40">
                      {typeIcons[resource.type as keyof typeof typeIcons] ||
                        typeIcons.book}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#0a0a0a]/60">
                      {resource.type}
                    </span>
                    {resource.free && (
                      <span className="font-mono text-xs uppercase tracking-wider text-[#eab308] bg-[#eab308]/10 px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2">
                    {resource.title}
                  </h3>
                  {resource.author && (
                    <p className="font-body text-sm text-card-foreground/50 mb-2">
                      by {resource.author}
                    </p>
                  )}
                  {resource.description && (
                    <p className="font-body text-sm text-card-foreground/60 mb-2 flex-1">
                      {resource.description}
                    </p>
                  )}
                  {resource.downloadCount != null && resource.downloadCount > 0 && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {resource.downloadCount} downloads
                    </p>
                  )}
                  {resource.type === "book" ? (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePreview(resource)}
                      >
                        <Eye className="mr-2 w-4 h-4" /> Preview
                      </Button>
                      {resource.downloadUrl && (
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                          onClick={() =>
                            trackDownload(resource.title, resource.type || "resource")
                          }
                        >
                          <Button variant="default" className="w-full">
                            <Download className="mr-2 w-4 h-4" /> Download
                          </Button>
                        </a>
                      )}
                    </div>
                  ) : resource.downloadUrl ? (
                    <a
                      href={resource.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto"
                      onClick={() => trackDownload(resource.title, resource.type || "resource")}
                    >
                      <Button variant="default" className="w-full">
                        {resource.downloadUrl.startsWith("http") ? (
                          <>
                            <ExternalLink className="mr-2 w-4 h-4" /> Open
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 w-4 h-4" /> Download
                          </>
                        )}
                      </Button>
                    </a>
                  ) : null}
                </div>
              ))}
            </div>

            {resources.length === 0 && (
              <div className="text-center py-16">
                <p className="font-body text-card-foreground/60">
                  No resources found in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {pdfUrl ? (
            <PdfViewer
              url={pdfUrl}
              title={preview?.title || "Resource"}
              open={!!preview}
              onClose={handleClosePdf}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Resources;
