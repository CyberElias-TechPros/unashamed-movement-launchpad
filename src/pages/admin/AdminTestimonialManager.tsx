import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const AdminTestimonialManager = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const {
    data: testimonials,
    pagination,
    isLoading,
    page,
    limit,
    setPage,
    setLimit,
    refresh,
  } = usePaginatedQuery<Testimonial>({
    endpoint: "/testimonies/manage/all",
    queryKey: ["testimonials", "admin"],
  });

  // Client-side filtering
  const filtered = testimonials.filter((t: Testimonial) => {
    const matchesSearch = !searchQuery ||
      (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.text || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "approved" && t.isApproved) ||
      (statusFilter === "pending" && !t.isApproved);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(testimonials.map((t: Testimonial) => t.category).filter(Boolean)));

  const approvalMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.update(id, { isApproved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      refresh();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      refresh();
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      testimonialsApi.update(id, { isFeatured: !isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      refresh();
    },
  });

  const pending = testimonials.filter((t: Testimonial) => !t.isApproved);
  const approved = testimonials.filter((t: Testimonial) => t.isApproved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage testimonials.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {pagination.totalCount} total
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
              <CardDescription>Showing {filtered.length} of {pagination.totalCount} total.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <PaginationInfo
              page={pagination.page}
              limit={pagination.limit}
              totalCount={pagination.totalCount}
            />
            <PageSizeSelector
              value={limit}
              onChange={setLimit}
              options={[10, 25, 50, 100]}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Check className="h-10 w-10 text-green-500/30 mb-3" />
              <p className="text-muted-foreground">No testimonials match your search.</p>
            </div>
          ) : (
            <>
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
              
              {/* Pagination */}
              <div className="flex justify-center pt-4">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTestimonialManager;
