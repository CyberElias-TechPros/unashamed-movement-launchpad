import { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSectionProps {
  email: string;
  isSubscribing: boolean;
  onSubscribe: (e: FormEvent) => Promise<void>;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewsletterSection = ({ email, isSubscribing, onSubscribe, onEmailChange }: NewsletterSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-accent">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "repeating-linear-gradient(-45deg, hsl(30 14% 5%) 0 1px, transparent 1px 14px)",
        }}
        aria-hidden="true"
      />
      <div className="section-padding relative">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <SectionWrapper>
              <p className="font-body text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-accent-foreground/70 mb-4">
                The Dispatch
              </p>
              <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl tracking-wider leading-[0.95] text-accent-foreground mb-5">
                Never Miss a move
              </h2>
              <p className="font-body text-accent-foreground/85 text-lg sm:text-xl mb-10">
                Testimonies, drops, and gathering dates — delivered straight to your inbox.
              </p>
            </SectionWrapper>

            <SectionWrapper delay={0.15}>
              <form onSubmit={onSubscribe} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="you@burningheart.com"
                    className="h-14 rounded-full border-accent-foreground/25 bg-accent-foreground/10 px-6 text-accent-foreground placeholder:text-accent-foreground/50 focus-visible:ring-accent-foreground/40"
                    value={email}
                    onChange={onEmailChange}
                    disabled={isSubscribing}
                    required
                    aria-label="Email address"
                  />
                </div>
                <Button
                  type="submit"
                  className="group h-14 rounded-full bg-accent-foreground px-8 font-heading text-lg tracking-[0.15em] text-accent hover:bg-accent-foreground/90"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? "Joining…" : "Join the List"}
                  <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </form>
              <p className="mt-4 font-body text-xs uppercase tracking-[0.25em] text-accent-foreground/60">
                No noise. Only fire.
              </p>
            </SectionWrapper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
