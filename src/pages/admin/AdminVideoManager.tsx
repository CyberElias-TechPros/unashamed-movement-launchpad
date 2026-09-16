import { useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoIcon, Plus, Trash2, Search, Eye, ExternalLink, Image as ImageIcon, Edit, CheckSquare, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { videosApi, type Video } from "@/api/videos";
import MediaPicker from "@/components/MediaPicker";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Pagination, PaginationInfo, PageSizeSelector } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

type VideoType = "youtube" | "external" | "upload";

const AdminVideoManager = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState<VideoType>("youtube");
  const [thumbnail, setThumbnail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const {
    data: videos,
    pagination,
    isLoading,
    page,
    limit,
    setPage,
    setLimit,
    refresh,
  } = usePaginatedQuery<Video>({
    endpoint: "/videos/admin/all",
    queryKey: ["videos", "admin"],
  });

  // Client-side filtering
  const filteredVideos = videos.filter((v: Video) => {
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? v.isActive : !v.isActive);
    return matchesSearch && matchesStatus;
  });

  const addMutation = useMutation({
    mutationFn: () =>
      videosApi.create({
        title,
        youtubeUrl: url,
        description,
        thumbnailUrl: thumbnail,
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      refresh();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Video> }) => videosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      refresh();
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => videosApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setSelectedIds([]);
      refresh();
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Video> }) => videosApi.bulkUpdate(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setSelectedIds([]);
      refresh();
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState({
    title: "",
    url: "",
    description: "",
    thumbnail: "",
    isActive: true,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleEdit = useCallback((v: Video) => {
    setEditingId(v._id || v.id || null);
    setEditingFields({
      title: v.title || "",
      url: v.youtubeUrl || v.url || "",
      description: v.description || "",
      thumbnail: v.thumbnailUrl || v.thumbnail || "",
      isActive: v.isActive ?? true,
    });
    setTitle(v.title || "");
    setUrl(v.youtubeUrl || v.url || "");
    setDescription(v.description || "");
    setThumbnail(v.thumbnailUrl || v.thumbnail || "");
  }, [setTitle, setUrl, setDescription, setThumbnail]);

  const handleUpdate = useCallback(async () => {
    if (!editingId || !title.trim() || !url.trim()) return;
    await updateMutation.mutateAsync({
      id: editingId,
      data: { title, youtubeUrl: url, description, thumbnailUrl: thumbnail, isActive: editingFields.isActive },
    });
    setEditingId(null);
    setTitle("");
    setUrl("");
    setDescription("");
    setThumbnail("");
    setVideoType("youtube");
  }, [editingId, editingFields, title, url, description, thumbnail, updateMutation]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setDescription("");
    setThumbnail("");
    setVideoType("youtube");
  }, []);

  const handleAdd = useCallback(async () => {
    if (!title.trim()) return;
    if (videoType === "upload" && videoFile) {
      try {
        await videosApi.upload(videoFile);
        setTitle("");
        setUrl("");
        setDescription("");
        setThumbnail("");
        setVideoFile(null);
        setVideoType("youtube");
        refresh();
        return;
      } catch (e) {
        console.error(e);
        alert("Failed to upload video");
        return;
      }
    }
    if (!url.trim()) return;
    await addMutation.mutateAsync();
    setTitle("");
    setUrl("");
    setDescription("");
    setVideoFile(null);
    setVideoType("youtube");
    setThumbnail("");
  }, [title, url, videoType, videoFile, addMutation, refresh]);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match?.[1];
  };

  const getVideoType = (u: string): VideoType => {
    const ytId = getYouTubeId(u);
    if (ytId) return "youtube";
    if (u.endsWith(".mp4") || u.endsWith(".webm")) return "upload";
    return "external";
  };

  const getThumbnailUrl = (video: Video) => {
    const videoUrl = video.youtubeUrl || video.url || "";
    if (video.thumbnailUrl || video.thumbnail) return video.thumbnailUrl || video.thumbnail || "";
    const ytId = getYouTubeId(videoUrl);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return videoUrl;
  };

  const currentPreset =
    videoType === "youtube"
      ? "https://www.youtube.com/watch?v="
      : videoType === "upload"
      ? "https://example.com/video.mp4"
      : "https://example.com/video.html";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Videos</h1>
          <p className="text-muted-foreground mt-1">Embed and manage videos.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Video" : "Add Video"}</CardTitle>
          <CardDescription>{editingId ? "Update video details." : "Paste a YouTube URL, upload video, or embed external link."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant={videoType === "youtube" ? "default" : "outline"}
              size="sm"
              onClick={() => setVideoType("youtube")}
              className="justify-start"
            >
              <Eye className="mr-2 h-4 w-4" />
              YouTube
            </Button>
            <Button
              variant={videoType === "external" ? "default" : "outline"}
              size="sm"
              onClick={() => setVideoType("external")}
              className="justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              External
            </Button>
            <Button
              variant={videoType === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setVideoType("upload")}
              className="justify-start"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Uploaded
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunday Service Highlights"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              {videoType === "upload" ? (
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              ) : (
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (e.target.value) {
                      const detected = getVideoType(e.target.value);
                      setVideoType(detected);
                    }
                  }}
                  placeholder={currentPreset}
                />
              )}
              {url && videoType !== "upload" && (
                <p className="text-xs text-muted-foreground">
                  Detected type: <Badge variant="secondary" className="text-xs">{videoType}</Badge>
                </p>
              )}
              {videoType === "upload" && (
                <p className="text-xs text-muted-foreground">
                  Detected type: <Badge variant="secondary" className="text-xs">upload</Badge>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the video..."
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Thumbnail image URL"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => setMediaPickerOpen(true)}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              {videoType === "youtube" && url && !thumbnail && (
                <p className="text-xs text-muted-foreground">
                  YouTube thumbnail will be auto-detected from the video ID.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {editingId && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={addMutation.isPending || updateMutation.isPending || !title.trim() || (videoType !== "upload" && !url.trim())}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {editingId
                  ? (updateMutation.isPending ? "Saving..." : "Update Video")
                  : (addMutation.isPending ? "Adding..." : "Add Video")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Video Library</CardTitle>
              <CardDescription>{pagination.totalCount} videos in your library.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:flex-none sm:w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: "all" | "published" | "draft") => setStatusFilter(v)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button
                size="sm"
                onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { isActive: true } })}
                disabled={bulkUpdateMutation.isPending}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { isActive: false } })}
                disabled={bulkUpdateMutation.isPending}
              >
                Unpublish
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          )}

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
              options={[9, 18, 36, 72]}
            />
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-16" />
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <VideoIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No videos yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add your first video above.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map((v) => {
                  const videoId = v._id || v.id || "";
                  const isSelected = selectedIds.includes(videoId);
                  return (
                  <Card key={videoId} className={`overflow-hidden transition-all hover:shadow-md group ${isSelected ? "ring-2 ring-primary" : ""}`}>
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={getThumbnailUrl(v)}
                        alt={v.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' fill='%23e5e7eb'%3E%3Crect width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3ENo Thumbnail%3C/text%3E%3C/svg%3E")}
                      />
                      <button
                        onClick={() => {
                          setSelectedIds(prev => 
                            isSelected ? prev.filter(id => id !== videoId) : [...prev, videoId]
                          );
                        }}
                        className="absolute top-3 left-3 z-10 text-white drop-shadow-md hover:scale-110 transition-transform"
                      >
                        {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                      </button>
                      <Badge variant={v.isActive ? "default" : "secondary"} className="absolute top-3 left-12">
                        {v.isActive ? "Published" : "Draft"}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(v.youtubeUrl || v.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm truncate">{v.title}</CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">{v.youtubeUrl || v.url}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {v.episode || "video"}
                        </Badge>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 mr-1"
                            onClick={() => handleEdit(v)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(v._id || v.id || "")}
                            className="text-destructive hover:text-destructive h-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
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

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => setThumbnail(url)}
      />
    </div>
  );
};

export default AdminVideoManager;
