import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, X, Heart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { productsApi, Product } from "@/api/products";
import { reviewsApi, Review } from "@/api/reviews";
import type { PaginatedResponse } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWishlist } from "@/context/WishlistContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL"];

const SubscribeForm = ({ onSubscribe }: { onSubscribe: (email: string) => void }) => {
  return (
    <form className="flex gap-2" onSubmit={(e) => {
      e.preventDefault();
      const f = e.target as HTMLFormElement;
      const email = (f.elements.namedItem("notifyEmail") as HTMLInputElement).value;
      if (!email) return;
      onSubscribe(email);
      f.reset();
    }}>
      <input
        name="notifyEmail"
        type="email"
        required
        placeholder="Your email"
        className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
      />
      <Button type="submit" size="sm" className="shrink-0">Notify Me</Button>
    </form>
  );
};

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "merch" | "digital">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const cat = new URLSearchParams(location.search).get("category");
    if (cat === "merch" || cat === "digital" || cat === "all") {
      setFilter(cat);
    }
  }, [location.search]);

  const setFilterWithUrl = (cat: "all" | "merch" | "digital") => {
    setFilter(cat);
    navigate(cat === "all" ? "/shop" : `/shop?category=${cat}`, { replace: true });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getAll(filter === "all" ? undefined : { category: filter });
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const pid = selectedProduct._id || selectedProduct.id || "";
    if (selectedProduct.stock != null && selectedProduct.stock < quantity) {
      toast({
        title: "Limited stock",
        description: `Only ${selectedProduct.stock} left in stock.`,
        variant: "destructive",
      });
      return;
    }
    addItem(
      selectedProduct,
      quantity,
      selectedProduct.category === "merch" ? { size: selectedSize } : undefined
    );
    trackAddToCart(pid, selectedProduct.name);
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Reviews + subscribe logic
  const queryClient = useQueryClient();
  const productKey = selectedProduct?._id || selectedProduct?.id || "";
  const { data: reviewsResponse } = useQuery<PaginatedResponse<Review> | undefined>({
    queryKey: ["reviews", productKey],
    queryFn: () => productKey ? reviewsApi.getByProduct(productKey) : Promise.resolve({ success: true, data: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false, nextPage: null, prevPage: null } }),
    enabled: !!productKey,
  });
  const reviews = reviewsResponse?.data || [];

  const submitReview = useMutation({
    mutationFn: (payload: { productId: string; data: Partial<Review> }) =>
      reviewsApi.create(payload.productId, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", productKey] }),
  });

  const subscribeStock = useMutation({
    mutationFn: (email: string) => productsApi.subscribeStock(productKey, email),
  });

  const toggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = product._id || product.id || "";
    if (isInWishlist(pid)) removeWishlist(pid);
    else addWishlist(product);
  };

  return (
    <Layout>
      <PageHero
        kicker="Wear Your Faith"
        title="THE SHOP"
        italic="carry the message"
        description="Merch and digital resources to fuel your bold faith journey."
        align="center"
      />

      {/* Filter */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md sm:top-20">
        <div className="container-custom flex flex-wrap justify-center gap-2 py-4">
          {(["all", "merch", "digital"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterWithUrl(cat)}
              className={`rounded-full px-6 py-2 font-heading text-sm capitalize tracking-wider transition-all duration-300 ${
                filter === cat
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              {cat === "all" ? "All Products" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding">
          <div className="container-custom">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Skeleton className="aspect-square" />
                    <div className="space-y-2 p-5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center font-body text-muted-foreground">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-center font-body text-muted-foreground">
                Nothing here yet — check back soon.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={filter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id || product._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i, 8) * 0.06 }}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_28px_70px_-30px_hsl(41_75%_52%/0.35)]">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="relative block aspect-square w-full overflow-hidden bg-gradient-to-b from-card to-background"
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center font-heading text-5xl tracking-wider text-muted-foreground/25">
                              {product.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                          {product.tag && (
                            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.15em] text-accent-foreground">
                              {product.tag}
                            </span>
                          )}
                          {product.stock != null && product.stock <= 0 && (
                            <span className="absolute right-3 top-3 rounded-full bg-foreground/90 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-background">
                              Sold out
                            </span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                            <span className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-100">
                              <Eye size={20} />
                            </span>
                          </span>
                        </button>
                        <div className="flex items-start justify-between gap-3 p-5">
                          <div>
                            <p className="mb-1 font-body text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                              {product.category}
                            </p>
                            <h3 className="mb-1 font-heading text-lg leading-tight tracking-wider text-card-foreground">
                              {product.name}
                            </h3>
                            <span className="font-heading text-xl text-gradient-gold">
                              {product.price === 0 ? "Free" : `$${product.price}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product, e)}
                            className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:border-accent hover:text-accent"
                            aria-label="Toggle wishlist"
                          >
                            <Heart
                              size={16}
                              className={isInWishlist(product._id || product.id || "") ? "fill-accent text-accent" : ""}
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Quick view modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="relative flex aspect-video items-center justify-center bg-black/40">
                {selectedProduct.images?.[0] ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-heading text-6xl tracking-wider text-muted-foreground/20">
                    {selectedProduct.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-4 top-4 rounded-full bg-card p-2 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 sm:p-8">
                <p className="mb-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {selectedProduct.category}
                </p>
                <h3 className="mb-3 font-heading text-2xl tracking-wider text-card-foreground">
                  {selectedProduct.name}
                </h3>
                <p className="mb-6 font-body text-muted-foreground">
                  {selectedProduct.description}
                </p>
                {selectedProduct.category === "merch" && (
                  <div className="mb-4">
                    <label className="mb-2 block font-body text-sm text-muted-foreground">Size</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(selectedProduct.sizes?.length ? selectedProduct.sizes : APPAREL_SIZES).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-heading text-3xl text-gradient-gold">
                    {selectedProduct.price === 0 ? "Free" : `$${selectedProduct.price}`}
                  </span>
                  <div className="text-right">
                    {selectedProduct.reviewCount ? (
                      <p className="flex items-center gap-1.5 font-body text-sm font-medium text-foreground">
                        <Star size={14} className="fill-accent text-accent" />
                        {selectedProduct.averageRating?.toFixed(1)} · {selectedProduct.reviewCount} review{selectedProduct.reviewCount === 1 ? "" : "s"}
                      </p>
                    ) : (
                      <p className="font-body text-sm text-muted-foreground">No reviews yet</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <label className="font-body text-sm text-muted-foreground">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.stock || 99}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-16 rounded border border-border bg-background px-2 py-1 font-body text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {selectedProduct.stock != null && selectedProduct.stock > 0 && selectedProduct.stock <= 5 && (
                  <p className="mb-3 font-body text-sm text-accent">Only {selectedProduct.stock} left in stock</p>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock != null && selectedProduct.stock <= 0}
                >
                  <ShoppingCart size={18} />
                  {selectedProduct.stock != null && selectedProduct.stock <= 0 ? "Sold Out" : "Add to Cart"}
                </Button>

                {selectedProduct?.stock != null && selectedProduct.stock <= 0 && (
                  <div className="mt-4 rounded-xl border border-border bg-background p-4">
                    <p className="mb-3 font-body text-sm text-muted-foreground">
                      Out of stock — get notified when it's back:
                    </p>
                    <SubscribeForm onSubscribe={(email) => subscribeStock.mutate(email)} />
                  </div>
                )}

                <div className="mt-6 border-t border-border pt-6">
                  <h4 className="mb-3 font-heading text-lg tracking-wider">Reviews</h4>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <div key={r._id} className="rounded-lg border border-border bg-background p-3.5">
                          <div className="font-body font-semibold">
                            {r.name || "Anonymous"}{" "}
                            <span className="font-normal text-accent">· {r.rating}/5</span>
                          </div>
                          {r.title && <div className="font-body text-sm font-medium">{r.title}</div>}
                          {r.body && <div className="font-body text-sm text-muted-foreground">{r.body}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">
                      No reviews yet. Be the first to leave one.
                    </p>
                  )}

                  <div className="mt-5">
                    <h5 className="mb-2 font-heading tracking-wider">Leave a review</h5>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const payload: Partial<Review> = {
                        name: String(formData.get("name") || ""),
                        email: String(formData.get("email") || ""),
                        rating: Number(formData.get("rating") || 5),
                        title: String(formData.get("title") || ""),
                        body: String(formData.get("body") || ""),
                      };
                      const pid = selectedProduct?._id || selectedProduct?.id || "";
                      submitReview.mutate({ productId: pid, data: payload });
                      form.reset();
                    }} className="space-y-2">
                      <input name="name" placeholder="Your name" className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none" />
                      <input name="email" placeholder="Email (optional)" className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none" />
                      <select name="rating" defaultValue={5} className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground focus:border-accent focus:outline-none">
                        {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{n} stars</option>))}
                      </select>
                      <input name="title" placeholder="Review title" className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none" />
                      <textarea name="body" placeholder="Write your review" className="w-full rounded-lg border border-border bg-background p-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none" rows={3} />
                      <Button type="submit" variant="outline" size="sm" disabled={submitReview.isPending}>
                        Submit review
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Shop;
