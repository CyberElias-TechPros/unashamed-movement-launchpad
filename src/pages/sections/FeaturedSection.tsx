import SectionWrapper from "@/components/SectionWrapper";
import TiltCard from "@/components/TiltCard";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ShoppingBag, BookOpen } from "lucide-react";

interface FeaturedItem {
  icon: React.ReactNode;
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
      icon: <Calendar size={32} />,
      title: featured.events ? `Next: ${featured.events}` : "Upcoming Events",
      desc: "Join us for life-changing events and gatherings designed to strengthen your faith.",
      link: "/events",
      label: "View Events",
    },
    {
      icon: <ShoppingBag size={32} />,
      title: featured.shop ? `Featured: ${featured.shop}` : "Shop Merch",
      desc: "Wear your faith boldly. Browse our collection of apparel and digital resources.",
      link: "/shop",
      label: "Shop Now",
    },
    {
      icon: <BookOpen size={32} />,
      title: featured.resources ? `New: ${featured.resources}` : "Resources",
      desc: "Access devotionals, guides, and tools to deepen your walk and sharpen your witness.",
      link: "/resources",
      label: "Explore",
    },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground">
              Get Involved
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <SectionWrapper key={item.title} delay={i * 0.15}>
              <Link to={item.link} className="group block">
                <TiltCard className="relative bg-background rounded-2xl p-8 h-full border border-border hover:border-accent transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-2xl tracking-wider text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground mb-6">
                    {item.desc}
                  </p>
                  <span className="font-heading text-lg tracking-wider text-accent group-hover:text-foreground transition-colors inline-flex items-center gap-2">
                    {item.label} <ArrowRight size={16} />
                  </span>
                </TiltCard>
              </Link>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
