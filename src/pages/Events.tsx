import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import PageHero from "@/components/cinematic/PageHero";
import KineticText from "@/components/cinematic/KineticText";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, Users } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { eventsApi, Event } from "@/api/events";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { googleCalendarUrl } from "@/lib/calendar";

const typeStyles: Record<string, string> = {
  conference: "bg-accent text-accent-foreground",
  workshop: "bg-secondary text-secondary-foreground",
  outreach: "bg-foreground text-background",
  online: "border border-accent/60 text-accent",
};

const typeDot: Record<string, string> = {
  conference: "bg-accent",
  workshop: "bg-secondary",
  outreach: "bg-foreground",
  online: "bg-accent",
};

const formatEventDate = (raw: string): { month: string; day: string; label: string } => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    const fallback = raw.split(",")[0].split(" ").slice(0, 2).join(" ");
    return { month: "", day: "", label: fallback };
  }
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.toLocaleDateString("en-US", { day: "numeric" });
  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return { month, day, label };
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
    const type = params.get("type");
    if (type) {
      setSelectedType(type);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getAll(selectedType !== "all" ? selectedType : undefined);
        setEvents(Array.isArray(data) ? data : []);
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
    const newUrl = type === "all" ? "/events" : `/events?type=${type}`;
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
    } catch (err) {
      console.error("Registration failed", err);
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

  return (
    <Layout>
      <PageHero
        kicker="Come Together"
        title="EVENTS"
        italic="show up bold"
        description="Life-changing conferences, workshops, outreaches, and online gatherings across the movement."
        align="center"
      />

      {/* Filter */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md sm:top-20">
        <div className="container-custom flex flex-wrap justify-center gap-2 py-4">
          {["all", "conference", "workshop", "outreach", "online"].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`rounded-full px-5 py-2 font-heading text-sm tracking-wider transition-all duration-300 capitalize ${
                selectedType === t
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              {t === "all" ? "All Events" : t}
            </button>
          ))}
        </div>
      </section>

      {featured && !loading && (
        <section className="relative overflow-hidden border-b border-border bg-card/20">
          <EmberGlow intensity="low" />
          <div className="section-padding">
            <div className="container-custom max-w-4xl">
              <SectionWrapper>
                <div className="glass-panel gold-hairline relative overflow-hidden rounded-3xl p-8 sm:p-12 vignette">
                  <div className="relative z-10 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${typeDot[featured.type] || "bg-accent"}`} />
                      <p className="kicker">Next Up · Featured</p>
                    </div>
                    <h2 className="mb-3 font-heading text-4xl tracking-wider text-foreground sm:text-5xl">
                      {featured.title}
                    </h2>
                    <p className="mx-auto mb-3 max-w-2xl font-body text-muted-foreground">
                      {featured.description}
                    </p>
                    <p className="mb-8 font-body text-sm uppercase tracking-[0.2em] text-accent">
                      {formatEventDate(featured.date).label} · {featured.time} · {featured.location}
                    </p>
                    <Button
                      variant="hero"
                      onClick={() => setRegisterModal({ id: featured._id || featured.id || "", title: featured.title })}
                    >
                      Save Your Seat <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </SectionWrapper>
            </div>
          </div>
        </section>
      )}

      <EventRegistrationModal
        open={!!registerModal}
        onOpenChange={(open) => !open && setRegisterModal(null)}
        eventTitle={registerModal?.title || ""}
        onSubmit={handleRegisterSubmit}
      />

      {/* Events list */}
      <section className="relative overflow-hidden bg-background">
        <div className="section-padding">
          <div className="container-custom max-w-4xl">
            <SectionWrapper>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-12 bg-accent/70" />
                <p className="kicker">The Calendar</p>
              </div>
              <h2 className="mb-14 font-heading tracking-wide text-foreground">
                <KineticText text="MARK THE DATES" className="text-5xl sm:text-7xl" />
              </h2>
            </SectionWrapper>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-6 rounded-2xl border border-border bg-card p-6 lg:p-8">
                    <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center font-body text-muted-foreground">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-center font-body text-muted-foreground">
                No events in this category right now — check back soon.
              </p>
            ) : (
              <div className="space-y-5">
                {filtered.map((event, i) => {
                  const date = formatEventDate(event.date);
                  const seatsLeft =
                    event.capacity && event.capacity > 0
                      ? Math.max(0, event.capacity - (event.registeredCount || 0))
                      : null;
                  return (
                    <SectionWrapper key={event.id || event._id} delay={Math.min(i, 5) * 0.08}>
                      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 transition-all duration-500 hover:border-accent/60 hover:bg-card lg:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row">
                          {/* Date block */}
                          <div className="shrink-0">
                            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-accent/30 bg-primary">
                              <span className="font-body text-xs font-bold uppercase tracking-[0.25em] text-accent">
                                {date.month}
                              </span>
                              <span className="font-heading text-4xl leading-none text-gradient-gold">
                                {date.day}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                              <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.15em] ${typeStyles[event.type] || typeStyles.online}`}>
                                {event.type}
                              </span>
                              {seatsLeft !== null && seatsLeft <= 100 && (
                                <span className="flex items-center gap-1 font-body text-xs uppercase tracking-wider text-accent">
                                  <Users size={12} /> {seatsLeft} seats left
                                </span>
                              )}
                            </div>
                            <h3 className="mb-2 font-heading text-2xl tracking-wider text-card-foreground sm:text-3xl">
                              {event.title}
                            </h3>
                            <p className="mb-4 font-body text-muted-foreground">{event.description}</p>
                            <div className="mb-5 flex flex-wrap gap-5 font-body text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon size={14} className="text-accent" /> {date.label}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} className="text-accent" /> {event.time}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-accent" /> {event.location}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                variant="hero"
                                size="sm"
                                className="gap-2"
                                onClick={() => setRegisterModal({ id: event._id || event.id || "", title: event.title })}
                                disabled={registeringEvent === (event._id || event.id)}
                              >
                                {registeringEvent === (event._id || event.id)
                                  ? "Registering..."
                                  : <>Register <ArrowRight size={14} /></>}
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
                      </article>
                    </SectionWrapper>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
