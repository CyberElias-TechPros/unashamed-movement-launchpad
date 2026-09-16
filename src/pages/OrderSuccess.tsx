import { useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import EmberGlow from "@/components/cinematic/EmberGlow";
import KineticText from "@/components/cinematic/KineticText";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { trackPurchase } from "@/lib/analytics";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order") || searchParams.get("demo") || "confirmed";
  const totalParam = searchParams.get("total") || "0";

  const clear = useCallback(() => clearCart(), [clearCart]);

  useEffect(() => {
    clear();
    trackPurchase(orderId, Number(totalParam));
  }, [clear, orderId, totalParam]);

  return (
    <Layout>
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-background vignette pt-20">
        <EmberGlow intensity="high" />
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-lg text-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-accent-foreground glow-accent"
            >
              <CheckCircle size={44} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <h1 className="mb-4 font-heading tracking-wide text-foreground">
                <KineticText text="ORDER CONFIRMED" className="text-5xl sm:text-6xl" />
              </h1>
              <p className="mb-2 font-body text-lg text-muted-foreground">
                Thank you for standing with the movement. Your receipt is on its way.
              </p>
              <p className="mb-10 font-body text-sm uppercase tracking-[0.25em] text-accent">
                Reference · {orderId}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/shop">
                  <Button variant="hero" size="lg">
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg">
                    Back Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderSuccess;
