import { useCart } from "@/context/CartContext";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { items, totalItems, subtotal, tax, total, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <Layout>
      <PageHero
        kicker="Review Your Gear"
        title="YOUR CART"
        italic={totalItems > 0 ? `${totalItems} item${totalItems === 1 ? "" : "s"} packed` : "waiting to be filled"}
      />

      <section className="relative overflow-hidden bg-background">
        {items.length > 0 && <EmberGlow intensity="low" />}
        <div className="section-padding">
          <div className="container-custom">
            <AnimatePresence mode="wait">
              {items.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-20 text-center"
                >
                  <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                    <ShoppingBag size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="mb-4 font-heading text-4xl tracking-wider text-foreground">
                    Your Cart Is Empty
                  </h3>
                  <p className="mx-auto mb-10 max-w-md font-body text-muted-foreground">
                    Every piece you wear is a conversation starter. Go find yours.
                  </p>
                  <Link to="/shop">
                    <Button variant="hero" size="lg">
                      Continue Shopping <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                >
                  <div className="space-y-4 lg:col-span-2">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        layout
                        className="group flex gap-5 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-accent/40 sm:p-6"
                      >
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-black/30">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-heading text-sm tracking-widest text-gradient-gold">TTIN</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-heading text-lg tracking-wider text-card-foreground">
                                {item.name}
                              </h4>
                              {item.variant?.size && (
                                <p className="mt-0.5 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                  Size {item.variant.size}
                                </p>
                              )}
                              <p className="mt-1 font-heading text-lg text-gradient-gold">
                                ${item.price}
                              </p>
                            </div>
                            <span className="font-body text-sm text-muted-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={15} />
                              </button>
                              <span className="w-8 text-center font-body">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent"
                                aria-label="Increase quantity"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
                      >
                        <ArrowLeft size={15} /> Keep Shopping
                      </Link>
                      <button
                        onClick={clearCart}
                        className="font-body text-sm text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Clear cart
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="glass-panel sticky top-28 rounded-2xl p-7">
                      <h3 className="mb-6 font-heading text-2xl tracking-wider text-card-foreground">
                        Order Summary
                      </h3>
                      <div className="mb-6 space-y-4">
                        <div className="flex justify-between font-body">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-card-foreground">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-body">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="text-card-foreground">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-body">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-accent">Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-4">
                          <span className="font-heading text-xl tracking-wider">Total</span>
                          <span className="font-heading text-xl tracking-wider text-gradient-gold">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Link to="/checkout" className="block">
                        <Button variant="hero" className="w-full" size="lg">
                          Proceed to Checkout <ArrowRight className="ml-2" size={18} />
                        </Button>
                      </Link>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
