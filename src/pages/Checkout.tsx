import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2, CreditCard } from "lucide-react";
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
        e.errors.forEach(err => {
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

      const stockError = stockResults.find(r => r?.error);
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
          throw new Error(paystackRes.message || 'Paystack initialization failed');
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
          throw new Error(flutterwaveRes.message || 'Flutterwave initialization failed');
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
          throw new Error(stripeRes.message || 'Stripe session creation failed');
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

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding bg-primary pt-20">
          <div className="container-custom text-center">
            <ShoppingBag className="w-24 h-24 text-accent mx-auto mb-6" />
            <h1 className="font-heading text-4xl sm:text-6xl tracking-wider text-primary-foreground mb-6">
              Empty Cart
            </h1>
            <Link to="/cart">
              <Button variant="hero" size="lg">
                Back to Cart
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-primary pt-20">
        <div className="container-custom">
          <Link to="/cart" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-6">
            <ArrowLeft size={18} /> Back to Cart
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Checkout
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl tracking-wider text-primary-foreground mb-6">
              Payment Details
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.form
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {paymentError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {paymentError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm mb-2 block">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-sm mb-2 block">Address</label>
                <Input
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm mb-2 block">City</label>
                  <Input
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm mb-2 block">State</label>
                  <Input
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm mb-2 block">ZIP Code</label>
                  <Input
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm mb-2 block">Country</label>
                  <Input
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>

<div>
                 <label className="font-body text-sm mb-2 block">Payment Method</label>
                 <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                   <SelectTrigger>
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
                 <label className="font-body text-sm mb-2 block">Currency</label>
                 <Select value={currency} onValueChange={setCurrency}>
                   <SelectTrigger>
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

              <Button type="submit" variant="hero" size="lg" disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay with ${paymentMethod === "paystack" ? "Paystack" : paymentMethod === "flutterwave" ? "Flutterwave" : "Stripe"} $${total.toFixed(2)}`
                )}
              </Button>
              <div className="text-xs text-muted-foreground mt-2">
                Pay with {paymentMethod === "paystack" ? "Paystack" : paymentMethod === "flutterwave" ? "Flutterwave" : "Stripe"}
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h3 className="font-heading text-xl tracking-wider mb-6">Order Summary</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div>
                      <p className="font-body font-medium">{item.name}</p>
                      <p className="font-body text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Subtotal</span>
                    <span className="font-body">${(total * 0.92).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Tax</span>
                    <span className="font-body">${(total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-heading text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;