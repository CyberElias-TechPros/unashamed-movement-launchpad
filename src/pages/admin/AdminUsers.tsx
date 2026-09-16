import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, ShieldCheck, ShieldOff, MailCheck, RotateCcw, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi, User } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserRow extends User {
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search, roleFilter],
    queryFn: () =>
      authApi.adminListUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }: { id: string; role?: "user" | "admin"; isActive?: boolean }) =>
      authApi.adminUpdateUser(id, patch),
    onSuccess: () => {
      invalidate();
      toast({ title: "User updated" });
    },
    onError: (err) => {
      toast({
        title: "Update failed",
        description: (err as { message?: string })?.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => authApi.adminResendVerification(id),
    onSuccess: () => toast({ title: "Verification email sent" }),
  });

  const users: UserRow[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wider">Users</h1>
        <p className="text-muted-foreground text-sm">
          {pagination?.totalCount ?? "—"} registered accounts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No users found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{(u.name || u.email || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {u.name || "—"}
                              {isSelf && <Badge variant="outline" className="text-[10px]">You</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs flex items-center gap-1 ${u.isActive === false ? "text-destructive" : "text-muted-foreground"}`}>
                            {u.isActive === false ? (
                              <>
                                <Ban className="w-3 h-3" /> Deactivated
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </>
                            )}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${u.emailVerified ? "text-emerald-600" : "text-amber-600"}`}>
                            <MailCheck className="w-3 h-3" />
                            {u.emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!u.emailVerified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Resend verification email"
                              onClick={() => resendMutation.mutate(u.id)}
                              disabled={resendMutation.isPending}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {!isSelf && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                                onClick={() =>
                                  updateMutation.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })
                                }
                              >
                                {u.role === "admin" ? (
                                  <ShieldOff className="w-4 h-4" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title={u.isActive === false ? "Reactivate account" : "Deactivate account"}
                                onClick={() => updateMutation.mutate({ id: u.id, isActive: u.isActive === false })}
                              >
                                <Ban className={`w-4 h-4 ${u.isActive === false ? "text-emerald-500" : "text-destructive"}`} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
