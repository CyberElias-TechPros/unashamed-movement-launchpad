import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Download, Trash2, Search, Users, CheckCircle2, XCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { newsletterApi } from "@/api/newsletter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

const AdminNewsletterManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: subscribers,
    pagination,
    isLoading,
    page,
    limit,
    setPage,
    setLimit,
    refresh,
  } = usePaginatedQuery<Subscriber>({
    endpoint: "/newsletter/subscribers",
    queryKey: ["newsletter", "subscribers"],
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (email: string) => newsletterApi.unsubscribe(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
      refresh();
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      const subscribers = lines.slice(1).map(line => {
        const [email, name] = line.split(",").map(s => s.replace(/"/g, "").trim());
        return { email, name };
      }).filter(s => s.email);
      return newsletterApi.importSubscribers({ subscribers });
    },
    onSuccess: (data) => {
      toast({ title: "Import successful", description: `Imported ${data.imported} subscribers.` });
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
      setCsvFile(null);
      setImportDialogOpen(false);
      refresh();
    },
    onError: () => {
      toast({ title: "Import failed", variant: "destructive" });
    },
  });

  // Client-side filtering
  const filtered = subscribers.filter((s: Subscriber) => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? s.active : !s.active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.active).length;
  const totalCount = pagination.totalCount;
  const engagementRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const exportCsv = () => {
    const rows = [["email", "subscribedAt", "active"], ...filtered.map((s) => [s.email, s.subscribedAt, String(s.active)])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Newsletter</h1>
          <p className="text-muted-foreground mt-1">Manage email subscribers and campaigns.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Subscribers from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground">CSV format: email, name (optional)</p>
                <Button onClick={() => csvFile && importMutation.mutate(csvFile)} disabled={!csvFile || importMutation.isPending}>
                  {importMutation.isPending ? "Importing..." : "Import"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Button onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading tracking-wider">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading tracking-wider text-green-600">
              {isLoading ? <Skeleton className="h-8 w-16" /> : activeCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading tracking-wider">{engagementRate}%</div>
            <Progress value={engagementRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>All {pagination.totalCount} subscribers in your list.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: "all" | "active" | "inactive") => setStatusFilter(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                    <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No subscribers match your filters.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Subscribed On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {new Date(sub.subscribedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {sub.active ? (
                            <Badge variant="default" className="gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1.5">
                              <XCircle className="h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unsubscribeMutation.mutate(sub.email)}
                            disabled={unsubscribeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Mail className="h-10 w-10 text-muted-foreground/40" />
          <h3 className="font-heading text-lg tracking-wider">Campaigns</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Email campaigns require Mailchimp, SendGrid, or Brevo integration. Export your CSV and import it into your email provider to send campaigns.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminNewsletterManager;
