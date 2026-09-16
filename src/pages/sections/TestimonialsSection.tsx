import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Quote } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import KineticText from "@/components/cinematic/KineticText";
import { testimonialsApi, Testimonial } from "@/api/testimonials";

const fallback: Testimonial[] = [
  { name: "James O.", location: "Nigeria", text: "TTIN changed my life. I went from being afraid to share my faith to boldly proclaiming the Gospel everywhere I go.", category: "Evangelism" },
  { name: "Sarah M.", location: "United Kingdom", text: "After watching the plane preaching video, I felt compelled to preach on my bus. Three people accepted Christ that day.", category: "Boldness" },
  { name: "David K.", location: "Kenya", text: "The community here is amazing. I finally found people who understand the urgency of the Gospel.", category: "Community" },
  { name: "Elena R.", location: "Spain", text: "I never thought I could preach in public, but TTIN gave me the courage and tools I needed.", category: "Courage" },
  { name: "Michael T.", location: "United States", text: "The resources and testimonies have equipped me to be a bold witness in my workplace.", category: "Workplace" },
  { name: "Grace A.", location: "Ghana", text: "Because of TTIN, I've seen 15 people come to Christ in my neighborhood this year alone.", category: "Harvest" },
];

const TestimonialsSection = () => {
  const [paused, setPaused] = useState(false);

  const { data } = useQuery({
    queryKey: ["testimonies", "approved-rail"],
    queryFn: async () => {
      try {
        const res = await testimonialsApi.getAll({ limit: 12 });
        const list = Array.isArray(res) ? res : res.data || [];
        return list.length ? list : fallback;
      } catch {
        return fallback;
      }
    },
  });

  const testimonials = (data && data.length ? data : fallback).slice(0, 12);
  const rail = [...testimonials, ...testimonials];

  return (
    <section className="relative overflow-hidden border-y border-border bg-card/20">
      <div className="section-padding">
        <div className="container-custom">
          <div className="mb-14 grid gap-6 sm:mb-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SectionWrapper>
                <div className="mb-5 flex items-center gap-4">
                  <span className="h-px w-12 bg-accent/70" />
                  <p className="kicker">Real Stories</p>
                </div>
                <h2 className="font-heading leading-[0.95] tracking-wide text-foreground">
                  <KineticText text="LIVES SET" className="text-5xl sm:text-7xl lg:text-8xl" />
                  <span className="block font-display italic font-normal text-gradient-gold text-4xl sm:text-6xl lg:text-7xl">
                    ablaze
                  </span>
                </h2>
              </SectionWrapper>
            </div>
            <SectionWrapper delay={0.15} className="lg:col-span-4">
              <Link
                to="/testimonies"
                className="group inline-flex items-center gap-3 font-body text-sm font-semibold uppercase tracking-[0.25em] text-accent lg:float-right"
              >
                Share yours
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </SectionWrapper>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className={`flex gap-6 animate-scroll ${paused ? "paused" : ""}`}>
              {rail.map((t, index) => (
                <div
                  key={`${t.name}-${index}`}
                  className="w-[320px] flex-shrink-0 sm:w-[420px]"
                >
                  <div className="group relative h-full rounded-2xl border border-border bg-background p-7 transition-all duration-500 hover:border-accent/50 hover:bg-card sm:p-8">
                    <Quote size={36} className="mb-5 text-accent/60 transition-colors group-hover:text-accent" />
                    <p className="mb-6 font-body text-base sm:text-lg leading-relaxed text-foreground/90 line-clamp-5">
                      "{t.text}"
                    </p>
                    <div className="mt-auto flex items-end justify-between border-t border-border pt-5">
                      <div>
                        <p className="font-heading text-lg tracking-wider text-foreground">{t.name}</p>
                        <p className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                      {t.category && (
                        <span className="font-body text-[10px] uppercase tracking-[0.25em] text-accent/80">
                          {t.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
