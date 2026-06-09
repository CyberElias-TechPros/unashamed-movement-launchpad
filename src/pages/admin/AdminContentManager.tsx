import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";
import { Save, Image as ImageIcon, Globe, Eye, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { contentApi } from "@/api/content";
import MediaPicker from "@/components/MediaPicker";

interface ContentSection {
  key: string;
  title: string;
  content: string;
  type: string;
  imageUrl?: string;
  updatedAt?: string;
}

const ContentSections: { key: string; label: string; description: string }[] = [
  { key: "hero", label: "Hero Banner", description: "Main landing banner" },
  { key: "about", label: "About Story", description: "Origin and mission story" },
  { key: "mission", label: "Mission", description: "Core mission statement" },
  { key: "featured", label: "Featured Section", description: "Highlighted content" },
];

// Separate component for the editor to properly use the useEditor hook
const SectionEditor = ({ 
  content, 
  onUpdate, 
  enabled 
}: { 
  content: string; 
  onUpdate: (html: string) => void; 
  enabled: boolean;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    enabled: enabled,
  });

  if (!enabled || !editor) {
    return <div className="min-h-[200px] rounded-md border bg-muted/30" />;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] rounded-md border p-3">
      <EditorContent editor={editor} />
    </div>
  );
};

const AdminContentManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["content", "all"],
    queryFn: async () => {
      const results = await Promise.all(
        ContentSections.map((s) =>
          contentApi.getByKey(s.key).catch(() => ({
            key: s.key,
            title: s.label,
            content: "",
            type: s.key,
            imageUrl: "",
          })),
        ),
      );
      return results as ContentSection[];
    },
  });

  const currentSection =
    sections.find((s) => s.key === activeTab) || { key: activeTab, title: "", content: "", imageUrl: "" };

  const updateLocal = (updates: Partial<ContentSection>) => {
    const current = sections.find((s) => s.key === activeTab) || {
      key: activeTab,
      title: "",
      content: "",
      imageUrl: "",
    };
    const newSections = sections.map((s) => (s.key === activeTab ? { ...s, ...updates } : s));
    queryClient.setQueryData(["content", "all"], [...newSections]);
  };

  const handleSave = useMutation({
    mutationFn: async () => {
      const section = sections.find((s) => s.key === activeTab);
      if (!section) return;
      await contentApi.upsert({ key: activeTab, title: section.title, content: section.content, type: activeTab, imageUrl: section.imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setLastSaved(new Date().toLocaleTimeString());
    },
  });

  const handleReset = () => {
    const section = sections.find((s) => s.key === activeTab);
    if (!section) return;
    updateLocal({ content: "" });
  };

  if (isLoading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Content Manager</h1>
          <p className="text-muted-foreground mt-1">
            Edit and manage your website content.
            {lastSaved && <span className="ml-2 text-green-600 text-sm">Saved at {lastSaved}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave.mutate()}
            disabled={handleSave.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {handleSave.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto flex overflow-x-auto">
          {ContentSections.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="whitespace-nowrap">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ContentSections.map((section) => {
          const data = sections.find((s) => s.key === section.key) || { title: "", content: "", imageUrl: "" };

          return (
            <TabsContent key={section.key} value={section.key} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{section.label}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="hidden sm:flex">
                      <Globe className="h-3 w-3 mr-1.5" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={data.title}
                      onChange={(e) => updateLocal({ title: e.target.value })}
                      placeholder="Enter title..."
                    />
                  </div>

                  {activeTab !== "hero" && (
                    <div className="space-y-2">
                      <Label>Banner Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={data.imageUrl || ""}
                          onChange={(e) => updateLocal({ imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => setMediaPickerOpen(true)}>
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {data.imageUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                          <img src={data.imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "hero" && (
                    <div className="space-y-2">
                      <Label>Banner Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={data.imageUrl || ""}
                          onChange={(e) => updateLocal({ imageUrl: e.target.value })}
                          placeholder="https://example.com/hero.jpg"
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => setMediaPickerOpen(true)}>
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {data.imageUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                          <img src={data.imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <div className="rounded-lg border bg-background">
                      {activeTab === "hero" ? (
                        <Textarea
                          value={data.content}
                          onChange={(e) => updateLocal({ content: e.target.value })}
                          rows={5}
                          placeholder="Hero description text..."
                          className="border-0 focus-visible:ring-0"
                        />
                      ) : (
                        <SectionEditor
                          content={data.content}
                          onUpdate={(html) => updateLocal({ content: html })}
                          enabled={activeTab === section.key}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      className="min-w-32"
                      onClick={() => handleSave.mutate()}
                      disabled={handleSave.isPending}
                    >
                      {handleSave.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => updateLocal({ imageUrl: url })}
      />
    </motion.div>
  );
};

export default AdminContentManager;