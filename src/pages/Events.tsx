import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: "conference" | "workshop" | "outreach" | "online";
  upcoming: boolean;
}

const events: Event[] = [
  {
    id: 1, title: "Unashamed Conference 2026", date: "May 15-17, 2026", time: "9:00 AM - 6:00 PM",
    location: "Lagos, Nigeria", description: "A 3-day conference designed to ignite boldness in believers. Featuring worship, teaching, and activation.",
    type: "conference", upcoming: true,
  },
  {
    id: 2, title: "Bold Faith Workshop", date: "April 28, 2026", time: "2:00 PM - 5:00 PM",
    location: "Online (Zoom)", description: "Hands-on workshop on practical evangelism techniques and overcoming fear.",
    type: "workshop", upcoming: true,
  },
  {
    id: 3, title: "Street Outreach — London", date: "May 3, 2026", time: "10:00 AM - 1:00 PM",
    location: "Central London, UK", description: "Join the TTIN London team for a morning of bold, love-filled street evangelism.",
    type: "outreach", upcoming: true,
  },
  {
    id: 4, title: "TTIN Live Prayer Night", date: "April 20, 2026", time: "7:00 PM - 9:00 PM",
    location: "Online (YouTube Live)", description: "A powerful night of corporate prayer for boldness, revival, and impact.",
    type: "online", upcoming: true,
  },
];

const typeColors: Record<string, string> = {
  conference: "bg-accent text-accent-foreground",
  workshop: "bg-secondary text-secondary-foreground",
  outreach: "bg-dark-spruce text-parchment",
  online: "bg-primary text-primary-foreground",
};

const Events = () => {
  const [selectedType, setSelectedType] = useState("all");
  const filtered = selectedType === "all" ? events : events.filter((e) => e.type === selectedType);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">Come Together</p>
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">Events</h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
              Join us for life-changing events, workshops, and gatherings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-custom flex flex-wrap gap-3 justify-center">
          {["all", "conference", "workshop", "outreach", "online"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 capitalize ${
                selectedType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {t === "all" ? "All Events" : t}
            </button>
          ))}
        </div>
      </section>

      {/* Events List */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {filtered.map((event, i) => (
              <SectionWrapper key={event.id} delay={i * 0.1}>
                <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-accent transition-all duration-500 hover:shadow-xl">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Date badge */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center">
                        <CalendarIcon size={20} className="text-accent" />
                        <span className="font-heading text-sm tracking-wider mt-1">
                          {event.date.split(",")[0].split(" ").slice(0, 2).join(" ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`text-xs font-heading tracking-wider px-3 py-1 rounded-full ${typeColors[event.type]}`}>
                          {event.type}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl tracking-wider text-card-foreground mb-2">
                        {event.title}
                      </h3>
                      <p className="font-body text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-body mb-4">
                        <span className="flex items-center gap-1"><Clock size={14} /> {event.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                      </div>
                      <Button variant="hero" size="sm" className="gap-2">
                        Register <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
