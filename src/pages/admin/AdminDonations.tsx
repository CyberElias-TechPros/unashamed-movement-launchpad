import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, TrendingUp, Users, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { donationsApi, DonationStats } from "@/api/donations";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DonationRow {
  id: string;
  _id?: string;
  donorName?: string;
  donor_email?: string;
  donorEmail?: string;
  amount: number;
  currency?: string;
  status: "pending" | "completed" | "failed";
  paymentMethod?: string;
  payment_method?: string;
  message?: string;
  createdAt?: string;
}

const AdminDonations = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useQuery<DonationStats>({
    queryKey: ["admin", "donations", "stats"],
    queryFn: donationsApi.stats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "donations", page],
    queryFn: () => donationsApi.getAll() as Promise<DonationRow[]>,
  });

  const setStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "completed" | "failed" | "pending" }) =>
      donationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      toast({ title: "Donation updated" });
    },
  });

  const donations = (data || [])
    .slice()
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const filtered = donations.filter(
    (d) =>
      !search ||
      (d.donorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.donorEmail || d.donor_email || "").toLowerCase().includes(search.toLowerCase())
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statCards = [
    {
      label: "Total raised",
      value: formatCurrency(stats?.raisedTotal || 0),
      icon: Heart,
      color: "text-rose-500",
    },
    {
      label: "This month",
      value: formatCurrency(stats?.raisedThisMonth || 0),
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Donors",
      value: String(stats?.donorCount || 0),
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Pending",
      value: String(stats?.pendingCount || 0),
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wider">Donations</h1>
        <p className="text-muted-foreground text-sm">Every gift, at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-heading text-2xl mt-1">{s.value}</p>
                  </div>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search donor name or email…"
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No donations yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((d) => {
                  const id = d.id || d._id || "";
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="font-medium">{d.donorName || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.donorEmail || d.donor_email || "—"}
                        </div>
                        {d.message && (
                          <div className="text-xs text-muted-foreground mt-1 italic max-w-[280px] truncate">
                            “{d.message}”
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(d.amount, d.currency || "USD")}
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {d.paymentMethod || d.payment_method || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === "completed" ? "default" : d.status === "pending" ? "secondary" : "destructive"
                          }
                          className="capitalize"
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {d.createdAt ? format(new Date(d.createdAt), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {d.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              title="Mark as completed (e.g. bank transfer received)"
                              onClick={() => setStatusMutation.mutate({ id, status: "completed" })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Mark as failed"
                              onClick={() => setStatusMutation.mutate({ id, status: "failed" })}
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;
