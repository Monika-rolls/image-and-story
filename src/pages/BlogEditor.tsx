import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Github, ImagePlus, Loader2, LogOut, Save, Send, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import NeuralBackground from "@/components/NeuralBackground";
import BlogMarkdown from "@/components/BlogMarkdown";
import {
  BLOG_REPO,
  deletePost,
  getToken,
  loadPostForEdit,
  readingTime,
  repoUrl,
  savePost,
  setToken,
  slugify,
  uploadMedia,
  verifyToken,
} from "@/lib/blog";

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", slug: "", date: today(), excerpt: "", tags: "", cover: "", link: "", body: "" });
type Form = ReturnType<typeof emptyForm>;

const draftKey = (slug?: string) => `blog-draft:${slug || "new"}`;
const loadLocalDraft = (slug?: string): Form | null => {
  try {
    const raw = localStorage.getItem(draftKey(slug));
    return raw ? { ...emptyForm(), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
};
const saveLocalDraft = (slug: string | undefined, form: Form | null) => {
  try {
    if (form) localStorage.setItem(draftKey(slug), JSON.stringify(form));
    else localStorage.removeItem(draftKey(slug));
  } catch {
    // storage unavailable: no autosave
  }
};

const inputCls =
  "w-full px-3 py-2 rounded-md bg-background border border-border text-foreground font-body text-sm focus:border-primary outline-none";
const labelCls = "block font-display text-[11px] tracking-[0.2em] text-muted-foreground mb-1.5";

const ConnectGitHub = ({ onConnected }: { onConnected: () => void }) => {
  const [token, setTokenInput] = useState("");
  const [busy, setBusy] = useState(false);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setToken(token.trim());
    try {
      if (!(await verifyToken())) throw new Error(`This token can't write to ${BLOG_REPO}`);
      toast.success("Connected to GitHub");
      onConnected();
    } catch (err) {
      setToken("");
      toast.error(err instanceof Error ? err.message : "Could not verify token");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={connect} className="max-w-xl p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-3">
        <Github className="w-6 h-6 text-primary" />
        <h2 className="font-heading text-xl font-semibold text-foreground">Connect GitHub to write</h2>
      </div>
      <p className="font-body text-sm text-muted-foreground leading-relaxed">
        Posts are saved as Markdown files in <code className="text-primary">{BLOG_REPO}/content/blog</code>. Paste a{" "}
        <a
          href="https://github.com/settings/personal-access-tokens/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4"
        >
          fine-grained personal access token
        </a>{" "}
        with access to <strong>only this repository</strong> and <strong>Contents: Read and write</strong> permission. It stays in
        this browser only.
      </p>
      <input
        type="password"
        autoComplete="off"
        required
        placeholder="github_pat_..."
        value={token}
        onChange={(e) => setTokenInput(e.target.value)}
        className={inputCls}
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Connect
      </button>
    </form>
  );
};

const BlogEditor = () => {
  const { slug: editSlug } = useParams();
  const isNew = !editSlug;
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [connected, setConnected] = useState(!!getToken());
  const [form, setForm] = useState<Form>(() => (isNew && loadLocalDraft()) || emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState<"" | "draft" | "publish" | "delete" | "image" | "cover">("");
  const [tab, setTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (isNew || !connected) return;
    loadPostForEdit(editSlug)
      .then((post) => {
        if (!post) {
          toast.error("Post not found");
          navigate("/blog/write");
          return;
        }
        const remote: Form = { ...post, tags: post.tags.join(", ") };
        const local = loadLocalDraft(editSlug);
        if (local && JSON.stringify(local) !== JSON.stringify(remote)) {
          setForm(local);
          toast("Restored your unsaved changes", { action: { label: "Discard", onClick: () => setForm(remote) } });
        } else setForm(remote);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [editSlug, isNew, connected, navigate]);

  useEffect(() => {
    if (!loading) saveLocalDraft(editSlug, form);
  }, [form, editSlug, loading]);

  const set = (patch: Partial<Form>) =>
    setForm((f) => {
      const next = { ...f, ...patch };
      if (isNew && !slugTouched && patch.title !== undefined) next.slug = slugify(patch.title);
      return next;
    });

  const insertAtCursor = (text: string) => {
    const el = bodyRef.current;
    const pos = el ? el.selectionStart : form.body.length;
    set({ body: form.body.slice(0, pos) + text + form.body.slice(pos) });
  };

  const upload = async (file: File, target: "image" | "cover") => {
    setBusy(target);
    try {
      if (target === "cover" && !file.type.startsWith("image/")) throw new Error("Cover must be an image");
      const url = await uploadMedia(file);
      if (target === "cover") set({ cover: url });
      else insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n`);
      toast.success(`${file.type.startsWith("video/") ? "Video" : "Image"} uploaded to GitHub`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const save = async (draft: boolean) => {
    if (!form.title.trim() || !form.body.trim()) return toast.error("Title and content are required");
    if (!form.slug) return toast.error("Slug is required");
    setBusy(draft ? "draft" : "publish");
    try {
      const saved = await savePost(
        {
          slug: form.slug,
          title: form.title.trim(),
          date: form.date || today(),
          excerpt: form.excerpt.trim(),
          tags: form.tags.split(",").map((t) => slugify(t)).filter(Boolean),
          cover: form.cover.trim(),
          link: form.link.trim(),
          draft,
          body: form.body,
          readingTime: 0,
        },
        isNew,
      );
      saveLocalDraft(editSlug, null);
      toast.success(draft ? "Draft saved to GitHub" : "Published! Live in about a minute.");
      navigate(draft ? `/blog/edit/${saved.slug}` : `/blog/${saved.slug}`, { replace: isNew });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!editSlug || !confirm(`Delete "${form.title}"? This removes the file from GitHub.`)) return;
    setBusy("delete");
    try {
      await deletePost(editSlug, form.title);
      saveLocalDraft(editSlug, null);
      toast.success("Post deleted");
      navigate("/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy("");
    }
  };

  const disconnect = () => {
    setToken("");
    setConnected(false);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <NeuralBackground />
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-heading text-sm hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>
          {connected && (
            <button onClick={disconnect} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-heading text-xs">
              <LogOut className="w-3.5 h-3.5" /> Disconnect GitHub
            </button>
          )}
        </div>

        <h1 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// {isNew ? "NEW POST" : "EDIT POST"}</h1>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">{isNew ? "Write something" : form.title || "Loading..."}</h2>

        {!connected ? (
          <ConnectGitHub onConnected={() => setConnected(true)} />
        ) : loading ? (
          <p className="font-body text-muted-foreground">Loading post from GitHub...</p>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
            <div className="space-y-4 min-w-0">
              <input
                maxLength={200}
                placeholder="Post title"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                className={`${inputCls} text-xl font-heading py-3`}
              />

              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
                  <div className="flex gap-1">
                    {(["write", "preview"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1 rounded font-heading text-xs capitalize transition-all ${
                          tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t === "preview" && <Eye className="w-3.5 h-3.5 inline mr-1" />}
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[11px] text-muted-foreground">{readingTime(form.body)} min read</span>
                    <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-primary/30 text-primary font-heading text-xs cursor-pointer hover:bg-primary/10">
                      {busy === "image" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                      Image / video
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        disabled={!!busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) upload(f, "image");
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
                {tab === "write" ? (
                  <textarea
                    ref={bodyRef}
                    value={form.body}
                    onChange={(e) => set({ body: e.target.value })}
                    placeholder={"Write in Markdown...\n\n## A heading\n\nSome **bold** text, a [link](https://...), and code:\n\n```python\nprint('hello')\n```\n\nPaste a YouTube / Vimeo / Loom link on its own line to embed the video."}
                    className="w-full min-h-[60vh] p-4 bg-transparent text-foreground font-mono text-sm leading-relaxed outline-none resize-y"
                  />
                ) : (
                  <div className="p-6 min-h-[60vh]">
                    {form.body.trim() ? <BlogMarkdown>{form.body}</BlogMarkdown> : <p className="text-muted-foreground">Nothing to preview yet.</p>}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-4">
                <div>
                  <label className={labelCls}>SLUG (URL)</label>
                  <input
                    value={form.slug}
                    disabled={!isNew}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set({ slug: slugify(e.target.value) });
                    }}
                    className={`${inputCls} disabled:opacity-60`}
                  />
                  <p className="mt-1 font-body text-[11px] text-muted-foreground break-all">/blog/{form.slug || "..."}</p>
                </div>
                <div>
                  <label className={labelCls}>DATE</label>
                  <input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>EXCERPT</label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    placeholder="Short summary (auto-generated if empty)"
                    value={form.excerpt}
                    onChange={(e) => set({ excerpt: e.target.value })}
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>TAGS</label>
                  <input placeholder="ai, agents, rag" value={form.tags} onChange={(e) => set({ tags: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>COVER IMAGE</label>
                  <input placeholder="https://..." value={form.cover} onChange={(e) => set({ cover: e.target.value })} className={inputCls} />
                  <label className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-primary/30 text-primary font-heading text-xs cursor-pointer hover:bg-primary/10">
                    {busy === "cover" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload cover
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(f, "cover");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {form.cover && <img src={form.cover} alt="" className="mt-2 rounded border border-border max-h-32 w-full object-cover" />}
                </div>
                <div>
                  <label className={labelCls}>ORIGINAL LINK (OPTIONAL)</label>
                  <input
                    type="url"
                    placeholder="LinkedIn / Medium URL"
                    value={form.link}
                    onChange={(e) => set({ link: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => save(false)}
                  disabled={!!busy}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-heading text-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {busy === "publish" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
                </button>
                <button
                  onClick={() => save(true)}
                  disabled={!!busy}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-primary/30 text-primary font-heading text-sm hover:bg-primary/10 disabled:opacity-60 transition-all"
                >
                  {busy === "draft" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save as draft
                </button>
                {!isNew && (
                  <button
                    onClick={remove}
                    disabled={!!busy}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-muted-foreground hover:text-destructive font-heading text-sm disabled:opacity-60 transition-all"
                  >
                    {busy === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete post
                  </button>
                )}
              </div>
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                Each save is a commit to{" "}
                <a href={repoUrl()} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                  {BLOG_REPO}
                </a>
                . Your work is autosaved in this browser until you save.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogEditor;
