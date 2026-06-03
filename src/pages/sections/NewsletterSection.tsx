import { useState, FormEvent } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { newsletterApi } from "@/api/newsletter";

interface NewsletterSectionProps {
  email: string;
  isSubscribing: boolean;
  onSubscribe: (e: FormEvent) => Promise<void>;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewsletterSection = ({ email, isSubscribing, onSubscribe, onEmailChange }: NewsletterSectionProps) => {
  return (
    <section className="section-padding bg-accent">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <SectionWrapper>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-accent-foreground mb-6">
              Stay Connected
            </h2>
            <p className="font-body text-accent-foreground/80 text-xl mb-8">
              Get the latest updates, testimonies, and resources delivered to your inbox
            </p>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <form onSubmit={onSubscribe} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-accent-foreground/20 text-accent-foreground placeholder:text-accent-foreground/50 h-12"
                  value={email}
                  onChange={onEmailChange}
                  disabled={isSubscribing}
                  required
                />
              </div>
              <Button type="submit" className="bg-accent-foreground hover:bg-accent-foreground/90 text-accent px-8 h-12" disabled={isSubscribing}>
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
