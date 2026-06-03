import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileDown, Plus, Edit, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resourcesApi, Resource as ApiResource } from "@/api/resources";
import MediaPicker from "@/components/MediaPicker";

interface Resource {
  id: string;
  title: string;
  author: string;
  description: string;
  type: "book" | "devotional" | "guide" | "article" | "podcast";
  downloadUrl: string;
  free: boolean;
  category: string;
}

const AdminResourceManager = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await resourcesApi.getAll();
        setResources(
          data.map((r: ApiResource) => ({
            id: r._id || r.id || '',
            title: r.title,
            author: r.author || '',
            description: r.description,
            type: r.type,
            downloadUrl: r.downloadUrl,
            free: r.free ?? true,
            category: r.category || '',
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const reload = async () => {
    const data = await resourcesApi.getAll();
    setResources(
      data.map((r: ApiResource) => ({
        id: r._id || r.id || "",
        title: r.title,
        author: r.author || "",
        description: r.description,
        type: r.type,
        downloadUrl: r.downloadUrl,
        free: r.free ?? true,
        category: r.category || "",
      }))
    );
  };

  const handleSave = async () => {
    if (!editingResource) return;
    try {
      const payload = {
        title: editingResource.title,
        author: editingResource.author,
        description: editingResource.description,
        type: editingResource.type,
        downloadUrl: editingResource.downloadUrl,
        free: editingResource.free,
        category: editingResource.category,
        imageUrl: editingResource.imageUrl,
      };
      if (isEditing) await resourcesApi.update(isEditing, payload);
      else await resourcesApi.create(payload);
      await reload();
      setIsEditing(null);
      setEditingResource(null);
    } catch (error) {
      console.error(error);
      alert("Failed to save resource");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resourcesApi.delete(id);
      await reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl tracking-wider text-foreground mb-2">
              Resources Management
            </h2>
            <p className="text-muted-foreground">
              Manage downloadable resources and content
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Resource</CardTitle>
                <CardDescription>
                  Add a new book, guide, or digital resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Resource title"
                      value={editingResource?.title || ""}
                      onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value } as Resource)}
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      placeholder="Author name"
                      value={editingResource?.author || ""}
                      onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value } as Resource)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={editingResource?.type || ""}
                      onValueChange={(v) => setEditingResource({ ...editingResource, type: v as Resource["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="devotional">Devotional</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g., Evangelism, Prayer, Boldness"
                      value={editingResource?.category || ""}
                      onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value } as Resource)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the resource..."
                    rows={3}
                    value={editingResource?.description || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value } as Resource)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Download URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/resource.pdf"
                      value={editingResource?.downloadUrl || ""}
                      onChange={(e) => setEditingResource({ ...editingResource, downloadUrl: e.target.value } as Resource)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSave} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save Resource
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Image (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editingResource?.imageUrl || ""}
                      onChange={(e) => setEditingResource({ ...editingResource, imageUrl: e.target.value } as Resource)}
                      placeholder="Image URL or select from library"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMediaPickerOpen(true)}
                      aria-label="Select from media library"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  {editingResource?.imageUrl && (
                    <img src={editingResource.imageUrl} alt="Preview" className="mt-2 h-20 object-cover rounded" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Resources</CardTitle>
                <CardDescription>
                  {resources.length} resources in library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.length === 0 ? (
                    <div className="text-center py-12">
                      <FileDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No resources yet</p>
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <h4 className="font-heading">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.type} • {resource.category}</p>
                        </div>
                        <div className="flex gap-2">
<Button variant="ghost" size="sm">
                             <Edit className="w-4 h-4" />
                             <span className="sr-only">Edit resource</span>
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => handleDelete(resource.id)}>
                             <Trash2 className="w-4 h-4 text-red-500" />
                             <span className="sr-only">Delete resource</span>
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => setEditingResource({ ...editingResource, imageUrl: url } as Resource)}
      />
    </div>
  );
};

export default AdminResourceManager;