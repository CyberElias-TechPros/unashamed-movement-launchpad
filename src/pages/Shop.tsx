import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { productsApi, Product } from "@/api/products";
import { reviewsApi, Review } from "@/api/reviews";
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
      const email = (f.elements.namedItem('notifyEmail') as HTMLInputElement).value;
      if (!email) return;
      onSubscribe(email);
      f.reset();
    }}>
      <input name="notifyEmail" placeholder="Email" className="p-2 border border-border rounded w-full" />
      <button className="btn btn-primary" type="submit">Notify me</button>
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
  const productKey = selectedProduct?._id || selectedProduct?.id || '';
  const { data: reviewsResponse } = useQuery<PaginatedResponse<Review> | undefined>({
    queryKey: ['reviews', productKey],
    queryFn: () => productKey ? reviewsApi.getByProduct(productKey) : Promise.resolve({ success: true, data: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false, nextPage: null, prevPage: null } }),
    enabled: !!productKey,
  });
  const reviews = reviewsResponse?.data || [];

  const submitReview = useMutation({
    mutationFn: (payload: { productId: string; data: Partial<Review> }) =>
      reviewsApi.create(payload.productId, payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productKey] }),
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

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="aspect-square" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
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
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-accent/15 rounded-full blur-3xl" />
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
              Wear Your Faith
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Shop Now
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
              Merch and digital resources to fuel your bold faith journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {(["all", "merch", "digital"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterWithUrl(cat)}
              className={`font-heading text-sm tracking-wider px-6 py-2 rounded-full transition-all duration-300 capitalize ${
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {cat === "all" ? "All Products" : cat}
            </button>
          ))}
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {products.map((product, i) => (
                <motion.div
                  key={product.id || product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="font-heading text-4xl text-muted-foreground/30 tracking-wider">
                          {product.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      {product.tag && (
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-heading tracking-wider px-3 py-1 rounded-full">
                          {product.tag}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(product, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-card/90 hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Toggle wishlist"
                      >
                        <Heart
                          size={18}
                          className={isInWishlist(product._id || product.id || "") ? "fill-accent text-accent" : ""}
                        />
                      </button>
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="bg-primary-foreground text-primary p-3 rounded-full hover:scale-110 transition-transform"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-heading text-lg tracking-wider text-card-foreground mb-2">
                        {product.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="font-heading text-xl text-accent">
                          ${product.price}
                        </span>
                        <Button size="sm" variant="default" className="gap-2" onClick={() => setSelectedProduct(product)}>
                          <Eye size={14} /> Quick View
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl"
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {selectedProduct.images?.[0] ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading text-6xl text-muted-foreground/20 tracking-wider">
                    {selectedProduct.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-card text-card-foreground p-2 rounded-full hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
                <div className="p-5 sm:p-8">
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2">
                  {selectedProduct.category}
                </p>
                <h3 className="font-heading text-xl sm:text-2xl tracking-wider text-card-foreground mb-3">
                  {selectedProduct.name}
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  {selectedProduct.description}
                </p>
                {selectedProduct.category === "merch" && (
                  <div className="mb-4">
                    <label className="text-sm font-body text-muted-foreground block mb-2">Size</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(selectedProduct.sizes?.length ? selectedProduct.sizes : APPAREL_SIZES).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-2xl sm:text-3xl text-accent">
                    ${selectedProduct.price}
                  </span>
                  <div className="text-right">
                    {selectedProduct.reviewCount ? (
                      <p className="text-sm font-medium text-foreground">
                        {selectedProduct.averageRating?.toFixed(1)} / 5 • {selectedProduct.reviewCount} review{selectedProduct.reviewCount === 1 ? '' : 's'}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No reviews yet</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm font-body text-muted-foreground">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.stock || 99}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-border rounded bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-8 border-t border-border">
                  <h4 className="font-heading text-lg mb-2">Reviews</h4>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <div key={r._id} className="border border-border rounded p-3">
                          <div className="font-semibold">{r.name || 'Anonymous'} <span className="text-sm text-muted-foreground">· {r.rating}/5</span></div>
                          {r.title && <div className="text-sm font-medium">{r.title}</div>}
                          {r.body && <div className="text-sm text-muted-foreground">{r.body}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No reviews yet. Be the first to leave a review.</div>
                  )}

                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Leave a review</h5>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const payload: Partial<Review> = {
                        name: String(formData.get('name') || ''),
                        email: String(formData.get('email') || ''),
                        rating: Number(formData.get('rating') || 5),
                        title: String(formData.get('title') || ''),
                        body: String(formData.get('body') || ''),
                      };
                      const pid = selectedProduct?._id || selectedProduct?.id || '';
                      submitReview.mutate({ productId: pid, data: payload });
                      form.reset();
                    }}>
                      <input name="name" placeholder="Your name" className="w-full mb-2 p-2 border border-border rounded" />
                      <input name="email" placeholder="Email (optional)" className="w-full mb-2 p-2 border border-border rounded" />
                      <select name="rating" defaultValue={5} className="w-full mb-2 p-2 border border-border rounded">
                        {[5,4,3,2,1].map((n) => (<option key={n} value={n}>{n} stars</option>))}
                      </select>
                      <input name="title" placeholder="Review title" className="w-full mb-2 p-2 border border-border rounded" />
                      <textarea name="body" placeholder="Write your review" className="w-full mb-2 p-2 border border-border rounded" />
                      <div className="flex gap-2">
                        <button className="btn btn-primary" type="submit">Submit review</button>
                      </div>
                    </form>
                  </div>

                  {selectedProduct?.stock != null && selectedProduct.stock <= 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Out of stock — get notified when available</p>
                      <SubscribeForm onSubscribe={(email) => subscribeStock.mutate(email)} />
                    </div>
                  )}
                </div>
                {selectedProduct.stock != null && selectedProduct.stock <= 5 && (
                  <p className="text-sm text-amber-600 mb-2">Only {selectedProduct.stock} left in stock</p>
                )}
                <Button variant="hero" size="lg" className="gap-2 w-full" onClick={handleAddToCart}>
                  <ShoppingCart size={18} /> Add to Cart
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Shop;