import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  category: "merch" | "digital";
  description: string;
  tag?: string;
}

const products: Product[] = [
  { id: 1, name: "Unashamed Tee — Black", price: 35, category: "merch", description: "Premium cotton tee with bold 'UNASHAMED' print. Wear your faith.", tag: "Best Seller" },
  { id: 2, name: "Unashamed Tee — Cream", price: 35, category: "merch", description: "The classic Unashamed tee in soft cream with blackberry print." },
  { id: 3, name: "TTIN Hoodie", price: 60, category: "merch", description: "Heavyweight hoodie with embroidered TTIN logo. Stay warm, stay bold." },
  { id: 4, name: "Bold Faith Cap", price: 25, category: "merch", description: "Structured snapback with 'Bold Faith' embroidery. One size fits all." },
  { id: 5, name: "Boldness Devotional (PDF)", price: 12, category: "digital", description: "30-day devotional to build unshakeable courage in your faith walk.", tag: "New" },
  { id: 6, name: "Evangelism Toolkit", price: 15, category: "digital", description: "Complete guide with conversation starters, scripture cards, and more." },
  { id: 7, name: "Unashamed Wallpaper Pack", price: 5, category: "digital", description: "High-res phone and desktop wallpapers with bold faith declarations." },
  { id: 8, name: "TTIN Sticker Pack", price: 8, category: "merch", description: "Set of 6 vinyl stickers with TTIN designs. Perfect for laptops and bottles." },
];

const Shop = () => {
  const [filter, setFilter] = useState<"all" | "merch" | "digital">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-accent/15 rounded-full blur-3xl" />
        </div>
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

      {/* Filter */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {(["all", "merch", "digital"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
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

      {/* Products Grid */}
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
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    {/* Image placeholder */}
                    <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      <span className="font-heading text-4xl text-muted-foreground/30 tracking-wider">
                        TTIN
                      </span>
                      {product.tag && (
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-heading tracking-wider px-3 py-1 rounded-full">
                          {product.tag}
                        </span>
                      )}
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
                        <Button size="sm" variant="default" className="gap-2">
                          <ShoppingCart size={14} /> Add
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

      {/* Product Modal */}
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
                <span className="font-heading text-6xl text-muted-foreground/20 tracking-wider">
                  TTIN
                </span>
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
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl sm:text-3xl text-accent">
                    ${selectedProduct.price}
                  </span>
                  <Button variant="hero" size="lg" className="gap-2">
                    <ShoppingCart size={18} /> Add to Cart
                  </Button>
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
