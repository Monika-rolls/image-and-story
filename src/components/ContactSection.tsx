import { ArrowUpRight } from "lucide-react";
import { links } from "@/content/profile";
import { Section, btnPrimary } from "./site/ui";

const rows = [
  { label: "LinkedIn", value: "monika-kusumanchi", href: links.linkedin },
  { label: "GitHub", value: "Monika-rolls", href: links.github },
  { label: "Medium", value: "@kusumonika033", href: links.medium },
  { label: "Resume", value: "PDF, 2 pages", href: links.resume },
];

const ContactSection = () => (
  <>
    <Section id="contact" title="Contact" intro="Email is the fastest way to reach me.">
      <a href={`mailto:${links.email}`} className="text-[28px] font-medium tracking-[-0.02em] text-foreground underline decoration-border underline-offset-[6px] transition-colors duration-150 hover:decoration-primary md:text-[36px]">
        {links.email}
      </a>
      <div className="mt-8">
        <a href={`mailto:${links.email}`} className={btnPrimary}>
          Write to me
        </a>
      </div>
      <ul className="mt-12 divide-y divide-border border-y border-border">
        {rows.map((r) => (
          <li key={r.label}>
            <a href={r.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4">
              <span className="text-[15px] text-muted-foreground">{r.label}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[13.5px] text-foreground">
                {r.value}
                <ArrowUpRight className="h-4 w-4 text-subtle transition-colors duration-150 group-hover:text-foreground" strokeWidth={1.5} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-[13px] text-subtle sm:flex-row sm:justify-between">
        <span>© 2026 Monika Kusumanchi</span>
        <span>Built with React and Tailwind. Set in Geist.</span>
      </div>
    </footer>
  </>
);

export default ContactSection;
