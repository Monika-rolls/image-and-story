import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Plus, Trash2, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import NeuralBackground from "@/components/NeuralBackground";
import MediaUpload from "@/components/MediaUpload";

interface Post {
  id: string;
  title: string;
  content: string;
  link: string | null;
  image_url: string | null;
  published_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", link: "", image_url: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content required");
      return;
    }
    if (form.title.length > 200 || form.content.length > 5000) {
      toast.error("Content too long");
      return;
    }
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title.trim(),
      content: form.content.trim(),
      link: form.link.trim() || null,
      image_url: form.image_url || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Post added");
      setForm({ title: "", content: "", link: "", image_url: "" });
      setShowForm(false);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <NeuralBackground />
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading text-sm mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to portfolio
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// BLOG</h1>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">Thought Layers</h2>
          <p className="font-body text-muted-foreground mb-8">LinkedIn posts, notes, and longer-form thinking.</p>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-all mb-8"
          >
            <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add post"}
          </button>
        </motion.div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={submit}
            className="mb-12 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4"
          >
            <input
              type="text"
              maxLength={200}
              placeholder="Post title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <textarea
              maxLength={5000}
              placeholder="Paste your LinkedIn post content..."
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none resize-none"
            />
            <input
              type="url"
              maxLength={500}
              placeholder="Original LinkedIn URL (optional)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <MediaUpload
                folder="blog"
                accept="image/*"
                onUploaded={(url) => setForm({ ...form, image_url: url })}
                label="Add image"
              />
              {form.image_url && <img src={form.image_url} alt="" className="h-12 rounded border border-border" />}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 transition-all"
            >
              Publish
            </button>
          </motion.form>
        )}

        <div className="space-y-6">
          {loading && <p className="font-body text-muted-foreground">Loading...</p>}
          {!loading && posts.length === 0 && (
            <div className="p-12 rounded-xl border border-dashed border-border text-center">
              <Linkedin className="w-12 h-12 text-primary/40 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">No posts yet. Click "Add post" to paste your first one.</p>
            </div>
          )}
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-1">{post.title}</h3>
                  <time className="font-display text-xs tracking-wider text-muted-foreground">
                    {format(new Date(post.published_at), "MMM d, yyyy")}
                  </time>
                </div>
                <button
                  onClick={() => remove(post.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded text-muted-foreground hover:text-destructive"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="w-full max-h-96 object-cover rounded-lg mb-4 border border-border" />
              )}
              <p className="font-body text-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-heading text-xs tracking-wider hover:gap-3 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on LinkedIn
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Blog;
