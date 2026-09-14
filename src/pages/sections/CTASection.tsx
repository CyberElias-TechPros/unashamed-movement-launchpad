import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import MagneticButton from "@/components/MagneticButton";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-primary vignette">
      <EmberGlow intensity="high" />
      <div className="section-padding relative">
        <div className="container-custom text-center">
          <SectionWrapper>
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-accent/70" />
              <p className="kicker">Your Move</p>
              <span className="h-px w-12 bg-accent/70" />
            </div>
            <h2 className="mx-auto max-w-5xl font-heading leading-[0.95] tracking-wide text-primary-foreground">
              <KineticText text="READY TO BE" className="text-5xl sm:text-7xl lg:text-8xl" />
              <span className="block font-display italic font-normal text-gradient-gold text-5xl sm:text-7xl lg:text-8xl">
                bold?
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl font-body text-lg sm:text-xl text-muted-foreground">
              Stop hiding your light. The world needs what you carry.
              Join a community of fearless believers today.
            </p>
          </SectionWrapper>

          <SectionWrapper delay={0.2} className="mt-12">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 rounded-full border border-foreground/25 px-9 py-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-foreground/85 transition-all duration-300 hover:border-accent hover:text-accent"
                >
                  Learn More
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a
                  href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-accent px-9 py-4 font-heading text-lg tracking-[0.15em] text-accent-foreground transition-all duration-300 hover:glow-accent"
                >
                  Join Our Community
                  <ArrowRight size={19} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </MagneticButton>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
