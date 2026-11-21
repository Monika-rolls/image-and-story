import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Pencil } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-14">
        <div className="flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors duration-150 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> All posts
          </Link>
          {post && isAuthor && (
            <Link to={`/blog/edit/${post.slug}`} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 text-[13px] font-medium hover:bg-secondary">
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} /> Edit
            </Link>
          )}
        </div>

        {loading && <p className="mt-12 text-muted-foreground">Loading</p>}
        {!loading && !post && (
          <p className="mt-12 max-w-xl text-muted-foreground">
            This post doesn't exist, or it was just published and is still syncing. Try again in a minute.
          </p>
        )}

        {post && (
          <article className="mt-10">
            <header className="max-w-3xl">
              <p className="font-mono text-[12.5px] tabular-nums text-subtle">
                {format(new Date(`${post.date}T00:00:00`), "MMMM d, yyyy")} · {post.readingTime} min read
                {post.draft && <span className="text-destructive"> · Draft</span>}
              </p>
              <h1 className="mt-4 text-[34px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[46px] md:leading-[1.06] md:tracking-[-0.03em]">
                {post.title}
              </h1>
              {post.excerpt && <p className="mt-5 text-[18px] leading-relaxed text-muted-foreground">{post.excerpt}</p>}
              {post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                  {post.tags.map((t) => (
                    <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="text-[13.5px] text-subtle transition-colors duration-150 hover:text-foreground">
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {post.cover && <img src={post.cover} alt="" className="mt-10 max-h-[480px] w-full rounded-2xl border border-border object-cover" />}

            <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0 max-w-[68ch]">
                <BlogMarkdown>{post.body}</BlogMarkdown>
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium underline decoration-border underline-offset-4 hover:decoration-primary">
                    Originally posted here <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </a>
                )}
              </div>

              {toc.length > 1 && (
                <aside className="hidden lg:block">
                  <nav className="sticky top-24">
                    <p className="mb-3 text-[13px] text-subtle">On this page</p>
                    <ul className="flex flex-col gap-2 border-l border-border">
                      {toc.map((h) => (
                        <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-3"}>
                          <a href={`#${h.id}`} className="text-[13.5px] leading-snug text-muted-foreground transition-colors duration-150 hover:text-foreground">
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              )}
            </div>
          </article>
        )}

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-10">
            <h2 className="mb-6 text-[15px] font-medium">Keep reading</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="group rounded-2xl border border-border bg-card p-5 transition-colors duration-150 hover:border-foreground/20">
                  <p className="font-mono text-[12.5px] text-subtle">{format(new Date(`${r.date}T00:00:00`), "MMM d, yyyy")}</p>
                  <h3 className="mt-2 text-[16px] font-medium leading-snug">{r.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[14px] text-muted-foreground">{r.excerpt}</p>
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
