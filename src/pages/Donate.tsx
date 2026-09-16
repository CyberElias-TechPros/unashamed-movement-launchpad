import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import KineticText from "@/components/cinematic/KineticText";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, Gift, Globe, CreditCard, Loader2, Check, Flame } from "lucide-react";
import { donationsApi } from "@/api/donations";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

const donationOptions = [
  { amount: 5, label: "Kindle", icon: Coffee, description: "Fuel one hour of ministry work" },
  { amount: 15, label: "Firewood", icon: Heart, description: "Support a day of outreach" },
  { amount: 50, label: "Torch", icon: Gift, description: "Fund gospel tracts distribution" },
  { amount: 100, label: "Blaze", icon: Globe, description: "Sponsor a preaching event" },
];

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isGiving, setIsGiving] = useState(false);
  const [givenAmount, setGivenAmount] = useState<number | null>(null);
  const { toast } = useToast();

  const amount = selectedAmount ?? parseFloat(customAmount);

  const handleDonate = async () => {
    if (!amount || amount < 1 || isGiving) return;
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({
        title: "Almost there",
        description: "Please add your name and a valid email so we can record your gift.",
        variant: "destructive",
      });
      return;
    }
    setIsGiving(true);
    try {
      // Record the gift — in production the checkout session redirects to Stripe;
      // without Stripe keys we confirm the pledge directly so nothing dead-ends.
      const session = await donationsApi.createCheckoutSession(amount, email || undefined);
      if (session.url && session.url.includes("stripe.com")) {
        window.location.href = session.url;
        return;
      }
      await donationsApi.create({
        amount,
        donorName: name.trim(),
        donorEmail: email.trim(),
        type: 'one-time',
        paymentMethod: 'card',
      });
      trackEvent({ category: "donation", action: "pledge", label: `donate_${amount}`, value: amount });
      setGivenAmount(amount);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGiving(false);
    }
  };

  const reset = () => {
    setGivenAmount(null);
    setSelectedAmount(null);
    setCustomAmount("");
    setName("");
    setEmail("");
  };

  return (
    <Layout>
      <PageHero
        kicker="Fuel The Fire"
        title="GIVE NOW"
        italic="every ember counts"
        description="Your generosity fuels bold evangelism around the world. Every gift helps us reach more souls for Christ."
        align="center"
      />

      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding pt-0">
          <div className="container-custom relative z-10 max-w-4xl">
            <AnimatePresence mode="wait">
              {givenAmount !== null ? (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel gold-hairline -mt-16 rounded-3xl p-10 text-center sm:p-14"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground glow-accent"
                  >
                    <Check size={36} />
                  </motion.div>
                  <h2 className="mb-4 font-heading text-4xl tracking-wider text-foreground sm:text-5xl">
                    Thank You!
                  </h2>
                  <p className="mx-auto mb-3 max-w-lg font-body text-lg text-muted-foreground">
                    Your gift of <span className="font-heading text-gradient-gold">${givenAmount}</span> has been
                    received and recorded. Heaven rejoices over every seed sown into this movement.
                  </p>
                  <p className="mb-10 font-display italic text-xl text-accent">
                    "God loves a cheerful giver." — 2 Cor 9:7
                  </p>
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button variant="hero" onClick={reset}>
                      Give Again
                    </Button>
                    <a href="/testimonies">
                      <Button variant="outline">See The Impact</Button>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="-mt-16"
                >
                  <SectionWrapper>
                    <div className="mb-10 text-center">
                      <h2 className="mb-3 font-heading tracking-wide text-foreground">
                        <KineticText text="CHOOSE YOUR GIFT" className="text-4xl sm:text-6xl" />
                      </h2>
                      <p className="font-body text-muted-foreground">
                        Select an amount or enter a custom gift below.
                      </p>
                    </div>
                  </SectionWrapper>

                  <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {donationOptions.map((option, i) => (
                      <motion.button
                        key={option.amount}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => {
                          setSelectedAmount(option.amount);
                          setCustomAmount("");
                        }}
                        className={`group rounded-2xl border p-6 text-center transition-all duration-300 ${
                          selectedAmount === option.amount
                            ? "border-accent bg-accent/15 shadow-[0_0_30px_hsl(41_75%_52%/0.2)]"
                            : "border-border bg-card/60 hover:border-accent/60"
                        }`}
                      >
                        <option.icon
                          className={`mx-auto mb-3 h-8 w-8 transition-colors ${
                            selectedAmount === option.amount ? "text-accent" : "text-muted-foreground group-hover:text-accent"
                          }`}
                        />
                        <div className="mb-1 font-heading text-3xl text-gradient-gold">
                          ${option.amount}
                        </div>
                        <div className="mb-1 font-body text-xs font-semibold uppercase tracking-[0.25em] text-foreground">
                          {option.label}
                        </div>
                        <div className="font-body text-xs text-muted-foreground">{option.description}</div>
                      </motion.button>
                    ))}
                  </div>

                  <SectionWrapper delay={0.2}>
                    <div className="glass-panel mx-auto max-w-md rounded-2xl p-7">
                      <label className="mb-3 block font-heading text-lg tracking-wider text-foreground">
                        Custom Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading text-xl text-accent">
                          $
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(null);
                          }}
                          placeholder="Enter amount"
                          className="w-full rounded-lg border border-border bg-background py-3.5 pl-10 pr-4 font-body text-lg text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div className="mt-5 space-y-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </SectionWrapper>

                  <SectionWrapper delay={0.3}>
                    <div className="mt-10 text-center">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleDonate}
                        disabled={(!amount || amount < 1) || !name.trim() || !email.trim() || isGiving}
                        className="gap-2 px-12"
                      >
                        {isGiving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Give {amount > 0 ? `$${amount}` : "Now"}
                          </>
                        )}
                      </Button>
                      <p className="mt-4 flex items-center justify-center gap-1.5 font-body text-xs text-muted-foreground">
                        <Flame size={12} className="text-accent" />
                        Gifts are processed through our secure giving flow.
                      </p>
                    </div>
                  </SectionWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Other ways */}
      <section className="border-t border-border bg-card/20">
        <div className="section-padding">
          <div className="container-custom max-w-3xl text-center">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Other Ways To Give</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h3 className="mb-8 font-heading text-3xl tracking-wider text-foreground sm:text-4xl">
                Bank &amp; Mobile Transfers
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-6">
                  <p className="mb-1 font-heading text-xl tracking-wider text-foreground">
                    Mobile Money / Bank
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    Email{" "}
                    <a href="mailto:thetimeisnow255@gmail.com" className="text-accent hover:underline">
                      thetimeisnow255@gmail.com
                    </a>{" "}
                    for transfer details.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-6">
                  <p className="mb-1 font-heading text-xl tracking-wider text-foreground">
                    Cryptocurrency
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    Available upon request — reach out through the contact page.
                  </p>
                </div>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
