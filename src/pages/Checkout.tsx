import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2, CreditCard, Lock } from "lucide-react";
import { paystackApi } from "@/api/paystack";
import { flutterwaveApi } from "@/api/flutterwave";
import { stripeApi } from "@/api/stripe";
import { ordersApi } from "@/api/orders";
import { productsApi } from "@/api/products";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type PaymentMethod = "paystack" | "flutterwave" | "stripe";

const paymentLabels: Record<PaymentMethod, string> = {
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  stripe: "Stripe",
};

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [currency, setCurrency] = useState("USD");
  const [formData, setFormData] = useState<CheckoutForm>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateForm = () => {
    try {
      checkoutSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CheckoutForm, string>> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as keyof CheckoutForm] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const stockResults = await Promise.all(
        items.map(async (item) => {
          const product = await productsApi.getById(item.productId);
          if (product.stock != null && product.stock < item.quantity) {
            return { error: `${item.name} only has ${product.stock} in stock.` } as const;
          }
          return null;
        })
      );

      const stockError = stockResults.find((r) => r?.error);
      if (stockError) {
        toast({
          title: "Stock unavailable",
          description: stockError.error,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        items: items.map((item) => ({
          product: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        paymentMethod,
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      const response = await ordersApi.checkout(orderPayload);
      const orderId = response.orderId;
      const successUrl = `${window.location.origin}/order-success?order=${orderId}&total=${total}`;
      const cancelUrl = `${window.location.origin}/payment-cancelled?order=${orderId}`;

      const customerInfo = {
        email: formData.email,
        name: formData.name,
        amount: total * 100,
        ref: orderId,
        currency,
      };

      if (paymentMethod === "paystack") {
        const paystackRes = await paystackApi.initialize({
          ...customerInfo,
          orderId,
          callback_url: successUrl,
        });

        if (!paystackRes.status || !paystackRes.data?.authorization_url) {
          throw new Error(paystackRes.message || "Paystack initialization failed");
        }

        window.location.href = paystackRes.data.authorization_url;
        return;
      } else if (paymentMethod === "flutterwave") {
        const flutterwaveRes = await flutterwaveApi.initialize({
          email: customerInfo.email,
          amount: customerInfo.amount / 100,
          name: customerInfo.name,
          tx_ref: customerInfo.ref,
          redirect_url: cancelUrl,
          currency,
          orderId,
        });

        if (!flutterwaveRes.status || !flutterwaveRes.data?.authorization_url) {
          throw new Error(flutterwaveRes.message || "Flutterwave initialization failed");
        }

        window.location.href = flutterwaveRes.data.authorization_url;
        return;
      } else if (paymentMethod === "stripe") {
        const cartItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
        const stripeRes = await stripeApi.createSession({
          email: customerInfo.email,
          items: cartItems,
          successUrl,
          cancelUrl,
          currency,
          orderId,
        });

        if (!stripeRes.url) {
          throw new Error(stripeRes.message || "Stripe session creation failed");
        }

        window.location.href = stripeRes.url;
        return;
      }

      window.location.href = successUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment initialization failed. Please try again.";
      setPaymentError(message);
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fieldClass = "h-12 rounded-lg border-border bg-card font-body text-foreground placeholder:text-muted-foreground/50 focus-visible:border-accent";
  const errText = (key: keyof CheckoutForm) =>
    errors[key] ? <p className="mt-1 font-body text-xs text-destructive">{errors[key]}</p> : null;

  if (items.length === 0) {
    return (
      <Layout>
        <section className="relative overflow-hidden bg-background">
          <EmberGlow intensity="low" />
          <div className="section-padding">
            <div className="container-custom py-16 text-center">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                <ShoppingBag size={40} className="text-muted-foreground" />
              </div>
              <h1 className="mb-8 font-heading text-5xl tracking-wider text-foreground">
                Nothing To Check Out
              </h1>
              <Link to="/cart">
                <Button variant="hero" size="lg">
                  Back to Cart
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        kicker="Almost There"
        title="CHECKOUT"
        italic="secure & simple"
      />

      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding pt-4">
          <div className="container-custom">
            <Link
              to="/cart"
              className="mb-10 inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} /> Back to Cart
            </Link>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.form
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit}
                className="glass-panel space-y-6 rounded-2xl p-6 sm:p-8"
              >
                {paymentError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 font-body text-sm text-destructive">
                    {paymentError}
                  </div>
                )}

                <div>
                  <h2 className="mb-2 font-heading text-2xl tracking-wider text-foreground">
                    Shipping Details
                  </h2>
                  <p className="mb-6 font-body text-sm text-muted-foreground">
                    Where should we send your order?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("name")}
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("email")}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-body text-sm text-muted-foreground">Address</label>
                  <Input
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className={fieldClass}
                  />
                  {errText("address")}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">City</label>
                    <Input
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("city")}
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">State</label>
                    <Input
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("state")}
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">ZIP Code</label>
                    <Input
                      placeholder="10001"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("zipCode")}
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-sm text-muted-foreground">Country</label>
                    <Input
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className={fieldClass}
                    />
                    {errText("country")}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h2 className="mb-2 flex items-center gap-2 font-heading text-2xl tracking-wider text-foreground">
                    <CreditCard size={20} className="text-accent" /> Payment
                  </h2>
                  <p className="mb-6 font-body text-sm text-muted-foreground">
                    Choose how you'd like to complete your order.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-body text-sm text-muted-foreground">Payment Method</label>
                      <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                        <SelectTrigger className="h-12 border-border bg-card">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paystack">Paystack</SelectItem>
                          <SelectItem value="flutterwave">Flutterwave</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block font-body text-sm text-muted-foreground">Currency</label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-12 border-border bg-card">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Pay with {paymentLabels[paymentMethod]} ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="glass-panel h-fit rounded-2xl p-6 sm:p-8 lg:sticky lg:top-28"
              >
                <h3 className="mb-6 font-heading text-2xl tracking-wider">Order Summary</h3>
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-black/30">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-heading text-[10px] tracking-widest text-gradient-gold">TTIN</span>
                          )}
                        </div>
                        <div>
                          <p className="font-body font-medium text-foreground">{item.name}</p>
                          <p className="font-body text-sm text-muted-foreground">
                            Qty: {item.quantity}
                            {item.variant?.size ? ` · ${item.variant.size}` : ""}
                          </p>
                        </div>
                      </div>
                      <p className="font-body text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${(total * 0.92).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-body">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${(total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 font-heading text-xl tracking-wider">
                      <span>Total</span>
                      <span className="text-gradient-gold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
