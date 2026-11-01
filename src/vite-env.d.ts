/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "owner/repo" whose content/blog folder holds the blog posts */
  readonly VITE_BLOG_REPO?: string;
  readonly VITE_BLOG_BRANCH?: string;
}
