import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Users,
  MapPin,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsApi, Event } from "@/api/events";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const EVENT_TYPES = ["conference", "workshop", "outreach", "online", "meetup"] as const;

interface EventForm {
  title: string;
  description: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  type: (typeof EVENT_TYPES)[number];
  capacity: number;
  registrationUrl: string;
  image: string;
  isActive: boolean;
}

const emptyForm: EventForm = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  time: "",
  location: "",
  type: "conference",
  capacity: 0,
  registrationUrl: "",
  image: "",
  isActive: true,
};

const AdminEvents = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => eventsApi.getAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] });

  const saveMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        capacity: Number(data.capacity) || 0,
      };
      if (editing?.id || editing?._id) {
        return eventsApi.update(editing.id || editing._id!, payload as never);
      }
      return eventsApi.create(payload as never);
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: editing ? "Event updated" : "Event created" });
    },
    onError: (err) => {
      toast({
        title: "Could not save event",
        description: (err as { message?: string })?.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description,
      date: e.date ? new Date(e.date).toISOString().slice(0, 16) : "",
      endDate: (e as Event & { endDate?: string }).endDate
        ? new Date((e as Event & { endDate?: string }).endDate!).toISOString().slice(0, 16)
        : "",
      time: e.time || "",
      location: e.location || "",
      type: (e.type as EventForm["type"]) || "conference",
      capacity: (e as Event & { capacity?: number }).capacity || 0,
      registrationUrl: e.registrationUrl || "",
      image: e.imageUrl || "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const filtered = events.filter(
    (e) =>
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl tracking-wider">Events</h1>
          <p className="text-muted-foreground text-sm">Create and manage movement events</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events…"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No events yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e, i) => {
            const id = e.id || e._id || "";
            const isActive = (e as Event & { isActive?: boolean }).isActive !== false;
            const capacity = (e as Event & { capacity?: number }).capacity || 0;
            const registered = (e as Event & { registeredCount?: number }).registeredCount || 0;
            const past = e.date ? new Date(e.date) < new Date() : false;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-lg leading-tight">{e.title}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={past ? "secondary" : "default"} className="capitalize">
                          {e.type}
                        </Badge>
                        {past && <Badge variant="outline">Past</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {e.description}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-accent" />
                        {e.date ? format(new Date(e.date), "EEE, MMM d, yyyy") : "TBD"}
                        {e.time ? ` · ${e.time}` : ""}
                      </p>
                      {e.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          {e.location}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        {registered} registered{capacity > 0 ? ` / ${capacity} capacity` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            saveMutation.mutate({ ...form, ...e, isActive: checked } as EventForm)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {isActive ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(e)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete "${e.title}"? This cannot be undone.`)) {
                              deleteMutation.mutate(id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <div>
              <label className="text-sm mb-1.5 block">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm mb-1.5 block">Description *</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1.5 block">Date & time *</label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm mb-1.5 block">End date/time</label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1.5 block">Time label (e.g. "10:00 AM")</label>
                <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div>
                <label className="text-sm mb-1.5 block">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / Venue / Online" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1.5 block">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EventForm["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm mb-1.5 block">Capacity (0 = unlimited)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm mb-1.5 block">External registration URL (optional)</label>
              <Input
                value={form.registrationUrl}
                onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Visible on site</p>
                <p className="text-xs text-muted-foreground">Hidden events don't appear publicly</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                editing ? "Save changes" : "Create event"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
