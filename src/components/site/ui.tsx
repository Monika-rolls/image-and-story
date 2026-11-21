import type { ReactNode } from "react";
import { getToken } from "@/lib/blog";
import type { Readout as ReadoutT } from "@/content/profile";

/** One easing for the whole site. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Editing controls for projects and events show only to the author:
 * signed in to the blog editor (GitHub token saved), or the page opened with ?edit.
 */
export const isEditMode = () =>
  typeof window !== "undefined" && (!!getToken() || new URLSearchParams(window.location.search).has("edit"));

export const Section = ({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-16 border-t border-border">
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
        <header>
          <h2 className="text-2xl font-medium tracking-[-0.01em] md:sticky md:top-24">{title}</h2>
          {intro && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:max-w-[220px]">{intro}</p>}
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </section>
);

/** The site's signature: a measured number in mono with a vermilion marker rule. */
export const Readout = ({ value, label }: ReadoutT) => (
  <div className="border-l-2 border-primary pl-3">
    <div className="font-mono text-[17px] font-medium tabular-nums leading-tight text-foreground">{value}</div>
    <div className="mt-1 text-[13px] leading-snug text-subtle">{label}</div>
  </div>
);

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 h-10 text-[15px] font-medium transition-colors duration-150 ease-out-quint active:scale-[0.98]";
export const btnPrimary = `${btnBase} bg-foreground text-background hover:bg-foreground/85`;
export const btnSecondary = `${btnBase} border border-border bg-card text-foreground hover:bg-secondary`;
export const linkCls =
  "text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-primary";

export const fieldCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-[15px] text-foreground placeholder:text-subtle focus:border-foreground/40 outline-none";

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-[13px] text-muted-foreground">{label}</span>
    {children}
  </label>
);

/** Quiet text list of technologies: "Python · FastAPI · Qdrant". */
export const Stack = ({ items }: { items: string[] }) =>
  items.length ? <p className="font-mono text-[12.5px] leading-relaxed text-subtle">{items.join(" · ")}</p> : null;

export const Modal = ({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <div
      className={`relative max-h-[88vh] w-full overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:p-8 ${wide ? "max-w-2xl" : "max-w-xl"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
