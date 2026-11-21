import { experience } from "@/content/profile";
import { Section } from "./site/ui";

const ExperienceSection = () => (
  <Section
    id="experience"
    title="Experience"
    intro="Building ML and LLM systems full time since June 2023. B.Tech CSE (AI & ML), JNTU Kakinada, 2024."
  >
    <ol className="flex flex-col">
      {experience.map((job, i) => (
        <li
          key={job.company}
          className={`grid gap-3 py-8 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8 ${i ? "border-t border-border" : "pt-0"}`}
        >
          <p className="font-mono text-[13px] tabular-nums text-subtle md:pt-1">{job.period}</p>
          <div>
            <h3 className="text-[18px] font-medium">
              {job.company} <span className="font-normal text-muted-foreground">· {job.role}</span>
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {job.points.map((pt) => (
                <li key={pt} className="relative pl-4 text-[15px] leading-relaxed text-muted-foreground">
                  <span className="absolute left-0 top-[0.7em] h-px w-2 bg-subtle" aria-hidden />
                  {pt}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[12.5px] text-subtle">{job.stack}</p>
          </div>
        </li>
      ))}
    </ol>
  </Section>
);

export default ExperienceSection;
