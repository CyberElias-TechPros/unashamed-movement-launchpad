import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { MessageSquare } from "lucide-react";

const TestimonialsSection = () => {
  const [sliderPaused, setSliderPaused] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    "TTIN changed my life. I went from being afraid to share my faith to boldly proclaiming the Gospel everywhere I go.",
    "After watching the plane preaching video, I felt compelled to preach on my bus. Three people accepted Christ that day!",
    "The community here is amazing. I finally found people who understand the urgency of the Gospel.",
    "I never thought I could preach in public, but TTIN gave me the courage and tools I needed.",
    "The resources and testimonies have equipped me to be a bold witness in my workplace.",
    "Because of TTIN, I've seen 15 people come to Christ in my neighborhood this year alone.",
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
