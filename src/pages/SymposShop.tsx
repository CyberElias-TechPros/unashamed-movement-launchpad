import { useState } from "react";
import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
  category: "merch" | "digital";
  description: string;
}

const products: Product[] = [
  { id: 1, name: "Unashamed Tee - Black", price: 35, category: "merch", description: "Premium cotton tee with bold 'UNASHAMED' print" },
  { id: 2, name: "Unashamed Tee - Cream", price: 35, category: "merch", description: "Classic Unashamed tee in soft cream" },
  { id: 3, name: "TTIN Hoodie", price: 60, category: "merch", description: "Heavyweight hoodie with embroidered TTIN logo" },
  { id: 4, name: "Bold Faith Long Sleeve", price: 45, category: "merch", description: "Comfortable long sleeve with 'Bold Faith' graphic" },
  { id: 5, name: "The Time Is Now Sweatshirt", price: 55, category: "merch", description: "Cozy sweatshirt with 'The Time Is Now' message" },
  { id: 6, name: "Unashamed Tank Top", price: 30, category: "merch", description: "Athletic tank perfect for summer outreach" },
  { id: 7, name: "Bold Faith Cap", price: 25, category: "merch", description: "Structured snapback with 'Bold Faith' embroidery" },
  { id: 8, name: "TTIN Beanie", price: 20, category: "merch", description: "Warm knit beanie with embroidered TTIN logo" },
  { id: 9, name: "TTIN Tote Bag", price: 22, category: "merch", description: "Canvas tote for books and outreach materials" },
  { id: 10, name: "Bold Faith Phone Case", price: 18, category: "merch", description: "Protective phone case with bold faith design" },
  { id: 11, name: "The Time Is Now - Book", price: 25, category: "digital", description: "Complete guide to living an unashamed Christian life" },
  { id: 12, name: "Boldness Devotional (PDF)", price: 12, category: "digital", description: "30-day devotional to build unshakeable courage" },
];

const SymposShop = () => {
  const [filter, setFilter] = useState<"all" | "merch" | "digital">("all");

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
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