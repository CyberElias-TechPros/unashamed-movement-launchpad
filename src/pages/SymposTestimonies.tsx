import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { Users, Globe, MapPin, BookOpen } from "lucide-react";
import { Quote } from "lucide-react";

const SymposTestimonies = () => {
  const countries = [
    { name: "Canada", preachers: 8 },
    { name: "United States", preachers: 15 },
    { name: "United Kingdom", preachers: 12 },
    { name: "Australia", preachers: 6 },
    { name: "Nigeria", preachers: 18 },
    { name: "Hungary", preachers: 4 },
    { name: "Ghana", preachers: 10 },
    { name: "Kenya", preachers: 9 },
    { name: "Eswatini", preachers: 3 },
    { name: "Indonesia", preachers: 7 },
    { name: "Israel", preachers: 5 },
    { name: "India", preachers: 11 },
    { name: "Burundi", preachers: 2 },
    { name: "Cameroon", preachers: 4 },
    { name: "Poland", preachers: 3 },
    { name: "Spain", preachers: 5 },
  ];

  const preachingLocations = ["Buses", "Ferries", "Malls", "Airplanes", "Trains", "Streets", "Airports"];

  const testimonials = [
    { text: "TTIN changed my life. I went from being afraid to share my faith to boldly proclaiming the Gospel everywhere I go.", author: "Sarah M.", location: "Lagos, Nigeria" },
    { text: "After watching the plane preaching video, I felt compelled to preach on my bus. Three people accepted Christ that day!", author: "David K.", location: "London, UK" },
    { text: "The community here is amazing. I finally found people who understand the urgency of the Gospel.", author: "Grace O.", location: "Houston, TX" },
  ];

  return (
    <SymposLayout>
      <section className="relative min-h-[60vh] flex items-center bg-primary pt-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container-custom text-center relative z-10"
        >
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Real Stories, Real Faith
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
            Testimonies
          </h1>
          <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
            Lives transformed by the courage to be unashamed
          </p>
        </motion.div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "100+", label: "People Preached Open Air", icon: <Users className="w-6 h-6" /> },
              { number: "16", label: "Countries Reached", icon: <Globe className="w-6 h-6" /> },
              { number: "158", label: "Books Downloaded", icon: <BookOpen className="w-6 h-6" /> },
              { number: "7", label: "Types of Locations", icon: <MapPin className="w-6 h-6" /> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                  {stat.icon}
                </div>
                <div className="font-heading text-4xl lg:text-5xl text-accent mb-2">
                  {stat.number}
                </div>
                <div className="font-body text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Global Reach
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-primary-foreground mb-6">
              Interactive World Map
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <div
                key={country.name}
                className="bg-card rounded-lg p-4 text-center hover:bg-primary-foreground/20 transition-colors"
              >
                <div className="font-heading text-card-foreground font-semibold">
                  {country.name}
                </div>
                <div className="font-body text-card-foreground/60 text-sm mt-1">
                  {country.preachers} preachers
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Where We Preach
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-foreground mb-6">
              Different Places
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {preachingLocations.map((location) => (
              <div key={location} className="bg-card rounded-xl p-6 text-center border border-border hover:border-accent transition-colors">
                <MapPin className="w-8 h-8 text-accent mb-3 mx-auto" />
                <p className="font-heading text-foreground">{location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Testimonials
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border"
              >
                <Quote className="text-accent mb-4" size={28} />
                <p className="font-body text-card-foreground/80 leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-heading text-lg tracking-wider text-card-foreground">
                    {t.author}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {t.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-accent">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl sm:text-5xl tracking-wider text-accent-foreground mb-6">
            Have A Story To Share?
          </h2>
          <p className="font-body text-accent-foreground/70 text-xl max-w-2xl mx-auto mb-10">
            Your testimony could inspire someone else to be bold.
          </p>
          <a
            href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent-foreground text-accent px-8 py-3 rounded-full font-heading tracking-wider hover:bg-accent-foreground/90 transition-colors"
          >
            Join Our Community
          </a>
        </div>
      </section>
    </SymposLayout>
  );
};

export default SymposTestimonies;