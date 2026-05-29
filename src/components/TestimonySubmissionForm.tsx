import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { testimonialsApi, Testimonial } from "@/api/testimonials";

const testimonySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be under 100 characters"),
  content: z.string().min(1, "Testimony content is required").max(2000, "Content must be under 2000 characters"),
  category: z.enum(["Evangelism", "Youth", "Apologetics", "Lifestyle", "Workplace", "Other"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  image: z.string().url("Must be a valid URL").optional().or(z.string().min(0)),
});

type TestimonyFormValues = z.infer<typeof testimonySchema>;

const categories = ["Evangelism", "Youth", "Apologetics", "Lifestyle", "Workplace", "Other"];

export const TestimonySubmissionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<TestimonyFormValues>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      name: "",
      location: "",
      content: "",
      category: "Evangelism",
      image: "",
    },
  });

  const onSubmit = async (data: TestimonyFormValues) => {
    setIsSubmitting(true);
    try {
      const testimonyData: Omit<Testimonial, 'id' | 'approved' | 'createdAt'> = {
        name: data.name,
        location: data.location,
        text: data.content,
        category: data.category,
        image: data.image || undefined,
      };
      
      await testimonialsApi.submit(testimonyData);
      
      setSubmitSuccess(true);
      form.reset();
      
      toast({
        title: "Testimony submitted successfully!",
        description: "Thank you for sharing your story. It will be reviewed by our team.",
      });
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
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {submitSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-heading tracking-wider text-card-foreground mb-2">
              Thank You for Sharing!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your testimony has been submitted and will appear on our site after approval.
            </p>
            <Button
              variant="link"
              onClick={() => setSubmitSuccess(false)}
            >
              Submit another testimony
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-2xl font-heading tracking-wider text-foreground mb-6 text-center">
              Share Your Story
            </h3>
            <p className="text-muted-foreground text-center mb-8">
              Your testimony could inspire someone else to be bold. We'd love to hear how God has moved in your life.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Testimony</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your story..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add a link to an image to accompany your testimony
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Testimony <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};