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

          <div className="grid gap-4">
            {items.map((item) => {
              const productId = item._id || item.id || "";
              return (
                <div key={productId} className="rounded-3xl border border-border p-5 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => addItem(item)}>
                      Add to cart
                    </Button>
                    <Button variant="ghost" onClick={() => removeItem(productId)}>
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
