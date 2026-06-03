import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { eventsApi, Event } from "@/api/events";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { googleCalendarUrl } from "@/lib/calendar";

const typeColors: Record<string, string> = {
  conference: "bg-accent text-accent-foreground",
  workshop: "bg-secondary text-secondary-foreground",
  outreach: "bg-dark-spruce text-parchment",
  online: "bg-primary text-primary-foreground",
};

const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("all");
  const [registeringEvent, setRegisteringEvent] = useState<number | string | null>(null);
  const [registerModal, setRegisterModal] = useState<{ id: string; title: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type) {
      setSelectedType(type);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventsApi.getAll(selectedType !== "all" ? selectedType : undefined);
        setEvents(data);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedType]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const newUrl = type === 'all' ? '/events' : `/events?type=${type}`;
    navigate(newUrl, { replace: true });
  };

  const handleRegisterSubmit = async ({ name, email }: { name: string; email: string }) => {
    if (!registerModal) return;
    setRegisteringEvent(registerModal.id);
    try {
      await eventsApi.register({
        eventId: registerModal.id,
        attendeeEmail: email,
        attendeeName: name,
      });
      trackEvent({
        category: "engagement",
        action: "register",
        label: `event_${registerModal.id}`,
      });
      toast({
        title: "Registration successful!",
        description: `You've been registered for "${registerModal.title}".`,
      });
    } catch {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRegisteringEvent(null);
    }
  };

  const filtered = selectedType === "all" ? events : events.filter((e) => e.type === selectedType);
  const featured = filtered[0];

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-background pt-20">
          <div className="container-custom max-w-4xl">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 lg:p-8 border border-border">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Skeleton className="w-20 h-20 rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="section-padding bg-primary pt-20">
          <div className="container-custom text-center">
            <p className="text-primary-foreground/70">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-48 h-48 sm:w-72 sm:h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={15} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">Come Together</p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">Events</h1>
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
              onClick={() => handleTypeChange(t)}
              className={`font-heading text-sm tracking-wider px-5 py-2 rounded-full transition-all duration-300 capitalize ${
                selectedType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {t === "all" ? "All Events" : t}
            </button>
          ))}
        </div>
      </section>

      {featured && (
        <section className="section-padding bg-accent/10 border-y border-accent/20">
          <div className="container-custom max-w-4xl text-center">
            <p className="text-accent text-sm tracking-[0.3em] uppercase mb-2">Featured Event</p>
            <h2 className="font-heading text-3xl tracking-wider mb-4">{featured.title}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{featured.description}</p>
            <Button variant="hero" onClick={() => setRegisterModal({ id: featured._id || featured.id || "", title: featured.title })}>
              Register Now
            </Button>
          </div>
        </section>
      )}

      <EventRegistrationModal
        open={!!registerModal}
        onOpenChange={(open) => !open && setRegisterModal(null)}
        eventTitle={registerModal?.title || ""}
        onSubmit={handleRegisterSubmit}
      />

      {/* Events List */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {filtered.map((event, i) => (
              <SectionWrapper key={event.id || event._id} delay={i * 0.1}>
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="hero"
                          size="sm"
                          className="gap-2"
                          onClick={() => setRegisterModal({ id: event._id || event.id || "", title: event.title })}
                          disabled={registeringEvent === (event._id || event.id)}
                        >
                          {registeringEvent === (event._id || event.id) ? "Registering..." : <>Register <ArrowRight size={14} /></>}
                        </Button>
                        <a
                          href={googleCalendarUrl(event.title, event.date, event.description, event.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" type="button">
                            Add to Calendar
                          </Button>
                        </a>
                      </div>
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
