import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, PenLine, Search, X } from "lucide-react";
import { format } from "date-fns";
import NeuralBackground from "@/components/NeuralBackground";
import { getToken, loadPostList, type PostMeta } from "@/lib/blog";

const formatDate = (d: string) => format(new Date(`${d}T00:00:00`), "MMM d, yyyy");

const PostMetaLine = ({ post }: { post: PostMeta }) => (
  <div className="flex items-center gap-3 font-display text-xs tracking-wider text-muted-foreground">
    <time>{formatDate(post.date)}</time>
    <span className="inline-flex items-center gap-1">
      <Clock className="w-3 h-3" /> {post.readingTime} min read
    </span>
    {post.draft && <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">DRAFT</span>}
  </div>
);

const Tags = ({ tags, onPick }: { tags: string[]; onPick: (t: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((t) => (
      <button
        key={t}
        onClick={(e) => {
          e.preventDefault();
          onPick(t);
        }}
        className="px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-heading text-[11px] hover:bg-primary/15 transition-all"
      >
        #{t}
      </button>
    ))}
  </div>
);

const Blog = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const tag = params.get("tag") || "";
  const isAuthor = !!getToken();

  useEffect(() => {
    loadPostList().then((list) => {
      setPosts(list);
      setLoading(false);
    });
  }, []);

  const visible = useMemo(() => posts.filter((p) => isAuthor || !p.draft), [posts, isAuthor]);
  const allTags = useMemo(() => [...new Set(visible.flatMap((p) => p.tags))].sort(), [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter(
      (p) =>
        (!tag || p.tags.includes(tag)) &&
        (!q || [p.title, p.excerpt, ...p.tags].some((s) => s.toLowerCase().includes(q))),
    );
  }, [visible, tag, query]);

  const pickTag = (t: string) => setParams(t && t !== tag ? { tag: t } : {});
  const showFeatured = !tag && !query.trim() && filtered.length > 0;
  const featured = showFeatured ? filtered[0] : undefined;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  return (
    <div className="relative min-h-screen bg-background">
      <NeuralBackground />
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading text-sm hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to portfolio
          </Link>
          <Link
            to="/blog/write"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-all"
          >
            <PenLine className="w-4 h-4" /> Write
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// BLOG</h1>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">Thought Layers</h2>
          <p className="font-body text-muted-foreground">
            Notes on AI engineering, agents, and things I'm building. {visible.length > 0 && `${visible.length} articles.`}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center mb-10">
          <label className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 rounded-md bg-card/50 border border-border text-foreground font-body text-sm focus:border-primary outline-none"
            />
          </label>
          {allTags.length > 0 && <Tags tags={allTags} onPick={pickTag} />}
        </div>

        {tag && (
          <button
            onClick={() => pickTag("")}
            className="inline-flex items-center gap-2 mb-8 text-sm font-heading text-primary"
          >
            Showing #{tag} <X className="w-4 h-4" />
          </button>
        )}

        {loading && <p className="font-body text-muted-foreground">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <p className="font-body text-muted-foreground">
              {visible.length === 0 ? "No posts yet." : "No posts match your search."}
            </p>
          </div>
        )}

        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-8 mb-14 p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border bg-gradient-to-br from-primary/20 via-card to-accent/20">
                {featured.cover && (
                  <img src={featured.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 py-2">
                <span className="font-display text-xs tracking-[0.3em] text-primary">LATEST</span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {featured.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <PostMetaLine post={featured} />
                <Tags tags={featured.tags} onPick={pickTag} />
                <span className="inline-flex items-center gap-2 text-primary font-heading text-sm group-hover:gap-3 transition-all">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col h-full rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 via-card to-accent/15">
                    {post.cover && (
                      <img src={post.cover} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <PostMetaLine post={post} />
                    <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="font-body text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                    <Tags tags={post.tags} onPick={pickTag} />
                  </div>
                </Link>
              </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Blog;
