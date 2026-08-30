import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Calendar, ShoppingBag, BookOpen, Play, MapPin, Users, Globe, MessageSquare } from "lucide-react";
import Layout from "@/components/Layout";
import SectionWrapper from "@/components/SectionWrapper";
import FloatingParticles from "@/components/FloatingParticles";
import MagneticButton from "@/components/MagneticButton";
import TextReveal from "@/components/TextReveal";
import TiltCard from "@/components/TiltCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { newsletterApi } from "@/api/newsletter";
import { eventsApi } from "@/api/events";
import { productsApi } from "@/api/products";
import { resourcesApi } from "@/api/resources";
import { trackEvent } from "@/lib/analytics";
import HeroSection from "./sections/HeroSection";
import MissionSection from "./sections/MissionSection";
import VideoSection from "./sections/VideoSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import ImpactSection from "./sections/ImpactSection";
import LocationsSection from "./sections/LocationsSection";
import CountriesSection from "./sections/CountriesSection";
import NewsletterSection from "./sections/NewsletterSection";
import FeaturedSection from "./sections/FeaturedSection";
import CTASection from "./sections/CTASection";

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [featured, setFeatured] = useState<{ events?: string; shop?: string; resources?: string }>({});

  useEffect(() => {
    Promise.all([
      eventsApi.getAll().catch(() => []),
      productsApi.getAll().catch(() => []),
      resourcesApi.getAll().catch(() => []),
    ]).then(([eventsResponse, productsResponse, resourcesResponse]) => {
      const asArray = <T,>(res: unknown): T[] => {
        if (Array.isArray(res)) return res as T[];
        const maybe = res as { data?: T[] };
        return maybe?.data ?? [];
      };
      const events = asArray<{ title?: string }>(eventsResponse);
      const products = asArray<{ name?: string }>(productsResponse);
      const resources = asArray<{ title?: string }>(resourcesResponse);
      setFeatured({
        events: events[0]?.title,
        shop: products[0]?.name,
        resources: resources[0]?.title,
      });
    });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    try {
      await newsletterApi.subscribe({ email });
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive our latest updates.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Layout>
      <HeroSection />
      <MissionSection />
      <VideoSection />
        <TestimonialsSection />
        <ImpactSection />
        <CountriesSection />
        <LocationsSection />
        <NewsletterSection
          email={email}
          isSubscribing={isSubscribing}
          onSubscribe={handleSubscribe}
          onEmailChange={onEmailChange}
        />
        <FeaturedSection featured={featured} />
        <CTASection />
      </Layout>
  );
};

export default Index;
