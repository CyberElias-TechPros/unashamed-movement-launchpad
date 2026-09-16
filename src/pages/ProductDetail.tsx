import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  ArrowRight,
  Bell,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { productsApi, Product } from "@/api/products";
import { reviewsApi, Review } from "@/api/reviews";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

const Stars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={
          i <= Math.round(rating) ? "text-[#eab308] fill-[#eab308]" : "text-muted-foreground/40"
        }
      />
    ))}
  </span>
);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, title: "", body: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const productId = product?._id || product?.id || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setRelated([]);
    setReviews([]);
    setQty(1);
    setSize(null);
    setColor(null);
    setActiveImage(0);

    if (!id) return;
    productsApi
      .getById(id)
      .then((p) => {
        setProduct(p);
        setLoading(false);
        // Related products from the same category
        productsApi
          .getAll({ category: p.category, limit: 8 })
          .then((data) => {
            const items = Array.isArray(data) ? data : data.data || [];
            setRelated(items.filter((r) => (r._id || r.id) !== (p._id || p.id)).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    reviewsApi
      .getByProduct(id, { limit: 50 })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.data || [];
        setReviews(items);
      })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-28">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              <Skeleton className="w-full aspect-square rounded-[20px]" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound || !product) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-28 pb-32 text-center">
          <div className="container-custom max-w-lg">
            <h1 className="font-heading text-4xl tracking-wider text-foreground mb-4">
              Product not found
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              This product may have been removed or is no longer available.
            </p>
            <Link to="/shop">
              <Button variant="hero" size="lg">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back to Shop
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const inStock = (product.stock ?? 0) > 0;
  const isWishlisted = isInWishlist(productId);
  const avgRating =
    product.averageRating ??
    (reviews.length
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : null);

  const handleAddToCart = (goToCheckout = false) => {
    if (sizes.length && !size) {
      toast({ title: "Choose a size", description: "Please select a size first." });
      return;
    }
    addItem(product, qty, { size: size || undefined, color: color || undefined });
    trackEvent({ category: "ecommerce", action: "add_to_cart", label: product.name });
    if (goToCheckout) {
      navigate("/checkout");
    } else {
      toast({ title: "Added to cart", description: `${product.name} is in your cart.` });
    }
  };

  const handleNotify = async (e: FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim() || !productId) return;
    try {
      await productsApi.subscribeStock(productId, notifyEmail.trim());
      setNotified(true);
    } catch {
      toast({
        title: "Couldn't subscribe",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.body.trim() || !productId) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create(productId, {
        name: reviewForm.name.trim(),
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        body: reviewForm.body.trim(),
      });
      setReviewSubmitted(true);
      setReviewForm({ name: "", rating: 5, title: "", body: "" });
    } catch {
      toast({
        title: "Couldn't submit review",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="bg-background pt-24 pb-4">
        <div className="container-custom">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors font-body"
          >
            <ChevronLeft className="w-4 h-4" /> Shop
          </Link>
        </div>
      </section>

      {/* Product */}
      <section className="page-section full-bleed-section section-theme-bright">
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom pb-16 md:pb-24">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Gallery */}
              <div>
                <div className="template-card bg-card border border-border overflow-hidden">
                  <div className="relative aspect-square bg-[#0a0a0a]">
                    {images[activeImage] ? (
                      <img
                        src={images[activeImage]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/30">
                        <ShoppingBag className="w-16 h-16" />
                      </div>
                    )}
                    {product.tag && (
                      <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider bg-[#eab308] text-[#0a0a0a] px-3 py-1 rounded-full">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 mt-4">
                    {images.map((img, i) => (
                      <button
                        key={img + i}
                        onClick={() => setActiveImage(i)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === activeImage ? "border-[#eab308]" : "border-border"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                {avgRating !== null && (
                  <div className="flex items-center gap-2 mb-3">
                    <Stars rating={avgRating} />
                    <span className="text-sm text-muted-foreground font-body">
                      {avgRating.toFixed(1)} · {product.reviewCount ?? reviews.length} review
                      {(product.reviewCount ?? reviews.length) === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
                <h1 className="font-heading text-4xl sm:text-5xl tracking-wider text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="font-heading text-3xl text-accent mb-6">
                  ${Number(product.price).toFixed(2)}
                </p>
                <p className="font-body text-card-foreground/70 leading-relaxed mb-8">
                  {product.description}
                </p>

                {sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                      Size {size && <span className="text-accent">— {size}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`min-w-12 h-11 px-3 rounded-full font-heading text-sm tracking-wider transition-all duration-300 ${
                            size === s
                              ? "bg-[#eab308] text-[#0a0a0a]"
                              : "bg-muted text-muted-foreground hover:bg-[#eab308]/20"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="mb-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                      Color {color && <span className="text-accent">— {color}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`h-11 px-4 rounded-full font-heading text-sm tracking-wider transition-all duration-300 ${
                            color === c
                              ? "bg-[#eab308] text-[#0a0a0a]"
                              : "bg-muted text-muted-foreground hover:bg-[#eab308]/20"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {inStock ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Quantity
                      </p>
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-heading">{qty}</span>
                        <button
                          onClick={() => setQty(Math.min(product.stock ?? 99, qty + 1))}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground font-body">
                        {product.stock} in stock
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="hero"
                        size="lg"
                        className="flex-1"
                        onClick={() => handleAddToCart()}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() => handleAddToCart(true)}
                      >
                        Buy Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="sm:w-auto"
                        aria-label="Toggle wishlist"
                        onClick={() => {
                          if (isWishlisted) {
                            removeWishlist(productId);
                            toast({ title: "Removed from wishlist" });
                          } else {
                            addWishlist(product);
                            toast({ title: "Saved to wishlist" });
                          }
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${isWishlisted ? "fill-[#eab308] text-[#eab308]" : ""}`}
                        />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="template-card bg-card border border-border p-6">
                    <p className="font-heading text-lg tracking-wider text-foreground mb-2">
                      Out of stock
                    </p>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Enter your email and we'll notify you the moment it's back.
                    </p>
                    {notified ? (
                      <p className="flex items-center gap-2 text-accent font-body text-sm">
                        <CheckCircle2 className="w-4 h-4" /> You're on the list — we'll email you
                        when it restocks.
                      </p>
                    ) : (
                      <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          required
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="newsletter-form-field-element flex-1"
                        />
                        <button type="submit" className="newsletter-form-button">
                          <Bell className="w-4 h-4 mr-1 inline" /> Notify Me
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="page-section full-bleed-section section-theme-bright-inverse">
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-16 md:py-24">
            <div className="text-center mb-12">
              <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                Reviews
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-4">
                What Believers Are Saying
              </h2>
              {avgRating !== null && (
                <div className="flex items-center justify-center gap-2">
                  <Stars rating={avgRating} size={20} />
                  <span className="font-body text-muted-foreground">
                    {avgRating.toFixed(1)} from {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="template-card bg-card border border-border p-8 text-center">
                    <p className="font-body text-muted-foreground">
                      No reviews yet — be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  reviews.map((r, i) => (
                    <div key={r._id || i} className="template-card bg-card border border-border p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-heading text-lg tracking-wider text-foreground">
                          {r.title || r.name || "Reviewer"}
                        </p>
                        <Stars rating={r.rating || 5} size={14} />
                      </div>
                      <p className="font-body text-sm text-card-foreground/70 leading-relaxed mb-3">
                        {r.body}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        — {r.name}
                        {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Write */}
              <div>
                <div className="template-card bg-card border border-border p-8">
                  <h3 className="font-heading text-xl tracking-wider text-foreground mb-2">
                    Write a Review
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    Reviews are moderated and appear after approval.
                  </p>
                  {reviewSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                      <p className="font-heading text-lg tracking-wider text-foreground mb-2">
                        Thank you!
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        Your review is awaiting moderation.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReview} className="space-y-4">
                      <div>
                        <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                          Your Name
                        </label>
                        <input
                          required
                          maxLength={100}
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="newsletter-form-field-element w-full"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                              aria-label={`Rate ${i} stars`}
                            >
                              <Star
                                size={26}
                                className={
                                  i <= reviewForm.rating
                                    ? "text-[#eab308] fill-[#eab308]"
                                    : "text-muted-foreground/40"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                          Title
                        </label>
                        <input
                          maxLength={120}
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          className="newsletter-form-field-element w-full"
                          placeholder="Sum it up"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                          Review
                        </label>
                        <textarea
                          required
                          maxLength={2000}
                          rows={4}
                          value={reviewForm.body}
                          onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                          className="newsletter-form-field-element w-full rounded-2xl py-3 h-auto"
                          placeholder="What did this mean to you?"
                        />
                      </div>
                      <Button type="submit" variant="hero" className="w-full" disabled={submittingReview}>
                        {submittingReview ? "Submitting…" : "Submit Review"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="page-section full-bleed-section section-theme-bright">
          <div className="section-border" />
          <div className="section-background" />
          <div className="content-wrapper">
            <div className="content container-custom py-16 md:py-24">
              <div className="text-center mb-12">
                <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
                  Keep Exploring
                </p>
                <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground">
                  You May Also Like
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <Link
                    key={p._id || p.id}
                    to={`/shop/${p._id || p.id}`}
                    className="template-card bg-card border border-border overflow-hidden group block"
                  >
                    <div className="relative aspect-square bg-[#0a0a0a]">
                      {(p.images?.[0] || p.image) && (
                        <img
                          src={p.images?.[0] || p.image}
                          alt={p.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-base tracking-wider text-card-foreground mb-1 line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="font-heading text-sm text-accent">
                        ${Number(p.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
