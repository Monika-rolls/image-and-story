import { describe, expect, it } from "vitest";
import { parsePost, serializePost, slugify } from "./blog";

describe("blog frontmatter", () => {
  it("round-trips a post through serialize/parse", () => {
    const post = {
      title: 'Agents: "plan" then act',
      date: "2026-11-01",
      excerpt: "Short: summary",
      tags: ["ai", "agents"],
      cover: "https://example.com/c.png",
      link: "",
      draft: true,
      body: "## Hello\n\nBody text here.",
    };
    const parsed = parsePost("agents", serializePost(post));
    expect(parsed).toMatchObject({ ...post, slug: "agents", body: "## Hello\n\nBody text here.\n" });
  });

  it("parses hand-written YAML and fills defaults", () => {
    const p = parsePost("x", "---\ntitle: Plain title\ntags: [a, 'b']\n---\nSome words here.");
    expect(p.title).toBe("Plain title");
    expect(p.tags).toEqual(["a", "b"]);
    expect(p.draft).toBe(false);
    expect(p.excerpt).toBe("Some words here.");
  });

  it("slugifies titles", () => {
    expect(slugify("Hello, World: RAG & Agents!")).toBe("hello-world-rag-agents");
  });
});

describe("video embeds", () => {
  it("recognises YouTube, Vimeo and Loom links only", async () => {
    const { embedUrl } = await import("./blog");
    expect(embedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(embedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(embedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
    expect(embedUrl("https://www.loom.com/share/abc123")).toBe("https://www.loom.com/embed/abc123");
    expect(embedUrl("https://evil.com/watch?v=x")).toBeNull();
  });
});
