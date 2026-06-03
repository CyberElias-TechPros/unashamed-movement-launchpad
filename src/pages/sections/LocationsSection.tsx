import SectionWrapper from "@/components/SectionWrapper";
import { MapPin } from "lucide-react";

const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];

const LocationsSection = () => {
  return (
    <section className="section-padding bg-primary">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Where We Preach
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
              Bold Everywhere
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
              From buses to airplanes, we're taking the Gospel to every corner of society
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {preachingLocations.map((location, index) => (
            <SectionWrapper key={location} delay={index * 0.05}>
              <div className="bg-card rounded-xl p-6 text-center border border-primary-foreground/20 hover:border-accent transition-colors">
                <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                <p className="font-heading text-foreground">{location}</p>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
