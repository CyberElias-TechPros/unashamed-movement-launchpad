import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { searchApi } from "@/api/search";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";

const Search = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchApi.search>> | null>(null);

  useEffect(() => {
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        setResults(await searchApi.search(q));
      } catch {
        setResults({ products: [], resources: [], testimonies: [] });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  return (
    <Layout>
      <PageHero
        kicker="Find It"
        title="SEARCH"
        italic={q ? `results for "${q}"` : "type from the nav bar"}
      />

      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom max-w-3xl">
            {loading && (
              <div className="w-full space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !q && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
                  <SearchIcon size={30} className="text-accent" />
                </div>
                <p className="font-body text-muted-foreground">
                  Use the search icon in the navigation to look up products, resources, and testimonies.
                </p>
              </div>
            )}

            {!loading && results && (
              <div className="space-y-12">
                {[
                  { key: "products", label: "Products", items: results.products, path: "/shop" },
                  { key: "resources", label: "Resources", items: results.resources, path: "/resources" },
                  { key: "testimonies", label: "Testimonies", items: results.testimonies, path: "/testimonies" },
                ].map((section) =>
                  section.items.length > 0 ? (
                    <div key={section.key}>
                      <div className="mb-5 flex items-center gap-4">
                        <span className="h-px w-10 bg-accent/70" />
                        <h2 className="kicker">{section.label}</h2>
                      </div>
                      <ul className="space-y-3">
                        {section.items.map((item: { _id?: string; id?: string; name?: string; title?: string; description?: string; text?: string }) => (
                          <li key={item._id || item.id}>
                            <Link
                              to={section.path}
                              className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card/60 p-5 transition-all duration-300 hover:border-accent/60 hover:bg-card"
                            >
                              <div>
                                <p className="font-heading text-lg tracking-wider text-foreground">
                                  {item.name || item.title}
                                </p>
                                <p className="mt-1 font-body text-sm text-muted-foreground line-clamp-2">
                                  {item.description || item.text}
                                </p>
                              </div>
                              <ArrowUpRight size={18} className="mt-1 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
                {!results.products.length && !results.resources.length && !results.testimonies.length && (
                  <div className="py-8 text-center">
                    <p className="mb-2 font-heading text-3xl tracking-wider text-foreground">
                      Nothing Found
                    </p>
                    <p className="font-body text-muted-foreground">
                      No matches for "{q}" — try a different word, like "bold" or "hoodie".
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Search;
