import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageHero from "@/components/cinematic/PageHero";
import EmberGlow from "@/components/cinematic/EmberGlow";
import { Mail, MessageCircle, Instagram, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trackFormSubmit, trackEvent } from "@/lib/analytics";
import { contactApi, type ContactData } from "@/api/contact";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
  website: z.string().max(0).optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // Includes the honeypot `website` (optional); zod already validated.
      await contactApi.submit(data as ContactData);
      trackFormSubmit("contact_form");
      toast({
        title: "Message sent!",
        description: "We'll get back to you soon.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "h-12 rounded-lg border-border bg-card font-body text-foreground placeholder:text-muted-foreground/50 focus-visible:border-accent";

  return (
    <Layout>
      <PageHero
        kicker="Reach Out"
        title="GET IN TOUCH"
        italic="we answer fast"
        description="Questions, ideas, partnership, or prayer — we'd love to hear from you."
        align="center"
      />

      <section className="relative overflow-hidden bg-background">
        <EmberGlow intensity="low" />
        <div className="section-padding pt-0">
          <div className="container-custom relative z-10 -mt-16">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="glass-panel rounded-2xl border border-border p-7 sm:p-9"
              >
                <h2 className="mb-2 font-heading text-3xl tracking-wider text-card-foreground">
                  Send a Message
                </h2>
                <p className="mb-7 font-body text-sm text-muted-foreground">
                  We read every single one.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                    {...register("website")}
                  />
                  <div>
                    <Label htmlFor="name" className="mb-2 block font-body text-sm text-muted-foreground">
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                      aria-describedby="name-error"
                      className={fieldClass}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 font-body text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block font-body text-sm text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="your@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      className={fieldClass}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 font-body text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message" className="mb-2 block font-body text-sm text-muted-foreground">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Your message..."
                      rows={5}
                      className="resize-none rounded-lg border-border bg-card font-body text-foreground placeholder:text-muted-foreground/50 focus-visible:border-accent"
                      aria-invalid={!!errors.message}
                      aria-describedby="message-error"
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 font-body text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Side cards */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="rounded-2xl border border-border bg-card/60 p-7 transition-colors hover:border-accent/40"
                >
                  <h3 className="mb-3 font-heading text-2xl tracking-wider text-card-foreground">
                    Join The Community
                  </h3>
                  <p className="mb-5 font-body text-muted-foreground">
                    Connect with bold believers from 16 nations in our WhatsApp family.
                  </p>
                  <Button asChild className="w-full gap-2 bg-[#1faa53] text-white hover:bg-[#1faa53]/90">
                    <a
                      href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Join WhatsApp community"
                    >
                      <MessageCircle size={18} />
                      Join WhatsApp Group
                    </a>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="rounded-2xl border border-border bg-card/60 p-7 transition-colors hover:border-accent/40"
                >
                  <h3 className="mb-5 font-heading text-2xl tracking-wider text-card-foreground">
                    Quick Contact
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:thetimeisnow255@gmail.com"
                      className="flex items-center gap-4 font-body text-muted-foreground transition-colors hover:text-accent"
                      aria-label="Email us at thetimeisnow255@gmail.com"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                        <Mail size={17} />
                      </span>
                      thetimeisnow255@gmail.com
                    </a>
                    <a
                      href="https://instagram.com/_thetimeisnow"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent({ category: "social", action: "click", label: "contact_instagram" })}
                      className="flex items-center gap-4 font-body text-muted-foreground transition-colors hover:text-accent"
                      aria-label="Follow us on Instagram"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                        <Instagram size={17} />
                      </span>
                      @_thetimeisnow
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="rounded-2xl border border-border bg-card/60 p-7 transition-colors hover:border-accent/40"
                >
                  <h3 className="mb-3 font-heading text-2xl tracking-wider text-card-foreground">
                    Global Movement
                  </h3>
                  <p className="mb-4 font-body text-muted-foreground">
                    People preaching in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Canada", "USA", "UK", "Australia", "Nigeria", "Hungary", "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi", "Cameroon", "Poland", "Spain"].map((country) => (
                      <span
                        key={country}
                        className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-body text-xs uppercase tracking-wider text-accent"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
