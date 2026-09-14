import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const hasItems = items.length > 0;

  return (
    <Layout>
      <PageHero
        kicker="Saved For Later"
        title="WISHLIST"
        italic={hasItems ? `${items.length} item${items.length === 1 ? "" : "s"} you love` : "nothing saved yet"}
      />

      <section className="relative overflow-hidden bg-background">
        {hasItems && <EmberGlow intensity="low" />}
        <div className="section-padding">
          <div className="container-custom max-w-3xl">
            {hasItems && (
              <div className="mb-6 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearWishlist}>
                  Clear wishlist
                </Button>
              </div>
            )}

            {!hasItems && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                  <Heart size={40} className="text-muted-foreground" />
                </div>
                <h3 className="mb-4 font-heading text-4xl tracking-wider text-foreground">
                  Your Wishlist Is Empty
                </h3>
                <p className="mx-auto mb-10 max-w-md font-body text-muted-foreground">
                  Tap the heart on any product to save it here for later.
                </p>
                <Link to="/shop">
                  <Button variant="hero" size="lg">
                    Browse The Shop <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </div>
            )}

            <div className="grid gap-4">
              {items.map((item, i) => {
                const pid = item._id || item.id || item.name;
                const image = (item as { images?: string[] }).images?.[0];
                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 6) * 0.07 }}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-black/30">
                        {image ? (
                          <img src={image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-heading text-xs tracking-widest text-gradient-gold">TTIN</span>
                        )}
                      </div>
                      <div>
                        <p className="font-heading text-lg tracking-wider text-foreground">{item.name}</p>
                        <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {item.category === "digital" ? "Digital download" : "Apparel"}
                        </p>
                        <p className="mt-1 font-heading text-gradient-gold">
                          {item.price === 0 ? "Free" : `$${item.price}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="gap-2" onClick={() => addItem(item, 1)}>
                        <ShoppingCart size={15} /> Add to cart
                      </Button>
                      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-destructive" onClick={() => removeItem(pid)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
