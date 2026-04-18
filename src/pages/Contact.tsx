import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import { Mail, MessageCircle, Instagram, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <FloatingParticles count={18} color="hsl(43 78% 56%)" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Contact Us
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
              Get In Touch
            </h1>
            <p className="font-body text-primary-foreground/70 text-xl max-w-2xl mx-auto">
              Join the movement and connect with us. We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <SectionWrapper>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h2 className="font-heading text-2xl tracking-wider text-card-foreground mb-6">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-card-foreground">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-card-foreground">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-card-foreground">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your message..."
                        rows={5}
                        className="resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </motion.div>
            </SectionWrapper>

            {/* Contact Information */}
            <div className="space-y-6">
              <SectionWrapper delay={0.1}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-8 border border-border"
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
                  className="bg-card rounded-2xl p-8 border border-border"
                >
                  <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-6">
                    Quick Contact
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:thetimeisnow255@gmail.com"
                      className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>thetimeisnow255@gmail.com</span>
                    </a>
                    <a
                      href="https://instagram.com/_thetimeisnow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
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
                  className="bg-card rounded-2xl p-8 border border-border"
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
      </section>
    </Layout>
  );
};

export default Contact;
