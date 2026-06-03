import { useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const hasItems = items.length > 0;

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh]">
        <div className="container-custom">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="font-heading text-3xl">Wishlist</h1>
              <p className="text-muted-foreground">Your saved items ready for later.</p>
            </div>
            {hasItems && (
              <Button variant="outline" onClick={clearWishlist}>
                Clear wishlist
              </Button>
            )}
          </div>

          {!hasItems && (
            <div className="rounded-3xl border border-border p-8 text-center">
              <p className="mb-4">Your wishlist is empty.</p>
              <Link to="/shop" className="btn btn-primary">
                Browse products
              </Link>
            </div>
          )}

          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.productId} className="rounded-3xl border border-border p-5 bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">${item.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => addItem(item, item.quantity)}>
                    Add to cart
                  </Button>
                  <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
