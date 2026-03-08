import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Bot, FileText, MessageSquare } from "lucide-react";

const projects = [
  {
    title: "HR Agent",
    icon: Bot,
    desc: "End-to-end AI recruitment system using CrewAI with multi-agent reasoning, automated email, calendar scheduling, and AI-led interviews.",
    tags: ["CrewAI", "Gmail API", "Google Calendar", "Multi-Agent"],
  },
  {
    title: "Resume Optimization Agent",
    icon: FileText,
    desc: "LLM-based scoring and feedback engine for ATS compliance using Hugging Face and OpenAI models with structured evaluation.",
    tags: ["Hugging Face", "OpenAI", "ATS Scoring"],
  },
  {
    title: "RAG Assistant",
    icon: MessageSquare,
    desc: "Retrieval-augmented generation system for intelligent document querying and knowledge extraction.",
    tags: ["RAG", "LangChain", "Vector DB"],
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="relative py-24" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// PROJECTS</h2>
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-12">
            Output Layers
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
              className="group relative p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all hover:glow-box"
            >
              <div className="flex items-center justify-between mb-4">
                <project.icon className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_hsl(175,80%,50%,0.5)] transition-all" />
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="font-heading text-xl font-semibold text-foreground mb-3">{project.title}</h4>
              <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-heading tracking-wider border border-primary/15 text-primary/60 bg-primary/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
