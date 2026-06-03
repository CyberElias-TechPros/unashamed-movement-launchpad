import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { mediaApi } from "@/api/media";
import { Check, X } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

const MediaPicker = ({ open, onOpenChange, onSelect }: MediaPickerProps) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setLoading(true);
      mediaApi.getAll?.()
        .then((data) => setItems(data || []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filtered = searchQuery
    ? items.filter((item) => item.url.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-border rounded bg-background"
          />

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.length === 0 && (
                <p className="text-muted-foreground col-span-full">No media files found.</p>
              )}
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-2 cursor-pointer hover:border-accent transition-colors"
                  onClick={() => {
                    onSelect(item.url);
                    onOpenChange(false);
                  }}
                >
                  <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                    {item.url.includes('.mp4') || item.url.includes('.webm') ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPicker;