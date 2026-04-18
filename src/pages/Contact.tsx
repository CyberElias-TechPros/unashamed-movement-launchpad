import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary-foreground mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Join the movement and connect with us. We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-heading font-bold text-primary-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-primary-foreground">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="bg-background border-primary/20 text-primary-foreground placeholder:text-primary-foreground/50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-primary-foreground">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-background border-primary/20 text-primary-foreground placeholder:text-primary-foreground/50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-primary-foreground">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={5}
                    className="bg-background border-primary/20 text-primary-foreground placeholder:text-primary-foreground/50 resize-none"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Join Community */}
            <div className="bg-card rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-4">
                Join Our Community
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Connect with us and other bold Christians in our WhatsApp community.
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                <a
                  href="https://chat.whatsapp.com/DhzT4HxSnzFHftlnLIyJna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Join WhatsApp Group
                </a>
              </Button>
            </div>

            {/* Quick Contact */}
            <div className="bg-card rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-6">
                Quick Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:thetimeisnow255@gmail.com"
                  className="flex items-center gap-4 text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  <Mail className="w-5 h-5 text-accent" />
                  <span>thetimeisnow255@gmail.com</span>
                </a>
                <a
                  href="https://instagram.com/_thetimeisnow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  <Instagram className="w-5 h-5 text-accent" />
                  <span>@_thetimeisnow</span>
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-4">
                Global Movement
              </h3>
              <p className="text-primary-foreground/80 mb-4">
                The Time Is Now is a worldwide movement with people preaching in:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Canada", "USA", "UK", "Australia", "Nigeria", "Hungary", "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi", "Cameroon", "Poland", "Spain"].map((country) => (
                  <span
                    key={country}
                    className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
