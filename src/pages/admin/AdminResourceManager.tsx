import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Plus, Edit, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "@/api/resources";
import MediaPicker from "@/components/MediaPicker";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  author: string;
  description: string;
  type: "book" | "devotional" | "guide" | "article" | "podcast";
  downloadUrl: string;
  free: boolean;
  category: string;
  imageUrl: string;
}

const emptyResource: Resource = {
  id: "",
  title: "",
  author: "",
  description: "",
  type: "book",
  downloadUrl: "",
  free: true,
  category: "",
  imageUrl: "",
};

const resourceTypes = ["book", "devotional", "guide", "article", "podcast"] as const;

const AdminResourceManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Resource | null>(null);
  const [open, setOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", "admin"],
    queryFn: () => resourcesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Resource, "id">) =>
      resourcesApi.create({
        title: data.title,
        author: data.author,
        description: data.description,
        type: data.type,
        downloadUrl: data.downloadUrl,
        free: data.free,
        category: data.category,
        imageUrl: data.imageUrl,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", "admin"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resource> }) =>
      resourcesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", "admin"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources", "admin"] }),
  });

  const openAddModal = () => {
    setEditing({ ...emptyResource });
    setOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditing({ ...resource });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title) return;
    try {
      const payload = {
        title: editing.title,
        author: editing.author,
        description: editing.description,
        type: editing.type,
        downloadUrl: editing.downloadUrl,
        free: editing.free,
        category: editing.category,
        imageUrl: editing.imageUrl,
      };
      if (editing.id) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload as Omit<Resource, "id">);
      }
      setOpen(false);
      setEditing(null);
    } catch {
      toast({ title: "Error", description: "Failed to save resource.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage downloads, guides, and media.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileDown className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No resources yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Add your first resource to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{resource.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{resource.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resource.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={resource.imageUrl} alt={resource.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant={resource.free ? "default" : "outline"}>{resource.free ? "Free" : "Paid"}</Badge>
                  <span className="ml-auto">By {resource.author || "Unknown"}</span>
                </div>
                <div className="flex justify-end gap-1 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(resource)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resource.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading tracking-wider">
              {editing?.id && editing.id !== "" ? "Edit" : "New"} Resource
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="Resource title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as Resource["type"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="e.g., Evangelism, Prayer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Download URL</Label>
                  <Input
                    type="url"
                    value={editing.downloadUrl}
                    onChange={(e) => setEditing({ ...editing, downloadUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Resource"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={editing.imageUrl}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMediaPickerOpen(true)}
                    aria-label="Select from media library"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {editing.imageUrl && (
                  <img src={editing.imageUrl} alt="Cover preview" className="mt-2 h-24 object-cover rounded-md" loading="lazy" />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => setEditing({ ...editing!, imageUrl: url })}
      />
    </div>
  );
};

export default AdminResourceManager;
