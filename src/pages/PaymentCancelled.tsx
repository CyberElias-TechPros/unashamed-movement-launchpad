import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  useEffect(() => {
    document.title = "Payment Cancelled";
  }, []);

  return (
    <Layout>
      <section className="section-padding bg-primary pt-20 min-h-[60vh] flex items-center">
        <div className="container-custom text-center max-w-lg mx-auto">
          <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
          <h1 className="font-heading text-4xl tracking-wider text-primary-foreground mb-4">
            Payment Cancelled
          </h1>
          <p className="text-primary-foreground/70 mb-8">
            Your payment was cancelled. You can return to your cart to try again.
            {orderId && (
              <span className="block mt-2">Order reference: <strong>{orderId}</strong></span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cart">
              <Button variant="hero" size="lg">
                Back to Cart
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="border-primary-foreground/30">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentCancelled;
