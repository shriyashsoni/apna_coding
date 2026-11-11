import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface NewsForm {
  title: string;
  slug: string;
  content: string;
  category: string;
  cover_image: string;
  is_published: boolean;
  is_featured: boolean;
}

export function NewsPostEditor({ post, onClose, onSaved }: {
  post: any;
  onClose: () => void;
  onSaved: (post: any) => void;
}) {
  const [form, setForm] = useState<NewsForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
    setForm(post ? {
      title: post.title || "", slug: post.slug || "", content: post.content || "",
      category: post.category || "", cover_image: post.cover_image || "",
      is_published: !!post.is_published, is_featured: !!post.is_featured,
    } : null);
  }, [post]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || !post || saving) return;
    const payload = {
      title: form.title.trim(), slug: form.slug.trim(), content: form.content,
      category: form.category.trim() || null, cover_image: form.cover_image.trim() || null,
      is_published: form.is_published, is_featured: form.is_featured,
    };
    if (!payload.title || !payload.slug || !payload.content.trim()) {
      setError("Title, URL slug, and content are required."); return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      setError("Use lowercase letters, numbers, and single hyphens in the URL slug."); return;
    }
    if (payload.cover_image) {
      try { if (!["http:", "https:"].includes(new URL(payload.cover_image).protocol)) throw new Error(); }
      catch { setError("Cover image must be an http or https URL."); return; }
    }
    setSaving(true); setError("");
    try {
      const { data, error } = await supabase.from("news").update(payload).eq("id", post.id).select("*").single();
      if (error) throw error;
      if (!data || Object.entries(payload).some(([key, value]) => data[key] !== value)) {
        throw new Error("The server did not confirm the requested values. Refresh before retrying.");
      }
      onSaved(data);
      onClose();
      toast.success("News post updated");
    } catch (err: any) {
      setError(err.message || "Could not save news. Your input has been kept.");
    } finally { setSaving(false); }
  };

  return <Dialog open={!!post} onOpenChange={open => { if (!open && !saving) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit News Post</DialogTitle>
        <DialogDescription>Update this post in place. Its ID is preserved. Changing the URL slug changes its public link.</DialogDescription>
      </DialogHeader>
      {form && <form onSubmit={save} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="edit-news-title">Title</Label><Input id="edit-news-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={saving} /></div>
        <div className="space-y-2"><Label htmlFor="edit-news-slug">URL slug</Label><Input id="edit-news-slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required disabled={saving} /></div>
        <div className="space-y-2"><Label htmlFor="edit-news-content">Content (HTML supported)</Label><Textarea id="edit-news-content" className="min-h-[180px]" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required disabled={saving} /></div>
        <div className="space-y-2"><Label htmlFor="edit-news-category">Category (optional)</Label><Input id="edit-news-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} disabled={saving} /></div>
        <div className="space-y-2"><Label htmlFor="edit-news-cover">Cover image URL (optional)</Label><Input id="edit-news-cover" type="url" value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} disabled={saving} /></div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} disabled={saving} />Published</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} disabled={saving} />Featured</label>
        </div>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>}
    </DialogContent>
  </Dialog>;
}
