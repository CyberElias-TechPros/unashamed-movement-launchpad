import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, Review } from "@/api/reviews";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, Trash2, MessageSquare, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewFilter = "all" | "pending" | "approved" | "rejected";

interface ReviewWithStatus extends Review {
  rejected?: boolean;
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "admin", filter],
    queryFn: () => reviewsApi.getAll(),
  });

  const filtered = reviews.filter((r: ReviewWithStatus) => {
    if (filter === "pending") return !r.approved && !r.rejected;
    if (filter === "approved") return r.approved && !r.rejected;
    if (filter === "rejected") return r.rejected;
    return true;
  });

  const getStatus = (r: ReviewWithStatus): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (r.rejected) return { label: "Rejected", variant: "destructive" };
    if (r.approved) return { label: "Approved", variant: "default" };
    return { label: "Pending", variant: "secondary" };
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "0";

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ key: ["reviews"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ key: ["reviews"] }),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => reviewsApi.approve(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelectedIds([]);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => reviewsApi.reject(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ key: ["reviews"] });
      setSelectedIds([]);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Product Reviews</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage product reviews.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading text-green-600">
              {reviews.filter((r: ReviewWithStatus) => r.approved && !r.rejected).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading">{averageRating} / 5</div>
          </CardContent>
        </Card>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" onClick={() => bulkApproveMutation.mutate(selectedIds)}>
            Bulk Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => bulkRejectMutation.mutate(selectedIds)}>
            Bulk Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Reviews List</CardTitle>
              <CardDescription>{filtered.length} reviews in this category.</CardDescription>
            </div>
            <Select value={filter} onValueChange={(v: ReviewFilter) => setFilter(v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No reviews found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={(e) => {
                          setSelectedIds(e.target.checked ? filtered.map((r) => r._id!) : []);
                        }}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r: ReviewWithStatus) => {
                    const status = getStatus(r);
                    return (
                      <TableRow key={r._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r._id!)}
                            onChange={(e) => {
                              setSelectedIds(prev => 
                                e.target.checked ? [...prev, r._id!] : prev.filter(id => id !== r._id)
                              );
                            }}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.name || "Anonymous"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {r.product || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Star className="h-3 w-3 fill-current" />
                            {r.rating}/5
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="line-clamp-1 text-sm">{r.title || r.body || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {!r.approved && !r.rejected && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => approveMutation.mutate(r._id!)}
                                disabled={approveMutation.isPending}
                                className="text-green-600 hover:text-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMutation.mutate(r._id!)}
                              disabled={removeMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;