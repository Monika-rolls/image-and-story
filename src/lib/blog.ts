// Git-backed blog: posts are Markdown files in content/blog/ of this repo.
// The site reads them (bundled at build time + fresh from GitHub at runtime),
// and the in-site editor commits new/updated posts straight to GitHub.

export const BLOG_REPO = import.meta.env.VITE_BLOG_REPO || "Monika-rolls/image-and-story";
export const BLOG_BRANCH = import.meta.env.VITE_BLOG_BRANCH || "main";
export const POSTS_DIR = "content/blog";
export const MANIFEST_PATH = `${POSTS_DIR}/index.json`;
export const IMAGES_DIR = "public/blog/images";
export const VIDEOS_DIR = "public/blog/videos";

const RAW_BASE = `https://raw.githubusercontent.com/${BLOG_REPO}/${BLOG_BRANCH}`;
const API_BASE = `https://api.github.com/repos/${BLOG_REPO}`;
const TOKEN_KEY = "blog-github-token";

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  tags: string[];
  cover: string;
  link: string;
  draft: boolean;
  readingTime: number;
}

export interface Post extends PostMeta {
  body: string;
}

// ---------- Markdown + frontmatter ----------

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const parseValue = (raw: string): unknown => {
  const v = raw.trim();
  if (v === "true" || v === "false") return v === "true";
  if (v.startsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith("[") && v.endsWith("]")) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return v;
};

export const readingTime = (body: string) =>
  Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200));

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);

const autoExcerpt = (body: string) =>
  body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

export const parsePost = (slug: string, source: string): Post => {
  const match = source.match(FRONTMATTER_RE);
  const data: Record<string, unknown> = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
    }
  }
  const body = (match ? source.slice(match[0].length) : source).replace(/^(\r?\n)+/, "");
  const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  return {
    slug,
    title: str("title") || slug,
    date: str("date") || new Date().toISOString().slice(0, 10),
    excerpt: str("excerpt") || autoExcerpt(body),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    cover: str("cover"),
    link: str("link"),
    draft: data.draft === true,
    readingTime: readingTime(body),
    body,
  };
};

