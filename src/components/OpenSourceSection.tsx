import { ArrowUpRight, GitMerge } from "lucide-react";
import { format } from "date-fns";
import { community, links, pullRequests } from "@/content/profile";
import EventsList from "./EventsSection";
import { Section } from "./site/ui";

const Sub = ({ children }: { children: React.ReactNode }) => <h3 className="mb-4 text-[15px] font-medium">{children}</h3>;

const OpenSourceSection = () => (
  <Section id="open-source" title="Open source and community" intro="What I give back: code, articles and sessions.">
    <div className="flex flex-col gap-14">
      {/* AI Yatra role */}
      <a
        href={community.role.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl border border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/20 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[20px] font-medium tracking-[-0.01em]">{community.role.title}</h3>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-subtle transition-colors duration-150 group-hover:text-foreground" strokeWidth={1.5} />
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{community.role.detail}</p>
      </a>

      {/* Recent pull requests */}
      <div>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h3 className="text-[15px] font-medium">Recent pull requests</h3>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
            GitHub profile
          </a>
        </div>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {pullRequests.map((pr) => (
            <li key={pr.href}>
              <a
                href={pr.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-1.5 p-5 transition-colors duration-150 hover:bg-secondary/60 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
              >
                <span className="font-mono text-[12.5px] tabular-nums text-subtle">{format(new Date(`${pr.date}T00:00:00`), "MMM d, yyyy")}</span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-foreground">{pr.title}</span>
                  <span className="mt-0.5 block text-[14px] text-muted-foreground">{pr.note}</span>
                  <span className="mt-1 block font-mono text-[12.5px] text-subtle">
                    {pr.repo} #{pr.number}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-subtle">
                  <GitMerge className="h-3.5 w-3.5" strokeWidth={1.5} /> Merged
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Teaching */}
      <div>
        <Sub>Teaching</Sub>
        <ul className="flex flex-col gap-4">
          {community.teaching.map((t) => (
            <li key={t.href}>
              <a href={t.href} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border border-border bg-card p-5 transition-colors duration-150 hover:border-foreground/20">
                <p className="font-mono text-[12.5px] text-subtle">
                  {t.date} · {t.where}
                </p>
                <h4 className="mt-1 text-[16px] font-medium">{t.title}</h4>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{t.detail}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <EventsList />

      {/* Recognition */}
      <div>
        <Sub>Recognition</Sub>
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {community.recognition.map((r) => (
            <li key={r} className="relative pl-4 text-[15px] text-muted-foreground">
              <span className="absolute left-0 top-[0.75em] h-px w-2 bg-subtle" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
);

export default OpenSourceSection;
