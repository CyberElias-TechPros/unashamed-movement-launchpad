import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, Gift, Globe, CreditCard } from "lucide-react";

const donationOptions = [
  { amount: 5, label: "Coffee", icon: Coffee, description: "Fuel one hour of ministry work" },
  { amount: 15, label: "Meal", icon: Heart, description: "Support a day of outreach" },
  { amount: 50, label: "Bible", icon: Gift, description: "Help fund gospel tracts distribution" },
  { amount: 100, label: "Event", icon: Globe, description: "Sponsor a preaching event" },
];

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 1) return;
    window.open(`https://paystack.com/pay/ttin-donate?amount=${amount * 100}`, "_blank");
  };

  return (
    <Layout>
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

      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <SectionWrapper>
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl tracking-wider text-foreground mb-4">
                Choose Your Gift
              </h2>
              <p className="font-body text-muted-foreground">
                Select an amount or enter a custom donation
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {donationOptions.map((option) => (
              <SectionWrapper key={option.amount}>
                <button
                  onClick={() => {
                    setSelectedAmount(option.amount);
                    setCustomAmount("");
                  }}
                  className={`w-full p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    selectedAmount === option.amount
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border hover:border-accent"
                  }`}
                >
                  <option.icon className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-heading text-2xl mb-1">${option.amount}</div>
                  <div className="font-body text-sm">{option.description}</div>
                </button>
              </SectionWrapper>
            ))}
          </div>

          <SectionWrapper delay={0.3}>
            <div className="bg-card rounded-2xl p-8 border border-border max-w-md mx-auto">
              <label className="block font-heading text-lg mb-3">Custom Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">$</span>
                <input
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
          </SectionWrapper>

          <SectionWrapper delay={0.4}>
            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={handleDonate}
                disabled={!selectedAmount && !customAmount}
                className="px-12"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Donate with Paystack
              </Button>
            </div>
          </SectionWrapper>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom max-w-3xl text-center">
          <SectionWrapper>
            <h3 className="font-heading text-2xl tracking-wider mb-6">
              Other Ways to Give
            </h3>
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