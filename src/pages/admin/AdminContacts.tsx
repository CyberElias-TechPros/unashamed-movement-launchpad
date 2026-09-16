import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  MailOpen,
  Mail,
  Trash2,
  Reply,
  Search,
  Loader2,
  ArrowLeft,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactApi, ContactMessage } from "@/api/contact";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminContacts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contacts", page, search, readFilter],
    queryFn: () =>
      contactApi.list({
        page,
        limit: 10,
        search: search || undefined,
        isRead: readFilter === "all" ? undefined : readFilter,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
  };

  const markReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => contactApi.markRead(id, isRead),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactApi.remove(id),
    onSuccess: () => {
      invalidate();
      setSelected(null);
      toast({ title: "Message deleted" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => contactApi.reply(id, reply),
    onSuccess: () => {
      invalidate();
      setReplyText("");
      toast({ title: "Reply sent", description: "The sender will receive your reply by email." });
    },
    onError: (err) => {
      toast({
        title: "Reply failed",
        description: (err as { message?: string })?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const messages = data?.data || [];
  const pagination = data?.pagination;
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl tracking-wider">Contact Inbox</h1>
          <p className="text-muted-foreground text-sm">
            Messages from the contact form · {unread} unread
          </p>
        </div>
      </div>

      {/* Detail view */}
      {selected ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MailOpen className="w-5 h-5 text-accent" />
                Message from {selected.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selected.email} ·{" "}
                {selected.createdAt ? format(new Date(selected.createdAt), "MMM d, yyyy HH:mm") : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to inbox
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/40 p-4 whitespace-pre-wrap">
              {selected.message}
            </div>

            <div className="space-y-2">
              <label htmlFor="reply" className="font-body text-sm font-medium">
                Reply by email
              </label>
              <textarea
                id="reply"
                rows={5}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Hi ${selected.name}, thanks for reaching out…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => replyMutation.mutate({ id: selected.id, reply: replyText })}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `mailto:${selected.email}`;
                  }}
                >
                  <Reply className="w-4 h-4 mr-2" /> Open in mail app
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, or message…"
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={readFilter}
              onValueChange={(v) => {
                setReadFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No messages{search ? " match your search" : " yet"}.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((m) => (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`cursor-pointer hover:bg-muted/50 ${!m.isRead ? "font-medium" : ""}`}
                        onClick={() => {
                          setSelected(m);
                          if (!m.isRead) markReadMutation.mutate({ id: m.id, isRead: true });
                        }}
                      >
                        <TableCell>
                          {m.isRead ? (
                            <MailOpen className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Mail className="w-4 h-4 text-accent" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                        </TableCell>
                        <TableCell className="max-w-[380px]">
                          <span className="line-clamp-1">{m.message}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {m.createdAt ? format(new Date(m.createdAt), "MMM d, HH:mm") : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {!m.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Mark as read"
                                onClick={() => markReadMutation.mutate({ id: m.id, isRead: true })}
                              >
                                <MailOpen className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              onClick={() => deleteMutation.mutate(m.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} messages)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminContacts;
