import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { videosApi, Video } from "@/api/videos";

const AdminVideoManager = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    videosApi.getAll().then(setVideos).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      await videosApi.create({ title, url, description, isPublished: true });
      setTitle("");
      setUrl("");
      setDescription("");
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to add video");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await videosApi.delete(id);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="font-heading text-3xl tracking-wider">Video Management</h2>
          <p className="text-muted-foreground">Add YouTube or external video URLs</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Video</CardTitle>
            <CardDescription>Paste a YouTube URL or embed link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Episode title" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleAdd} disabled={saving}>
              <Upload className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Add Video"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Library ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((v) => (
              <div key={v._id || v.id} className="flex justify-between items-start border border-border rounded-lg p-4">
                <div>
                  <p className="font-heading">{v.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-md">{v.url}</p>
                </div>
<Button variant="ghost" size="sm" onClick={() => handleDelete((v._id || v.id)!)}>
                   <Trash2 className="w-4 h-4 text-red-500" />
                   <span className="sr-only">Delete video</span>
                 </Button>
              </div>
            ))}
            {videos.length === 0 && <p className="text-muted-foreground text-sm">No videos yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminVideoManager;
