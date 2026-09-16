import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { MessageSquare } from "lucide-react";

const TestimonialsSection = () => {
  const [sliderPaused, setSliderPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    "I and my friends started preaching from dorm to dorm, room to room. We preached in 594 rooms, winning over 150 souls to Christ.",
    "Today I preached on the train. All of your videos broke it down and highlighted how easy and important it is to preach open air.",
    "I finally preached on the plane! Everyone listened quietly until I finished, and at the gate a woman waited just to thank me.",
    "Half the plane literally started clapping at the end — this is the first time I could audibly hear people saying the prayer of salvation after me.",
    "I just finished preaching to an uber driver and the Holy Spirit was heavily present. He said goosebumps came over his body.",
    "After I shared the gospel open air, a man took me to his workplace and I led 18+ people in the prayer of salvation.",
  ];

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Real Stories
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
              Lives Transformed
            </h2>
            <p className="font-body text-muted-foreground text-xl max-w-3xl mx-auto">
              Hear from people who have been impacted by the movement
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <div
            className="relative"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
          >
            <div className="overflow-x-auto pb-8 hide-scrollbar">
              <div className={`flex gap-6 animate-scroll ${sliderPaused ? "paused" : ""}`}>
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index % testimonials.length) * 0.1 }}
                    className="flex-shrink-0 w-[350px] md:w-[400px]"
                  >
                    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border h-full">
                      <div className="flex items-start gap-3 mb-4">
                        <MessageSquare className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="font-body text-muted-foreground text-xs uppercase tracking-wider">
                          #{index + 1}
                        </p>
                      </div>
                      <p className="font-body text-foreground text-base leading-relaxed mb-4 line-clamp-4">
                        "{testimonial}"
                      </p>
                      <p className="font-heading text-accent text-sm">
                        — TTIN Community
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${activeSlide === i ? "bg-accent" : "bg-accent/30"}`}
                />
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
