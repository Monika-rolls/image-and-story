import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, ExternalLink, Pencil } from "lucide-react";
import { format } from "date-fns";
import NeuralBackground from "@/components/NeuralBackground";
import ScrollProgress from "@/components/ScrollProgress";
import BlogMarkdown, { extractToc } from "@/components/BlogMarkdown";
import { getToken, loadPost, loadPostList, type Post, type PostMeta } from "@/lib/blog";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthor = !!getToken();

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPost(slug), loadPostList()]).then(([p, list]) => {
      setPost(p);
      if (p) {
        document.title = `${p.title} · Monika Kusumanchi`;
        const others = list.filter((o) => o.slug !== p.slug && !o.draft);
        const shared = others.filter((o) => o.tags.some((t) => p.tags.includes(t)));
        setRelated([...shared, ...others.filter((o) => !shared.includes(o))].slice(0, 3));
      }
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [slug]);

  const toc = post ? extractToc(post.body) : [];

  return (
    <div className="relative min-h-screen bg-background">
      <ScrollProgress />
      <NeuralBackground />
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-heading text-sm hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>
          {post && isAuthor && (
            <Link
              to={`/blog/edit/${post.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 text-primary font-heading text-xs hover:bg-primary/10 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          )}
        </div>

        {loading && <p className="font-body text-muted-foreground">Loading...</p>}
        {!loading && !post && (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <p className="font-body text-muted-foreground">This post doesn't exist (or was just published and is still syncing; try again in a minute).</p>
          </div>
        )}

        {post && (
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <header className="max-w-3xl mb-10">
              <div className="flex flex-wrap items-center gap-3 font-display text-xs tracking-wider text-muted-foreground mb-4">
                <time>{format(new Date(`${post.date}T00:00:00`), "MMMM d, yyyy")}</time>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime} min read
                </span>
                {post.draft && <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">DRAFT</span>}
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">{post.title}</h1>
              {post.excerpt && <p className="font-body text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {post.tags.map((t) => (
                    <Link
                      key={t}
                      to={`/blog?tag=${encodeURIComponent(t)}`}
                      className="px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-heading text-[11px] hover:bg-primary/15 transition-all"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {post.cover && (
              <img src={post.cover} alt="" className="w-full max-h-[480px] object-cover rounded-2xl border border-border mb-12" />
            )}

            <div className="grid lg:grid-cols-[minmax(0,1fr)_220px] gap-12">
              <div className="max-w-3xl min-w-0">
                <BlogMarkdown>{post.body}</BlogMarkdown>
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-primary font-heading text-xs tracking-wider hover:gap-3 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Originally posted here
                  </a>
                )}
              </div>

              {toc.length > 1 && (
                <aside className="hidden lg:block">
                  <nav className="sticky top-24">
                    <p className="font-display text-xs tracking-[0.3em] text-primary mb-3">ON THIS PAGE</p>
                    <ul className="space-y-2 border-l border-border">
                      {toc.map((h) => (
                        <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-3"}>
                          <a href={`#${h.id}`} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              )}
            </div>
          </motion.article>
        )}

        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border">
            <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-6">// KEEP READING</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all"
                >
                  <time className="font-display text-xs tracking-wider text-muted-foreground">
                    {format(new Date(`${r.date}T00:00:00`), "MMM d, yyyy")}
                  </time>
                  <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors mt-2 mb-2">{r.title}</h3>
                  <p className="font-body text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
