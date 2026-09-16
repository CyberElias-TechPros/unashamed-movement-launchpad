import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackPurchase } from "@/lib/analytics";
import { paypalApi } from "@/api/paypal";
import { paystackApi } from "@/api/paystack";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order") || searchParams.get("demo") || "confirmed";
  const totalParam = searchParams.get("total") || "0";
  const isPaypal = searchParams.get("paypal") === "1";
  const paypalToken = searchParams.get("token"); // PayPal appends token & PayerID

  const clear = useCallback(() => clearCart(), [clearCart]);
  const [paypalState, setPaypalState] = useState<"idle" | "confirming" | "done" | "failed">("idle");
  const [cardState, setCardState] = useState<"idle" | "confirming" | "done" | "failed">("idle");

  useEffect(() => {
    clear();
    trackPurchase(orderId, Number(totalParam));
    // PayPal return: capture the approved payment to finish fulfillment
    // (emails + digital downloads). The webhook covers us if this fails.
    // Live mode: PayPal appends token & PayerID. Dev mode: our simulated
    // order id is dev_<our order id>.
    if (isPaypal) {
      const captureId = paypalToken || `dev_${orderId}`;
      setPaypalState("confirming");
      paypalApi
        .capture(captureId)
        .then(() => setPaypalState("done"))
        .catch(() => setPaypalState("failed"));
    } else if (orderId && orderId !== "confirmed") {
      // Card flow (Paystack/Flutterwave/Stripe): the payment provider
      // redirects straight here. In production the webhook settles the
      // order; in dev/test mode (no payment keys configured) the worker's
      // dev-confirm endpoint settles it so the whole flow — order status,
      // stock, emails, digital downloads — completes end to end.
      setCardState("confirming");
      paystackApi
        .devConfirm(orderId)
        .then(() => setCardState("done"))
        .catch(() => setCardState("failed"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <section className="section-padding bg-primary pt-20 min-h-[60vh] flex items-center">
        <div className="container-custom text-center max-w-lg mx-auto">
          {paypalState === "confirming" || cardState === "confirming" ? (
            <Loader2 className="w-20 h-20 text-accent mx-auto mb-6 animate-spin" />
          ) : (
            <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
          )}
          <h1 className="font-heading text-4xl tracking-wider text-primary-foreground mb-4">
            {paypalState === "confirming" || cardState === "confirming"
              ? "Confirming Payment…"
              : "Order Confirmed"}
          </h1>
          {(paypalState === "failed" || cardState === "failed") && (
            <p className="text-amber-300 text-sm mb-4">
              We couldn't confirm your payment just now — no need to worry, the payment provider
              will notify us and you'll receive a confirmation email shortly.
            </p>
          )}
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
