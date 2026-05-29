import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Check, X as XIcon, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonialsApi, Testimonial } from "@/api/testimonials";

const AdminTestimonialManager = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await testimonialsApi.getAllForAdmin();
      setTestimonials(data);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await testimonialsApi.update(id, { isApproved: true });
    fetchTestimonials();
  };

  const handleReject = async (id: string) => {
    await testimonialsApi.delete(id);
    fetchTestimonials();
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    await testimonialsApi.update(id, { isFeatured: !isFeatured });
    fetchTestimonials();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl tracking-wider text-foreground mb-2">
              Testimonial Management
            </h2>
            <p className="text-muted-foreground">
              Review and manage user testimonials
            </p>
          </div>

          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial._id || testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-heading">{testimonial.name}</h4>
                        <Badge variant={testimonial.location ? "outline" : "secondary"}>
                          {testimonial.location || "Pending location"}
                        </Badge>
                        {!testimonial.isApproved && (
                          <Badge variant="destructive">Pending Review</Badge>
                        )}
                        {testimonial.isFeatured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-3">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{testimonial.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!testimonial.isApproved ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(testimonial._id || testimonial.id || "")}>
                            <Check size={16} className="text-green-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(testimonial._id || testimonial.id || "")}>
                            <XIcon size={16} className="text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFeature(testimonial._id || testimonial.id || "", testimonial.isFeatured || false)}
                        >
                          <Star size={16} className={testimonial.isFeatured ? "text-yellow-500" : "text-muted-foreground"} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTestimonialManager;