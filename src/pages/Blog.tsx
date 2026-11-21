import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PenLine, Search, X } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { getToken, loadPostList, type PostMeta } from "@/lib/blog";

const formatDate = (d: string) => format(new Date(`${d}T00:00:00`), "MMM d, yyyy");

const Blog = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const tag = params.get("tag") || "";
  const isAuthor = !!getToken();

  useEffect(() => {
    document.title = "Writing · Monika Kusumanchi";
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
      (p) => (!tag || p.tags.includes(tag)) && (!q || [p.title, p.excerpt, ...p.tags].some((s) => s.toLowerCase().includes(q))),
    );
  }, [visible, tag, query]);

  const pickTag = (t: string) => setParams(t && t !== tag ? { tag: t } : {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 md:pt-20">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[36px] font-medium tracking-[-0.02em] md:text-[44px]">Writing</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
              Build notes on AI engineering, agents and small models, with the measurements and the parts that didn't work.
            </p>
          </div>
          {isAuthor && (
            <Link
              to="/blog/write"
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 text-[14px] font-medium hover:bg-secondary"
            >
              <PenLine className="h-4 w-4" strokeWidth={1.5} /> Write
            </Link>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts"
              className="h-10 w-full rounded-[10px] border border-input bg-card pl-9 pr-3 text-[15px] placeholder:text-subtle focus:border-foreground/40 outline-none"
            />
          </label>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => pickTag(t)}
                  className={`text-[13.5px] transition-colors duration-150 ${t === tag ? "text-foreground underline decoration-primary underline-offset-4" : "text-subtle hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
              {tag && (
                <button onClick={() => pickTag("")} className="inline-flex items-center gap-1 text-[13.5px] text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {loading && <p className="mt-12 text-muted-foreground">Loading</p>}
        {!loading && filtered.length === 0 && (
          <p className="mt-12 text-muted-foreground">{visible.length === 0 ? "No posts yet." : "No posts match your search."}</p>
        )}

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="group block py-8">
                {post.cover && (
                  <img src={post.cover} alt="" loading="lazy" className="mb-5 aspect-[16/8] w-full rounded-xl border border-border bg-secondary object-cover" />
                )}
                <p className="font-mono text-[12.5px] tabular-nums text-subtle">
                  {formatDate(post.date)} · {post.readingTime} min read
                  {post.draft && <span className="text-destructive"> · Draft</span>}
                </p>
                <h2 className="mt-2 text-[22px] font-medium leading-snug tracking-[-0.01em] underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-primary">
                  {post.title}
                </h2>
                <p className="mt-2 text-[15.5px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Blog;
