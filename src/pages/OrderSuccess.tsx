import { useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
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
      <section className="section-padding bg-primary pt-20 min-h-[60vh] flex items-center">
        <div className="container-custom text-center max-w-lg mx-auto">
          <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
          <h1 className="font-heading text-4xl tracking-wider text-primary-foreground mb-4">
            Order Confirmed
          </h1>
          <p className="text-primary-foreground/70 mb-8">
            Thank you for supporting The Time Is Now movement. Your order reference is{" "}
            <span className="text-accent font-medium">{orderId}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button variant="hero" size="lg">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="border-primary-foreground/30">
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderSuccess;
