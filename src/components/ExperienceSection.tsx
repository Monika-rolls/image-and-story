import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase } from "lucide-react";

const experiences = [
  {
    company: "Runo",
    role: "AI Engineer",
    period: "April 2025 - Present",
    highlights: [
      "Built AI Copilot converting natural language to MongoDB queries with 8-10s latency",
      "Created Call Analytics platform processing sales conversations, cutting costs by ~60%",
      "Deployed scalable services on AWS (ECS/Lambda/API Gateway) with Docker",
    ],
  },
  {
    company: "Solivar",
    role: "AI Engineer",
    period: "Jun 2024 - March 2025",
    highlights: [
      "Built AI Agents using CrewAI and AutoGen with OpenAI & Gemini models",
      "Deployed ML apps with FastAPI, Docker, and Google Cloud",
      "Worked with PostgreSQL, BigQuery, and Neo4j for data storage",
    ],
  },
  {
    company: "CloudKarya",
    role: "ML Engineer",
    period: "Jun 2023 - May 2024",
    highlights: [
      "Developed real-time ML models deployed on Google Cloud",
      "Built metadata management tool for SMBs tracking data pipeline lineage",
    ],
  },
  {
    company: "HomeGround",
    role: "Computer Vision Engineer",
    period: "Mar 2023 - May 2023",
    highlights: [
      "Built deep learning models with PyTorch & OpenCV for sports footage analysis",
      "Improved model accuracy by 40% through feature optimization",
    ],
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="relative py-24 neural-grid" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// EXPERIENCE</h2>
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-12">
            Training History
          </h3>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className="relative pl-12"
              >
                {/* Node dot */}
                <div className="absolute left-2.5 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background shadow-[0_0_10px_hsl(175,80%,50%,0.4)]" />

                <div className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-heading text-lg font-semibold text-foreground">{exp.company}</span>
                      <span className="text-muted-foreground font-body text-sm">• {exp.role}</span>
                    </div>
                    <span className="font-body text-xs text-primary/70 tracking-wider">{exp.period}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {exp.highlights.map((h, hi) => (
                      <li key={hi} className="font-body text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary/50 mt-1">▹</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