export const serializePost = (p: Omit<Post, "slug" | "readingTime">) => {
  const lines = [
    "---",
    `title: ${JSON.stringify(p.title)}`,
    `date: ${p.date}`,
    `excerpt: ${JSON.stringify(p.excerpt)}`,
    `tags: [${p.tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    p.cover ? `cover: ${JSON.stringify(p.cover)}` : null,
    p.link ? `link: ${JSON.stringify(p.link)}` : null,
    `draft: ${p.draft}`,
    "---",
  ].filter((l): l is string => l !== null);
  return `${lines.join("\n")}\n\n${p.body.trim()}\n`;
};

export const toMeta = ({ body: _body, ...meta }: Post): PostMeta => meta;

const byDateDesc = (a: PostMeta, b: PostMeta) => b.date.localeCompare(a.date);

// ---------- Reading posts ----------

// Posts present at build time (always available, even if GitHub is unreachable).
const bundled: Post[] = Object.entries(
  import.meta.glob("/content/blog/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
).map(([path, src]) => parsePost(path.split("/").pop()!.replace(/\.md$/, ""), src));

const fetchText = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

// Freshest list: the manifest on GitHub (updated by every publish), merged with bundled posts.
export const loadPostList = async (): Promise<PostMeta[]> => {
  const merged = new Map<string, PostMeta>(bundled.map((p) => [p.slug, toMeta(p)]));
  try {
    // The author reads through the API so their own edits show up instantly (raw CDN caches ~5 min).
    const remote = getToken() ? await readManifest() : (JSON.parse(await fetchText(`${RAW_BASE}/${MANIFEST_PATH}`)) as PostMeta[]);
    if (Array.isArray(remote)) {
      const remoteSlugs = new Set(remote.map((p) => p.slug));
      // A post deleted on GitHub disappears from the manifest; drop the stale bundled copy too.
      for (const slug of merged.keys()) if (!remoteSlugs.has(slug)) merged.delete(slug);
      for (const p of remote) merged.set(p.slug, p);
    }
  } catch {
    // offline / rate-limited: bundled posts only
  }
  return [...merged.values()].sort(byDateDesc);
};

export const loadPost = async (slug: string): Promise<Post | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    if (getToken()) {
      const fresh = await loadPostForEdit(slug).catch(() => undefined);
      if (fresh !== undefined) return fresh;
    }
    return parsePost(slug, await fetchText(`${RAW_BASE}/${POSTS_DIR}/${slug}.md`));
  } catch {
    return bundled.find((p) => p.slug === slug) ?? null;
  }
};

// ---------- Writing posts (GitHub API, author's own token kept in this browser) ----------

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const setToken = (token: string) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked: token only lives for this session
  }
};

const gh = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getToken()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const msg = await res.json().then((j) => j.message).catch(() => res.statusText);
    throw new Error(`GitHub: ${msg} (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
};

/** Returns true when the saved token can push to the blog repo. */
export const verifyToken = async () => {
  const repo = await gh<{ permissions?: { push?: boolean } }>("");
  return !!repo.permissions?.push;
};

const readRepoFile = async (path: string): Promise<string | null> => {
  try {
    const file = await gh<{ content: string }>(`/contents/${path}?ref=${BLOG_BRANCH}`);
    const bytes = Uint8Array.from(atob(file.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    if (e instanceof Error && e.message.includes("(404)")) return null;
    throw e;
  }
};

/** Fetches a post straight from the repo via the API (no CDN cache) for editing. */
export const loadPostForEdit = async (slug: string) => {
  const src = await readRepoFile(`${POSTS_DIR}/${slug}.md`);
  return src === null ? null : parsePost(slug, src);
};

type FileChange = { path: string; content?: string; base64?: string; delete?: true };

/** Commits several file changes as a single commit on the blog branch. */
const commitFiles = async (changes: FileChange[], message: string) => {
  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${BLOG_BRANCH}`);
  const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
  const tree = await Promise.all(
    changes.map(async (c) => {
      if (c.delete) return { path: c.path, mode: "100644", type: "blob", sha: null };
      const blob = await gh<{ sha: string }>("/git/blobs", {
        method: "POST",
        body: JSON.stringify(
          c.base64 !== undefined ? { content: c.base64, encoding: "base64" } : { content: c.content, encoding: "utf-8" },
        ),
      });
      return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  const newTree = await gh<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  await gh(`/git/refs/heads/${BLOG_BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
};

const readManifest = async (): Promise<PostMeta[]> => {
  const src = await readRepoFile(MANIFEST_PATH);
  return src ? (JSON.parse(src) as PostMeta[]) : bundled.map(toMeta);
};

const manifestJson = (posts: PostMeta[]) => JSON.stringify([...posts].sort(byDateDesc), null, 2) + "\n";

export const savePost = async (post: Post, isNew: boolean) => {
  if (!/^[a-z0-9-]+$/.test(post.slug)) throw new Error("Slug may only contain a-z, 0-9 and dashes");
  const path = `${POSTS_DIR}/${post.slug}.md`;
  if (isNew && (await readRepoFile(path)) !== null) throw new Error(`A post with slug "${post.slug}" already exists`);
  const source = serializePost(post);
  const saved = parsePost(post.slug, source);
  const manifest = (await readManifest()).filter((p) => p.slug !== post.slug);
  manifest.push(toMeta(saved));
  await commitFiles(
    [
      { path, content: source },
      { path: MANIFEST_PATH, content: manifestJson(manifest) },
    ],
    `blog: ${isNew ? "add" : "update"} "${post.title}"${post.draft ? " (draft)" : ""}`,
  );
  return saved;
};

export const deletePost = async (slug: string, title: string) => {
  const manifest = (await readManifest()).filter((p) => p.slug !== slug);
  await commitFiles(
    [
      { path: `${POSTS_DIR}/${slug}.md`, delete: true },
      { path: MANIFEST_PATH, content: manifestJson(manifest) },
    ],
    `blog: delete "${title}"`,
  );
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/** Commits an image or short video into the repo and returns a URL that works immediately (before any redeploy). */
export const uploadMedia = async (file: File) => {
  const isVideo = file.type.startsWith("video/");
  if (!isVideo && !file.type.startsWith("image/")) throw new Error("Only images and videos can be uploaded");
  if (!isVideo && file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");
  if (isVideo && file.size > 25 * 1024 * 1024)
    throw new Error("Video must be under 25MB. For longer videos, upload to YouTube and paste the link instead");
  const ext = (file.name.split(".").pop() || (isVideo ? "mp4" : "png")).toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, "")) || "media"}.${ext}`;
  const path = `${isVideo ? VIDEOS_DIR : IMAGES_DIR}/${name}`;
  await commitFiles([{ path, base64: await fileToBase64(file) }], `blog: upload ${isVideo ? "video" : "image"} ${name}`);
  return `${RAW_BASE}/${path}`;
};

/** Turns a YouTube / Vimeo / Loom page URL into its embeddable player URL, or null. */
export const embedUrl = (href: string): string | null => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const id = (s: string | null | undefined) => (s && /^[\w-]+$/.test(s) ? s : null);
  if (host === "youtube.com") {
    const v = id(url.searchParams.get("v")) ?? id(url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1]);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "youtu.be") {
    const v = id(url.pathname.slice(1));
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "vimeo.com") {
    const v = url.pathname.match(/^\/(\d+)/)?.[1];
    return v ? `https://player.vimeo.com/video/${v}` : null;
  }
  if (host === "loom.com") {
    const v = id(url.pathname.match(/^\/(?:share|embed)\/([\w-]+)/)?.[1]);
    return v && `https://www.loom.com/embed/${v}`;
  }
  return null;
};

export const repoUrl = (path = "") => `https://github.com/${BLOG_REPO}${path ? `/blob/${BLOG_BRANCH}/${path}` : ""}`;
