import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mediaApi } from "@/api/media";

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  createdAt: string;
}

const AdminMedia = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadItems = async () => {
    try {
      const data = await mediaApi.list();
      setItems(data);
    } catch (e) {
      console.error('Failed to load media', e);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await mediaApi.upload(file);
      const newItem: MediaItem = {
        id: result.filename,
        url: result.url,
        publicId: result.filename,
        filename: result.filename,
        createdAt: new Date().toISOString(),
      };
      setItems([newItem, ...items]);
      setFile(null);
      setUrlInput("");
      loadItems();
    } catch (error) {
      console.error(error);
      alert("Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="font-heading text-3xl tracking-wider">Media Library</h2>
          <p className="text-muted-foreground">Upload and manage media files</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Upload images or videos to server storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>File Upload</Label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-border rounded bg-background"
              />
            </div>
            <div>
              <Label>Or URL</Label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full p-2 border border-border rounded bg-background"
              />
            </div>
            <Button onClick={handleUpload} disabled={uploading || !file}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground">No media uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-3">
                    <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                      {item.url.match(/\.(mp4|webm)$/i) ? (
                        <video src={item.url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.url)}
                        title="Copy URL"
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(item.url, '_blank')}
                        title="Open"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMedia;
