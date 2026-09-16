import SectionWrapper from "@/components/SectionWrapper";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Users, Globe, MessageSquare, Heart, Eye, MessagesSquare } from "lucide-react";

const ImpactSection = () => {
  const stats = [
    { end: 150, suffix: "+", label: "People Preached Open Air", icon: <Users className="w-6 h-6" /> },
    { end: 33, suffix: "", label: "Countries Reached", icon: <Globe className="w-6 h-6" /> },
    { end: 1200, suffix: "+", label: "Community Members", icon: <Users className="w-6 h-6" /> },
    { end: 45, suffix: "+", label: "Volunteers", icon: <Heart className="w-6 h-6" /> },
    { end: 20, suffix: "M+", label: "Social Media Views", icon: <Eye className="w-6 h-6" /> },
    { end: 800, suffix: "+", label: "Gospel Conversations Started", icon: <MessagesSquare className="w-6 h-6" /> },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              By The Numbers
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
              Our Impact
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto">
              From bus stops to airplanes, the Gospel is reaching the unreached. Every number
              represents a life touched, a soul awakened, and a believer unleashed.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <SectionWrapper key={stat.label} delay={index * 0.1}>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-accent-foreground mb-4 mx-auto">
                  {stat.icon}
                </div>
                <div className="font-heading text-4xl lg:text-5xl text-accent mb-2">
                  <AnimatedCounter
                    end={stat.end}
                    suffix={stat.suffix}
                    className="font-heading text-4xl lg:text-5xl text-accent"
                  />
                </div>
                <div className="font-body text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
