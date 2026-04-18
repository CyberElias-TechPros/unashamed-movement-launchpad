import { useState } from "react";
import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import { Mail, MessageCircle, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SymposContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent!");
  };

  const countries = ["Canada", "USA", "UK", "Australia", "Nigeria", "Hungary", "Ghana", "Kenya", "Eswatini", "Indonesia", "Israel", "India", "Burundi", "Cameroon", "Poland", "Spain"];

  return (
    <SymposLayout>
      <section className="relative min-h-[50vh] flex items-center bg-primary pt-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container-custom text-center relative z-10"
        >
          <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
            Get In Touch
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary-foreground mb-6">
            Contact Us
          </h1>
          <p className="font-body text-primary-foreground/70 text-xl max-w-xl mx-auto">
            Join the movement and connect with us
          </p>
        </motion.div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                <h2 className="font-heading text-2xl tracking-wider text-card-foreground mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-card-foreground">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="bg-background border-border text-card-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-card-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="bg-background border-border text-card-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-card-foreground">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your message..."
                      rows={5}
                      className="bg-background border-border text-card-foreground resize-none"
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-4">
                  Join Our Community
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  Connect with bold Christians in our WhatsApp community
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

              <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-6">
                  Quick Contact
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:thetimeisnow255@gmail.com"
                    className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Mail className="w-5 h-5 text-accent" />
                    <span>thetimeisnow255@gmail.com</span>
                  </a>
                  <a
                    href="https://instagram.com/_thetimeisnow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-accent" />
                    <span>@_thetimeisnow</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom">
          <div className="text-center">
            <h3 className="font-heading text-xl tracking-wider text-primary-foreground mb-4">
              Global Movement
            </h3>
            <p className="font-body text-primary-foreground/80 mb-6">
              The Time Is Now is a worldwide movement with people preaching in:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {countries.map((country) => (
                <span
                  key={country}
                  className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SymposLayout>
  );
};

export default SymposContact;