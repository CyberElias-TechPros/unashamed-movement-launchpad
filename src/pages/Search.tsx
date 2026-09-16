import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { searchApi } from "@/api/search";
import { Skeleton } from "@/components/ui/skeleton";

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
      <section className="section-padding bg-background pt-24">
        <div className="container-custom max-w-3xl">
          <h1 className="font-heading text-4xl tracking-wider mb-2">Search</h1>
          <p className="text-muted-foreground mb-8">
            {q ? `Results for "${q}"` : "Enter a search term from the navigation bar."}
          </p>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="space-y-4 w-full max-w-2xl">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && results && (
            <div className="space-y-10">
              {[
                { key: "products", label: "Products", items: results.products, path: "/shop" },
                { key: "resources", label: "Resources", items: results.resources, path: "/resources" },
                { key: "testimonies", label: "Testimonies", items: results.testimonies, path: "/testimonies" },
              ].map((section) =>
                section.items.length > 0 ? (
                  <div key={section.key}>
                    <h2 className="font-heading text-xl tracking-wider mb-4">{section.label}</h2>
                    <ul className="space-y-3">
                      {section.items.map((item: { _id?: string; id?: string; name?: string; title?: string; description?: string; text?: string }) => (
                        <li key={item._id || item.id} className="p-4 border border-border rounded-lg hover:border-accent">
                          <Link to={section.key === 'products' ? `/shop/${item._id || item.id}` : section.path} className="font-heading tracking-wider">
                            {item.name || item.title}
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description || item.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
              {!results.products.length && !results.resources.length && !results.testimonies.length && (
                <p className="text-muted-foreground">No results found.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Search;
