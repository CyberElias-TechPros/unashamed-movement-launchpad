import { Link } from "react-router-dom";
import { Calendar, ShoppingBag, BookOpen, ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import TiltCard from "@/components/TiltCard";
import KineticText from "@/components/cinematic/KineticText";

interface FeaturedItem {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  desc: string;
  link: string;
  label: string;
}

interface FeaturedSectionProps {
  featured: {
    events?: string;
    shop?: string;
    resources?: string;
  };
}

const FeaturedSection = ({ featured }: FeaturedSectionProps) => {
  const items: FeaturedItem[] = [
    {
      icon: <Calendar size={26} />,
      kicker: "Gather",
      title: featured.events || "Upcoming Events",
      desc: "Join us for life-changing events and gatherings designed to strengthen your faith.",
      link: "/events",
      label: "View Events",
    },
    {
      icon: <ShoppingBag size={26} />,
      kicker: "Wear It",
      title: featured.shop || "Shop Merch",
      desc: "Wear your faith boldly. Browse apparel and digital resources built for the streets.",
      link: "/shop",
      label: "Shop Now",
    },
    {
      icon: <BookOpen size={26} />,
      kicker: "Go Deeper",
      title: featured.resources || "Resources",
      desc: "Devotionals, guides, and tools to deepen your walk and sharpen your witness.",
      link: "/resources",
      label: "Explore",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="section-padding">
        <div className="container-custom">
          <div className="mb-14 text-center sm:mb-16">
            <SectionWrapper>
              <div className="mb-5 flex items-center justify-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">Get Involved</p>
                <span className="h-px w-12 bg-accent/70" />
              </div>
              <h2 className="font-heading tracking-wide text-foreground">
                <KineticText text="TAKE YOUR POST" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <SectionWrapper key={item.kicker} delay={i * 0.12}>
                <Link to={item.link} className="group block h-full">
                  <TiltCard className="relative h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-8 transition-all duration-500 group-hover:border-accent/60 group-hover:shadow-[0_20px_60px_-20px_hsl(41_75%_52%/0.25)] sm:p-10">
                    <span className="pointer-events-none absolute -right-6 -top-8 select-none font-heading text-[7rem] leading-none text-foreground/[0.04]" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                      {item.icon}
                    </div>
                    <p className="kicker mb-3">{item.kicker}</p>
                    <h3 className="mb-3 font-heading text-2xl tracking-wider text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mb-8 font-body text-muted-foreground">{item.desc}</p>
                    <span className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                      {item.label}
                      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </TiltCard>
                </Link>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
