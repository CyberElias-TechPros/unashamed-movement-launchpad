import SectionWrapper from "@/components/SectionWrapper";

const CountriesSection = () => {
  const countries = [
    "Canada", "United States", "United Kingdom", "Australia", "Nigeria", "Hungary",
    "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi",
    "Cameroon", "Poland", "Spain",
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Global Reach
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
              Countries Reached
            </h2>
          </div>
        </SectionWrapper>

        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {countries.map((country) => (
            <span
              key={country}
              className="px-4 py-2 bg-accent/10 text-accent rounded-full font-body border border-accent/20 hover:bg-accent/20 transition-colors"
            >
              {country}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
