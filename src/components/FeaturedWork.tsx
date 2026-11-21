import { ArrowUpRight } from "lucide-react";
import { featured, type Featured } from "@/content/profile";
import { Readout, Section, Stack } from "./site/ui";

const Media = ({ media }: { media: NonNullable<Featured["media"]> }) => {
  const cls = "rounded-xl border border-border bg-secondary";
  return media.type === "video" ? (
    <video
      src={media.src}
      poster={media.poster}
      controls
      muted
      playsInline
      preload="none"
      aria-label={media.alt}
      style={{ aspectRatio: media.aspect }}
      className={`${cls} mx-auto h-auto max-h-[460px] w-full max-w-[256px] object-cover`}
    />
  ) : (
    <img src={media.src} alt={media.alt} loading="lazy" className={`${cls} w-full`} />
  );
};

const Links = ({ items }: { items: Featured["links"] }) =>
  items.length ? (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 text-[15px] font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-primary"
        >
          {l.label}
          <ArrowUpRight className="h-4 w-4 text-subtle transition-colors duration-150 group-hover:text-foreground" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  ) : null;

const FeaturedWork = () => (
  <Section id="work" title="Selected work" intro="Things I built, with the numbers I measured.">
    <div className="flex flex-col gap-6">
      {featured.map((p) => {
        // Wide screenshots get a wide column; tall phone-shaped clips a narrow one; text-only cards use the full width.
        const cols = !p.media
          ? ""
          : p.media.type === "image"
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]"
            : "md:grid-cols-[minmax(0,1fr)_256px]";
        return (
          <article key={p.title} className={`grid items-center gap-8 rounded-2xl border border-border bg-card p-6 md:gap-10 md:p-8 ${cols}`}>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[13px] text-subtle">{p.kind}</p>
                <h3 className="mt-1 text-[22px] font-medium tracking-[-0.01em]">{p.title}</h3>
              </div>
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{p.summary}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {p.readouts.map((r) => (
                  <Readout key={r.label} {...r} />
                ))}
              </div>
              <Stack items={p.stack} />
              <Links items={p.links} />
            </div>
            {p.media && <Media media={p.media} />}
          </article>
        );
      })}
    </div>
  </Section>
);

export default FeaturedWork;
