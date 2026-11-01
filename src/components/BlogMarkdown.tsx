import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { embedUrl, slugify, VIDEO_EXT_RE } from "@/lib/blog";

const videoCls = "w-full aspect-video rounded-lg border border-border my-6 bg-black";

/** A paragraph that is just a bare YouTube/Vimeo/Loom link becomes an embedded player. */
const embedFor = (children: ReactNode) => {
  const items = Children.toArray(children);
  if (items.length !== 1 || !isValidElement<{ href?: string; children?: ReactNode }>(items[0])) return null;
  const { href } = items[0].props;
  return href && textOf(items[0].props.children) === href ? embedUrl(href) : null;
};

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement(c) ? textOf(c.props.children) : ""))
    .join("");

/** h2/h3 headings outside code fences, for the "On this page" list. */
export const extractToc = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((l) => l.match(/^(#{2,3})\s+(.+?)\s*#*$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => {
      const text = m[2].replace(/[*_`]/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
      return { level: m[1].length, text, id: slugify(text) };
    });

const heading =
  (Tag: "h2" | "h3", className: string): Components["h2"] =>
  ({ children }) => (
    <Tag id={slugify(textOf(children))} className={`scroll-mt-24 ${className}`}>
      {children}
    </Tag>
  );

const components: Components = {
  h1: ({ children }) => <h2 className="font-heading text-3xl font-bold text-foreground mt-10 mb-4">{children}</h2>,
  h2: heading("h2", "font-heading text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4"),
  h3: heading("h3", "font-heading text-xl font-semibold text-foreground mt-8 mb-3"),
  h4: ({ children }) => <h4 className="font-heading text-lg font-semibold text-foreground mt-6 mb-2">{children}</h4>,
  p: ({ children }) => {
    const embed = embedFor(children);
    if (embed)
      return (
        <iframe
          src={embed}
          title="Embedded video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className={videoCls}
        />
      );
    return <p className="font-body text-foreground/90 leading-relaxed mb-5">{children}</p>;
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-1.5 font-body text-foreground/90 marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-1.5 font-body text-foreground/90 marker:text-primary">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary pl-4 my-6 italic text-muted-foreground">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-border" />,
  // ![caption](clip.mp4) renders as a video player; everything else as an image.
  img: ({ src, alt }) =>
    src && VIDEO_EXT_RE.test(src) ? (
      <video src={src} controls preload="metadata" playsInline aria-label={alt || "Video"} className={videoCls} />
    ) : (
      <img src={src} alt={alt ?? ""} loading="lazy" className="w-full rounded-lg border border-border my-6" />
    ),
  pre: ({ children }) => (
    <pre className="my-6 p-4 rounded-lg bg-card border border-border overflow-x-auto text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code className={`font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-primary/10 text-primary ${className ?? ""}`}>{children}</code>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border-collapse font-body">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-heading bg-card">{children}</th>,
  td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
};

const BlogMarkdown = ({ children }: { children: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {children}
  </ReactMarkdown>
);

export default BlogMarkdown;
