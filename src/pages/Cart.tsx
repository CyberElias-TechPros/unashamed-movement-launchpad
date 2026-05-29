import { useCart } from "@/context/CartContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { items, totalItems, subtotal, tax, total, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <Layout>
      <section className="section-padding bg-primary pt-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Your Cart
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Shopping Cart
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              {totalItems} items in your cart
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                <h3 className="font-heading text-2xl tracking-wider text-foreground mb-4">
                  Your Cart is Empty
                </h3>
                <p className="font-body text-muted-foreground mb-8">
                  Looks like you haven't added any items to your cart yet.
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-6 border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center">
                          <span className="font-heading text-muted-foreground/30">TTIN</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading text-lg tracking-wider text-card-foreground mb-1">
                            {item.name}
                          </h4>
                          <p className="font-body text-accent font-semibold mb-3">
                            ${item.price}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 font-body text-sm flex items-center gap-1 hover:underline"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                    <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-6">
                      Order Summary
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Subtotal</span>
                        <span className="font-body text-card-foreground">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Tax</span>
                        <span className="font-body text-card-foreground">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-4 flex justify-between">
                        <span className="font-heading text-lg tracking-wider">Total</span>
                        <span className="font-heading text-lg tracking-wider text-accent">${total.toFixed(2)}</span>
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
      </section>
    </Layout>
  );
};

export default Cart;