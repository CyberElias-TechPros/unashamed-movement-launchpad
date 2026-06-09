import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialsApi, Testimonial } from "@/api/testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Star, StarOff, Search } from "lucide-react";

const AdminTestimonialManager = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials", "admin", searchQuery, categoryFilter],
    queryFn: () => testimonialsApi.getAllForAdmin(),
  });

  const filtered = testimonials.filter((t: Testimonial) => {
    const matchesSearch = !searchQuery ||
      (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.text || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(testimonials.map((t: Testimonial) => t.category).filter(Boolean)));

  const approvalMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.update(id, { isApproved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials", "admin"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials", "admin"] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      testimonialsApi.update(id, { isFeatured: !isFeatured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials", "admin"] }),
  });

  const pending = filtered.filter((t: Testimonial) => !t.isApproved);
  const approved = filtered.filter((t: Testimonial) => t.isApproved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage testimonials.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {filtered.length} shown
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {pending.length} pending
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Testimonials</CardTitle>
              <CardDescription>Showing {filtered.length} of {testimonials.length} total.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Check className="h-10 w-10 text-green-500/30 mb-3" />
              <p className="text-muted-foreground">No testimonials match your search.</p>
            </div>
          ) : (
<div className="space-y-3">
               {filtered.map((t: Testimonial) => (
                <div
                  key={t._id}
                  className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={t.avatar || t.image} alt={t.name} />
                        <AvatarFallback className="text-xs font-heading">
                          {t.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-heading font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <Badge variant={t.isApproved ? "default" : "destructive"} className="h-6 text-xs">
                        {t.isApproved ? "Approved" : "Pending"}
                      </Badge>
                      {t.rating && (
                        <Badge variant="outline" className="h-6 text-xs gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          {t.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed pl-0 sm:pl-[52px]">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex gap-2 pl-0 sm:pl-[52px]">
                    {!t.isApproved && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8"
                        onClick={() => approvalMutation.mutate(t._id || t.id)}
                        disabled={approvalMutation.isPending}
                      >
                        <Check className="mr-1.5 h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => rejectMutation.mutate(t._id || t.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTestimonialManager;
