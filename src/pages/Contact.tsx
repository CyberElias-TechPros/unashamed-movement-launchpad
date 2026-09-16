import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Mail, MessageCircle, Instagram, Send } from "lucide-react";
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

  return (
    <Layout>
      <section
        className="page-section full-bleed-section section-theme-dark section-height--large"
        data-test="page-section"
        data-section-theme="dark"
      >
        <div className="section-border" />
        <div className="section-background">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0d0a0a]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#eab308]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#eab308]/5 blur-3xl pointer-events-none" />
        </div>
        <div className="content-wrapper relative z-10">
          <div className="content container-custom pt-32 pb-16 md:pt-44 md:pb-24">
            <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
              Contact Us
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-white mb-6">
              Get In Touch
            </h1>
            <p className="font-body text-white/50 text-lg max-w-3xl">
              Join the movement and connect with us. We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      <section
        className="page-section full-bleed-section section-theme-bright-inverse"
        data-test="page-section"
        data-section-theme="bright-inverse"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12">
            <SectionWrapper>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="template-card bg-card border border-border p-8">
                  <h2 className="font-heading text-2xl tracking-wider text-card-foreground mb-6">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden
                      {...register("website")}
                    />
                    <div>
                      <Label htmlFor="name" className="text-card-foreground">Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Your name"
                        aria-invalid={!!errors.name}
                        aria-describedby="name-error"
                      />
                      {errors.name && (
                        <p id="name-error" className="text-sm text-red-500 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-card-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="your@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby="email-error"
                      />
                      {errors.email && (
                        <p id="email-error" className="text-sm text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-card-foreground">Message</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Your message..."
                        rows={5}
                        className="resize-none"
                        aria-invalid={!!errors.message}
                        aria-describedby="message-error"
                      />
                      {errors.message && (
                        <p id="message-error" className="text-sm text-red-500 mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </SectionWrapper>

            <div className="space-y-6">
              <SectionWrapper delay={0.1}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="template-card bg-card border border-border p-8"
                >
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-4">
                    Join Our Community
                  </h3>
                  <p className="font-body text-muted-foreground mb-6">
                    Connect with us and other bold Christians in our WhatsApp community.
                  </p>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <a
                      href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Join WhatsApp community"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Join WhatsApp Group
                    </a>
                  </Button>
                </motion.div>
              </SectionWrapper>

              <SectionWrapper delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="template-card bg-card border border-border p-8"
                >
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-6">
                    Quick Contact
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:thetimeisnow255@gmail.com"
                      className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Email us at thetimeisnow255@gmail.com"
                    >
                      <Mail className="w-5 h-5" />
                      <span>thetimeisnow255@gmail.com</span>
                    </a>
                    <a
                      href="https://instagram.com/__thetimeisnow"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent({ category: "social", action: "click", label: "contact_instagram" })}
                      className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                      <span>@_thetimeisnow</span>
                    </a>
                  </div>
                </motion.div>
              </SectionWrapper>

              <SectionWrapper delay={0.3}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="template-card bg-card border border-border p-8"
                >
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-4">
                    Global Movement
                  </h3>
                  <p className="font-body text-muted-foreground mb-4">
                    The Time Is Now is a worldwide movement with people preaching in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Canada", "USA", "UK", "Australia", "Nigeria", "Hungary", "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi", "Cameroon", "Poland", "Spain"].map((country) => (
                      <span
                        key={country}
                        className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-body"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </SectionWrapper>
            </div>
          </div>
        </div>
      </div>
      </section>
    </Layout>
  );
};

export default Contact;