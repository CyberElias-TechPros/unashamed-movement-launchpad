import { useState, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { contentApi } from "@/api/content";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [heroTitle, setHeroTitle] = useState("UNASHAMED");
  const [heroDesc, setHeroDesc] = useState("");
  const [aboutStory, setAboutStory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      contentApi.getByKey("hero").catch(() => null),
      contentApi.getByKey("about").catch(() => null),
    ]).then(([hero, about]) => {
      if (hero) {
        setHeroTitle(hero.title || heroTitle);
        setHeroDesc(hero.content || "");
      }
      if (about) setAboutStory(about.content || "");
    });
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: aboutStory,
    onUpdate: ({ editor }) => setAboutStory(editor.getHTML()),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        contentApi.upsert({ key: "hero", title: heroTitle, content: heroDesc, type: "hero" }),
        contentApi.upsert({ key: "about", title: "About", content: aboutStory, type: "about" }),
      ]);
      alert("Content saved to API");
    } catch (error) {
      console.error(error);
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="font-heading text-3xl tracking-wider">Content Management</h2>
          <p className="text-muted-foreground">Persisted via /api/content</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main banner content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} rows={4} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
            <CardDescription>Origin story</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TipTap rich text editor */}
            {editor ? (
              <div className="prose max-w-none">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <Textarea value={aboutStory} onChange={(e) => setAboutStory(e.target.value)} rows={8} />
            )}
          </CardContent>
        </Card>

        <Button variant="hero" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AdminContentManager;
