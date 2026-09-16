import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Coffee, Gift, Globe, CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { donationsApi } from "@/api/donations";
import { paypalApi } from "@/api/paypal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { formatCurrency, currencySymbol, SUPPORTED_CURRENCIES } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const donationOptions = [
  { amount: 5, label: "Coffee", icon: Coffee, description: "Fuel one hour of ministry work" },
  { amount: 15, label: "Meal", icon: Heart, description: "Support a day of outreach" },
  { amount: 50, label: "Bible", icon: Gift, description: "Help fund gospel tracts distribution" },
  { amount: 100, label: "Event", icon: Globe, description: "Sponsor a preaching event" },
];

type PaymentMethod = "paypal" | "stripe" | "paystack" | "flutterwave";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  paypal: "PayPal",
  stripe: "Stripe",
  paystack: "Paystack",
  flutterwave: "Flutterwave",
};

const Donate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal"); // PayPal is the primary option
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(searchParams.get("status"));
  const paypalToken = searchParams.get("token"); // PayPal appends token & PayerID on return
  const [confirming, setConfirming] = useState(
    searchParams.get("status") === "paypal-return" && Boolean(paypalToken)
  );

  // PayPal return: capture the approved payment server-side, then celebrate.
  // Live mode: PayPal appends token & PayerID. Dev mode: our simulated order
  // id is dev_<donation id> (the return URL carries the donation id).
  useEffect(() => {
    if (status !== "paypal-return") return;
    const donationId = searchParams.get("donation");
    const captureId = paypalToken || (donationId ? `dev_${donationId}` : "");
    setConfirming(true);
    if (!captureId) {
      setConfirming(false);
      setStatus("cancelled");
      return;
    }
    paypalApi
      .capture(captureId)
      .catch(() => undefined) // webhook settles as a safety net either way
      .finally(() => {
        setConfirming(false);
        setStatus("success");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill for signed-in users.
  useEffect(() => {
    if (user) {
      setDonorName(user.name || "");
      setDonorEmail(user.email);
    }
  }, [user]);

  const amount = selectedAmount || parseFloat(customAmount) || 0;

  // Currency-aware presets: keep the same "size" of gift per currency.
  const presets: Record<string, number[]> = {
    USD: [5, 15, 50, 100],
    EUR: [5, 15, 50, 100],
    GBP: [5, 10, 40, 80],
    NGN: [2000, 5000, 20000, 50000],
  };
  const currentPresets = presets[currency] || presets.USD;

  const handleDonate = async () => {
    if (!amount || amount < 1) {
      toast({ title: "Choose an amount", description: "Select a preset or enter a custom amount.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await donationsApi.checkout({
        amount,
        currency,
        paymentMethod,
        email: donorEmail || undefined,
        donorName: anonymous ? "Anonymous" : donorName || "Anonymous",
        message: message || undefined,
        isAnonymous: anonymous,
      });

      if (paymentMethod === "paypal") {
        if (currency === "NGN") {
          throw new Error("PayPal doesn't support Naira (₦) — please choose Paystack or Flutterwave.");
        }
        const pp = await paypalApi.createOrder({ donationId: res.donationId, currency });
        if (!pp.approveUrl) throw new Error(pp.message || "PayPal checkout failed");
        window.location.href = pp.approveUrl; // dev mode: lands back on /donate success
        return;
      }

      if (res.url) {
        if (res.devMode) {
          // Dev mode: no real gateway — land on the success screen directly.
          setStatus("success");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.location.href = res.url;
        }
      } else {
        throw new Error("Could not start the payment. Please try again.");
      }
    } catch (err) {
      toast({
        title: "Donation failed",
        description: (err as { message?: string })?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO title="Donate" description="Support bold evangelism around the world — give securely by card via Stripe, Paystack or Flutterwave." />
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={15} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Support the Mission
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Give Now
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              Your generosity fuels bold evangelism around the world.
              Every gift helps us reach more souls for Christ.
            </p>
          </motion.div>
        </div>
      </section>

      {confirming && (
        <section className="pt-10">
          <div className="container-custom max-w-xl">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
              <Loader2 className="w-10 h-10 text-accent mx-auto mb-3 animate-spin" />
              <p className="font-medium">Confirming your gift with PayPal…</p>
            </div>
          </div>
        </section>
      )}
      {status === "success" && (
        <section className="pt-10">
          <div className="container-custom max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h2 className="font-heading text-2xl mb-2">Thank you for your gift! 💛</h2>
              <p className="text-muted-foreground">
                A receipt is on its way to your email. Your seed helps take the gospel further.
              </p>
            </motion.div>
          </div>
        </section>
      )}
      {status === "cancelled" && (
        <section className="pt-10">
          <div className="container-custom max-w-xl">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
              <XCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h2 className="font-heading text-2xl mb-2">Donation cancelled</h2>
              <p className="text-muted-foreground">
                No charge was made. If this was a mistake, you can try again below.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <SectionWrapper>
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl tracking-wider text-foreground mb-4">
                Choose Your Gift
              </h2>
              <p className="font-body text-muted-foreground">
                Select an amount or enter a custom donation
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {donationOptions.map((option, i) => (
              <SectionWrapper key={option.label} delay={i * 0.05}>
                <button
                  onClick={() => {
                    setSelectedAmount(currentPresets[i]);
                    setCustomAmount("");
                  }}
                  className={`w-full p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    selectedAmount === currentPresets[i]
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border hover:border-accent"
                  }`}
                >
                  <option.icon className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-heading text-2xl mb-1">
                    {formatCurrency(currentPresets[i], currency)}
                  </div>
                  <div className="font-body text-sm">{option.description}</div>
                </button>
              </SectionWrapper>
            ))}
          </div>

          <SectionWrapper delay={0.2}>
            <div className="bg-card rounded-2xl p-8 border border-border max-w-xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donate-amount" className="block font-heading text-lg mb-3">
                    Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                      {currencySymbol(currency)}
                    </span>
                    <input
                      id="donate-amount"
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 text-lg border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="donate-currency" className="block font-heading text-lg mb-3">
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onValueChange={(v) => {
                      setCurrency(v);
                      setSelectedAmount(null);
                      if (v === "NGN" && paymentMethod === "paypal") setPaymentMethod("paystack");
                    }}
                  >
                    <SelectTrigger id="donate-currency" className="h-[50px] text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-name" className="font-body text-sm mb-1.5 block">Name</label>
                  <Input
                    id="donor-name"
                    placeholder="Your name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={anonymous}
                  />
                </div>
                <div>
                  <label htmlFor="donor-email" className="font-body text-sm mb-1.5 block">
                    Email <span className="text-muted-foreground">(for your receipt)</span>
                  </label>
                  <Input
                    id="donor-email"
                    type="email"
                    placeholder="you@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="donor-message" className="font-body text-sm mb-1.5 block">
                  Message <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="donor-message"
                  placeholder="Say a word with your gift…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded"
                />
                Give anonymously
              </label>

              <div>
                <p className="font-body text-sm mb-2">Pay with</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Payment method">
                  {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => {
                    const unsupported = m === "paypal" && currency === "NGN";
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={paymentMethod === m}
                        disabled={unsupported}
                        onClick={() => setPaymentMethod(m)}
                        title={unsupported ? "PayPal doesn't support NGN" : undefined}
                        className={`relative py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          unsupported
                            ? "opacity-40 cursor-not-allowed bg-background border-border"
                            : paymentMethod === m
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary"
                        }`}
                      >
                        {m === "paypal" && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                        {METHOD_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
                {currency === "NGN" && (
                  <p className="text-xs text-muted-foreground">
                    PayPal doesn't support Naira — Paystack and Flutterwave do.
                  </p>
                )}
              </div>

              <Button
                size="lg"
                onClick={handleDonate}
                disabled={!amount || amount < 1 || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Starting…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Donate {formatCurrency(amount, currency)}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Secure checkout via {METHOD_LABELS[paymentMethod]}.
                See our <a href="/refunds" className="text-accent hover:underline">donation policy</a>.
              </p>
            </div>
          </SectionWrapper>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom max-w-3xl text-center">
          <SectionWrapper>
            <h3 className="font-heading text-2xl tracking-wider mb-6">Other Ways to Give</h3>
            <div className="space-y-4">
              <div>
                <p className="font-body text-muted-foreground">
                  Mobile Money / Bank Transfer: Contact us via email for details
                </p>
              </div>
              <div>
                <p className="font-body text-muted-foreground">
                  Cryptocurrency: Available upon request
                </p>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
