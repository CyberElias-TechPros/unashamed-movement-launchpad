import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productsApi, Product } from "@/api/products";

const SymposShop = () => {
  const [filter, setFilter] = useState<"all" | "merch" | "digital">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productsApi.getAll(filter !== "all" ? filter : undefined);
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filter]);

  return (
    <SymposLayout>
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container-custom text-center relative z-10"
        >
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Wear Your Faith
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
            Shop Now
          </h1>
          <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
            Merch and digital resources to fuel your bold faith journey
          </p>
        </motion.div>
      </section>

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

      <section className="section-padding bg-background">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-foreground border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, i) => (
                <motion.div
                  key={product.id || product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                    <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      <span className="font-heading text-4xl text-muted-foreground/30 tracking-wider">
                        TTIN
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-heading text-lg tracking-wider text-card-foreground mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
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
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-accent">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-accent-foreground mb-6">
            Need Help?
          </h2>
          <p className="font-body text-accent-foreground/70 text-xl max-w-2xl mx-auto mb-10">
            Contact us for bulk orders and special requests
          </p>
          <a
            href="mailto:thetimeisnow255@gmail.com"
            className="inline-block bg-accent-foreground text-accent px-8 py-3 rounded-full font-heading tracking-wider hover:bg-accent-foreground/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </SymposLayout>
  );
};

export default SymposShop;