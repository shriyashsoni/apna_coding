import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isPublicProduct } from "@/utils/product-visibility";
import { toast } from "sonner";

const fields = [
  ["name", "Project name"], ["slug", "URL slug"],
  ["category", "Category"], ["website_url", "Original project/showcase URL"],
  ["github_url", "Source repository URL (optional)"], ["image_url", "Project image URL (optional)"],
] as const;
type Field = typeof fields[number][0];
type Form = Record<Field, string> & { description: string; published: boolean; is_featured: boolean };
const PAGE_SIZE = 10;

// Admin-only UI mounted under the existing authorized Manage Content tab.
// No automatic publishing or migration of legacy approval fields.
export function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  const creating = !!post?.__draft;
  const [error, setError] = useState("");
  const load = async (append = false) => {
    setLoading(true); setError("");
    try {
      const offset = append ? products.length : 0;
      const { data, error } = await supabase.from("products").select("*")
        .order("created_at", { ascending: false }).order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE);
      if (error) throw error;
      const rows = (data || []).slice(0, PAGE_SIZE);
      setProducts(previous => append ? [...previous, ...rows] : rows);
      setHasMore((data || []).length > PAGE_SIZE);
    } catch (err: any) { setError(err.message || "Could not load products."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const createDraft = () => {
    setError("");
    setPost({ id: crypto.randomUUID(), __draft: true });
    setForm({ name: "", slug: "", category: "", website_url: "", github_url: "", image_url: "", description: "", published: false, is_featured: false });
  };
  const edit = (row: any) => {
    setError(""); setPost(row);
    setForm({ name: row.name || "", slug: row.slug || "", category: row.category || "",
      website_url: row.website_url || "", github_url: row.github_url || "", image_url: row.image_url || "",
      description: row.description || "", published: isPublicProduct(row), is_featured: !!row.is_featured });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || !post || saveLock.current) return;
    if (!form.name.trim() || !form.description.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      setError("Name, description, and a lowercase hyphenated URL slug are required."); return;
    }
    for (const key of ["website_url", "github_url", "image_url"] as const) {
      if (!form[key].trim()) continue;
      try { if (!["http:", "https:"].includes(new URL(form[key].trim()).protocol)) throw new Error(); }
      catch { setError(`${key} must be an http or https URL.`); return; }
    }
    // Staked submissions must finish their on-chain review in Approvals; this
    // editor never requests a wallet transaction or bypasses that review.
    if (post.on_chain_id != null && form.published !== isPublicProduct(post)) {
      setError("Use Approvals for on-chain submissions. This editor cannot change their publication state."); return;
    }
    const payload = { name: form.name.trim(), slug: form.slug.trim(), description: form.description,
      category: form.category.trim() || null, website_url: form.website_url.trim() || null,
      github_url: form.github_url.trim() || null, image_url: form.image_url.trim() || null,
      status: creating ? "pending" : post.on_chain_id != null ? post.status : form.published ? "approved" : "pending",
      is_approved: creating ? false : post.on_chain_id != null ? post.is_approved : form.published,
      is_featured: creating ? false : form.is_featured };
    saveLock.current = true;
    setSaving(true); setError("");
    try {
      let saved: any;
      if (creating) {
        // A stable client-generated row ID survives an uncertain response. A
        // retry recovers that exact save rather than creating a second row.
        const { data: existing, error: lookupError } = await supabase.from("products").select("*").eq("slug", payload.slug).maybeSingle();
        if (lookupError) throw lookupError;
        if (existing) {
          if (existing.id !== post.id) throw new Error("That slug already exists. Use Edit for the saved project instead of creating a duplicate.");
          saved = existing;
        } else {
          const { data, error } = await supabase.from("products").insert({ ...payload, id: post.id }).select("*").single();
          if (error) throw error;
          saved = data;
        }
      } else {
        const { data, error } = await supabase.from("products").update(payload).eq("id", post.id).select("*").single();
        if (error) throw error;
        saved = data;
      }
      if (!saved || saved.id !== post.id || Object.entries(payload).some(([key, value]) => saved[key] !== value)) throw new Error("The server did not confirm the requested values. Refresh before retrying.");
      setProducts(previous => creating ? [saved, ...previous.filter(row => row.id !== saved.id)] : previous.map(row => row.id === saved.id ? saved : row));
      setPost(null); setForm(null); toast.success(creating ? "Draft created. Review its image and credits before publishing." : "Project updated");
    } catch (err: any) { setError(err.message || "Could not save. Your input has been kept."); }
    finally { saveLock.current = false; setSaving(false); }
  };
  return <Card className="border-primary/20 bg-card/50">
    <CardHeader><CardTitle>Manage Products</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">Edit project facts, source links, creator credits, and prototype limitations before publishing. Both approval fields must agree for public display.</p>
      <Button onClick={createDraft} disabled={loading}>Create Project Draft</Button>
      {error && !post && <p role="alert" className="text-destructive">{error}</p>}
      {loading && <p role="status">Loading projects...</p>}
      {!loading && !products.length && !error && <p>No saved projects yet.</p>}
      {products.map(row => <div key={row.id} data-product-id={row.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border border-primary/20">
        <div className="min-w-0 flex-1"><h3 className="font-semibold break-words">{row.name}</h3><p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{row.description}</p>
          <Badge variant={isPublicProduct(row) ? "default" : "secondary"}>{isPublicProduct(row) ? "Published" : "Needs review"}</Badge>
          {row.status === "approved" && !row.is_approved && <p className="text-sm text-muted-foreground">Approval fields disagree. Review and explicitly publish after corrections.</p>}
        </div><Button variant="outline" onClick={() => edit(row)} aria-label={`Edit ${row.name}`}>Edit</Button>
      </div>)}
      {hasMore && <Button disabled={loading} variant="outline" onClick={() => load(true)}>Load More Products</Button>}
      <Button disabled={loading} variant="ghost" onClick={() => load()}>Refresh Products</Button>
    </CardContent>
    <Dialog open={!!post} onOpenChange={open => { if (!open && !saving) { setPost(null); setForm(null); } }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{creating ? "Create Project Draft" : "Edit Project"}</DialogTitle><DialogDescription>New drafts stay unpublished until a separate reviewed edit. Existing rows keep their ID; changing the slug changes its link. Credit the linked creators or repository accurately; do not imply Apna Coding built a third-party project.</DialogDescription></DialogHeader>
        {form && <form onSubmit={save} className="space-y-4">
          {fields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`product-${key}`}>{label}</Label><Input id={`product-${key}`} value={form[key]} disabled={saving} onChange={e => setForm({ ...form, [key]: e.target.value })} /></div>)}
          <div className="space-y-2"><Label htmlFor="product-description">Description, creator/source credits, and prototype limitations</Label><Textarea id="product-description" className="min-h-[160px]" value={form.description} disabled={saving} onChange={e => setForm({ ...form, description: e.target.value })} /><p className="text-xs text-muted-foreground">Plain text. Keep technical claims source-grounded and label hackathon prototypes as prototypes.</p></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} disabled={saving || creating || post.on_chain_id != null} onChange={e => setForm({ ...form, published: e.target.checked })} />Published (approved for public display)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} disabled={saving || creating} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />Featured</label>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => { setPost(null); setForm(null); }}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : creating ? "Create Draft" : "Save Project"}</Button></div>
        </form>}
      </DialogContent>
    </Dialog>
  </Card>;
}
