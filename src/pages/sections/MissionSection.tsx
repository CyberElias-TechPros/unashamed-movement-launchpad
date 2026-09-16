import SectionWrapper from "@/components/SectionWrapper";

const MissionSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-8 sm:mb-16">
            <p className="font-body text-secondary text-sm tracking-[0.3em] uppercase mb-4">
              Our Purpose
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-foreground mb-6">
              “Our mission is simple: make radical Christianity normal again.”
            </h2>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <SectionWrapper delay={0.1}>
            <div className="bg-primary rounded-2xl p-8 lg:p-12 h-full">
              <span className="text-accent font-heading text-xl tracking-wider">
                Our Mission
              </span>
              <h3 className="font-heading text-3xl lg:text-4xl text-primary-foreground tracking-wider mt-4 mb-6">
                Empower Bold Faith
              </h3>
              <p className="font-body text-primary-foreground/70 text-lg leading-relaxed">
                The Time is Now is a movement designed to awaken believers from passivity to
                consistently preach the gospel with boldness and urgency in this generation —
                thereby causing them to live up to their full potential in Christ.
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 h-full">
              <span className="text-accent font-heading text-xl tracking-wider">
                Our Vision
              </span>
              <h3 className="font-heading text-3xl lg:text-4xl text-foreground tracking-wider mt-4 mb-6">
                A Fearless Generation
              </h3>
              <p className="font-body text-muted-foreground text-lg leading-relaxed">
                To see a generation of Christians who are unashamed of the Gospel,
                transforming communities and nations through radical, fearless love.
                A world where every believer walks in the fullness of their calling.
              </p>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
