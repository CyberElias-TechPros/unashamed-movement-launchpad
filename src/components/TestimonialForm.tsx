import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { testimonialsApi, Testimonial } from "@/api/testimonials";

interface TestimonialFormProps {
  className?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface TestimonialData {
  name: string;
  location: string;
  content: string;
}

export const TestimonialForm = ({ className }: TestimonialFormProps) => {
  const [formData, setFormData] = useState<TestimonialData>({
    name: "",
    location: "",
    content: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (!formData.location.trim()) {
      setErrorMessage("Please enter your location");
      return false;
    }
    if (!formData.content.trim()) {
      setErrorMessage("Please share your testimony");
      return false;
    }
    if (formData.content.length < 50) {
      setErrorMessage("Please share more details (at least 50 characters)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await testimonialsApi.submit({
        name: formData.name,
        location: formData.location,
        text: formData.content,
        category: "General",
      });
      setStatus("success");
      setFormData({ name: "", location: "", content: "" });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleInputChange = (
    field: keyof TestimonialData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
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
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-heading text-xl tracking-wider text-foreground mb-2">
              Thank You for Sharing!
            </h3>
            <p className="font-body text-muted-foreground mb-6">
              Your testimony has been submitted successfully. We'll review it shortly.
            </p>
            <Button
              variant="outline"
              onClick={() => setStatus("idle")}
            >
              Share Another Testimony
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testimonial-name">Your Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="testimonial-name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={status === "loading"}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimonial-location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="testimonial-location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={status === "loading"}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimonial-content">Your Testimony *</Label>
                  <Textarea
                    id="testimonial-content"
                    placeholder="Share how TTIN has changed your life..."
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    disabled={status === "loading"}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.content.length} / 50 minimum characters
                  </p>
                </div>
              </div>

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-red-500"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
                size="lg"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Testimony
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your testimony will be reviewed before being published.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialForm;