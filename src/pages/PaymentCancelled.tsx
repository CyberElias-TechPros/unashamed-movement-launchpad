import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <Layout>
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-background vignette pt-20">
        <EmberGlow intensity="medium" />
        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-lg text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
            >
              <XCircle size={44} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <h1 className="mb-4 font-heading text-5xl tracking-wider text-foreground sm:text-6xl">
                Payment Cancelled
              </h1>
              <p className="mb-2 font-body text-lg text-muted-foreground">
                No charge was made. Your items are still waiting in your cart whenever you're ready.
              </p>
              {orderId && (
                <p className="mb-4 font-body text-sm uppercase tracking-[0.25em] text-accent">
                  Order ref · {orderId}
                </p>
              )}
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/cart">
                  <Button variant="hero" size="lg">
                    Back to Cart
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" size="lg">
                    Keep Browsing
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

export default PaymentCancelled;
