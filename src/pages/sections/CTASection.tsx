import SectionWrapper from "@/components/SectionWrapper";
import MagneticButton from "@/components/MagneticButton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-primary">
      <div className="container-custom text-center">
        <SectionWrapper>
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Take Action
          </p>
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-wider text-primary-foreground mb-6">
            Join the Movement
          </h2>
          <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-10">
            Stop hiding your light. The world needs what you carry. Get updates, resources,
            and join a community of fearless believers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton>
              <a href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="lg" className="px-10">
                  Join the Movement <ArrowRight className="ml-2" size={18} />
                </Button>
              </a>
            </MagneticButton>
            <MagneticButton>
              <Link to="/donate">
                <Button variant="brand" size="lg" className="px-10">
                  Give Now
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
};

export default CTASection;
