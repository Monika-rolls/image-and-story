import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { loadPostList, type PostMeta } from "@/lib/blog";
import { Section } from "./site/ui";

const WritingSection = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);

  useEffect(() => {
    loadPostList().then((list) => setPosts(list.filter((p) => !p.draft).slice(0, 3)));
  }, []);

  if (!posts.length) return null;

  return (
    <Section id="writing" title="Writing" intro="Build notes with the measurements, including what failed.">
      <ul className="divide-y divide-border border-y border-border">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`} className="group grid gap-2 py-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8">
              <span className="font-mono text-[12.5px] tabular-nums text-subtle sm:pt-1">
                {format(new Date(`${p.date}T00:00:00`), "MMM d, yyyy")}
              </span>
              <span>
                <span className="block text-[17px] font-medium leading-snug text-foreground underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-primary">
                  {p.title}
                </span>
                <span className="mt-1.5 line-clamp-2 block text-[15px] leading-relaxed text-muted-foreground">{p.excerpt}</span>
                <span className="mt-2 block font-mono text-[12.5px] text-subtle">{p.readingTime} min read</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/blog" className="mt-6 inline-block text-[15px] font-medium underline decoration-border underline-offset-4 hover:decoration-primary">
        All posts
      </Link>
    </Section>
  );
};

export default WritingSection;
