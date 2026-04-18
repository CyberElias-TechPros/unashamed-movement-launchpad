import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { newsletterApi } from "@/api/newsletter";

interface NewsletterSignupProps {
  className?: string;
  variant?: "default" | "hero" | "minimal";
  title?: string;
  description?: string;
  buttonText?: string;
}

type SubscribeStatus = "idle" | "loading" | "success" | "error";

export const NewsletterSignup = ({
  className,
  variant = "default",
  title = "Join Our Newsletter",
  description = "Get the latest updates and free resources delivered to your inbox.",
  buttonText = "Subscribe",
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Please enter your email address");
      setStatus("error");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await newsletterApi.subscribe({ email });
      setStatus("success");
      setEmail("");
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const containerVariants = {
    default: "bg-card rounded-2xl p-8 border border-border",
    hero: "bg-card rounded-2xl p-8 border border-primary-foreground/20",
    minimal: "",
  };

  const titleSizes = {
    default: "text-2xl",
    hero: "text-2xl",
    minimal: "text-xl",
  };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "text-center",
              containerVariants[variant]
            )}
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-heading text-xl tracking-wider text-card-foreground mb-2">
              Subscribed Successfully!
            </h3>
            <p className="font-body text-muted-foreground">
              Thank you for subscribing. Check your inbox for a confirmation email.
            </p>
            <Button
              variant="link"
              onClick={() => setStatus("idle")}
              className="mt-4"
            >
              Subscribe another email
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(containerVariants[variant])}
          >
            <div className="text-center mb-6">
              <h3 className={cn("font-heading tracking-wider text-card-foreground mb-2", titleSizes[variant])}>
                {title}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") {
                        setStatus("idle");
                        setErrorMessage("");
                      }
                    }}
                    disabled={status === "loading"}
                    className={cn(
                      "flex-1",
                      status === "error" && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    variant={variant === "hero" ? "hero" : "default"}
                    className="shrink-0"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {buttonText}
                      </>
                    )}
                  </Button>
                </div>
                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-500"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </motion.p>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsletterSignup;