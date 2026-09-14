import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { newsletterApi } from "@/api/newsletter";
import { eventsApi } from "@/api/events";
import { productsApi } from "@/api/products";
import { resourcesApi } from "@/api/resources";
import HeroSection from "./sections/HeroSection";
import RibbonSection from "./sections/RibbonSection";
import ManifestoSection from "./sections/ManifestoSection";
import MissionSection from "./sections/MissionSection";
import VideoSection from "./sections/VideoSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import ImpactSection from "./sections/ImpactSection";
import GlobalSection from "./sections/GlobalSection";
import NewsletterSection from "./sections/NewsletterSection";
import FeaturedSection from "./sections/FeaturedSection";
import CTASection from "./sections/CTASection";
import Preloader from "@/components/cinematic/Preloader";

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [featured, setFeatured] = useState<{ events?: string; shop?: string; resources?: string }>({});

  useEffect(() => {
    const unwrap = <T,>(res: { data?: T[] } | T[] | null | undefined): T[] =>
      Array.isArray(res) ? res : res?.data ?? [];
    Promise.all([
      eventsApi.getAll().catch(() => [] as import("@/api/events").Event[]),
      productsApi.getAll().catch(() => null),
      resourcesApi.getAll().catch(() => null),
    ]).then(([events, products, resources]) => {
      setFeatured({
        events: unwrap(events)[0]?.title,
        shop: unwrap<{ name: string }>(products)[0]?.name,
        resources: unwrap<{ title: string }>(resources)[0]?.title,
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
      <Preloader />
      <HeroSection />
      <RibbonSection />
      <ManifestoSection />
      <MissionSection />
      <ImpactSection />
      <VideoSection />
      <TestimonialsSection />
      <GlobalSection />
      <FeaturedSection featured={featured} />
      <NewsletterSection
        email={email}
        isSubscribing={isSubscribing}
        onSubscribe={handleSubscribe}
        onEmailChange={onEmailChange}
      />
      <CTASection />
    </Layout>
  );
};

export default Index;
