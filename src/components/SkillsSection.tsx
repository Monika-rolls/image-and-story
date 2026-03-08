import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  { title: "Programming", skills: ["Python", "SQL"], color: "primary" as const },
  { title: "Deep Learning", skills: ["PyTorch", "NumPy", "Pandas", "Seaborn", "Matplotlib"], color: "primary" as const },
  { title: "GenAI & Knowledge Systems", skills: ["LLMs", "RAG", "LangChain", "Hugging Face", "CrewAI", "Agno"], color: "accent" as const },
  { title: "Databases", skills: ["Neo4j", "MongoDB", "PostgreSQL", "BigQuery"], color: "primary" as const },
  { title: "Deployment & MLOps", skills: ["Docker", "FastAPI", "GCP", "AWS"], color: "accent" as const },
  { title: "Version Control & Testing", skills: ["Git", "PyTest"], color: "primary" as const },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const headingY = useTransform(scrollYProgress, [0, 1], [50, -30]);
  const gridY = useTransform(scrollYProgress, [0, 1], [60, -20]);

  return (
    <section id="skills" className="relative py-24 overflow-hidden" ref={ref}>
      {/* Parallax bg */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [80, -100]) }}
        className="absolute top-10 -right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div style={{ y: headingY }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// SKILLS</h2>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-12">
              Neural Pathways
            </h3>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: gridY }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, x: ci % 2 === 0 ? -60 : 60, rotateZ: ci % 2 === 0 ? -3 : 3 }}
              animate={isInView ? { opacity: 1, x: 0, rotateZ: 0 } : {}}
              transition={{ delay: 0.15 * ci, duration: 0.7, type: "spring", stiffness: 70 }}
              whileHover={{ scale: 1.04, rotateZ: 1 }}
              className={`p-6 rounded-xl border bg-card/50 backdrop-blur-sm transition-colors ${
                cat.color === "accent" ? "border-accent/20 hover:border-accent/40" : "border-border hover:border-primary/30"
              }`}
            >
              <h4 className={`font-heading text-sm font-semibold tracking-wider mb-4 ${
                cat.color === "accent" ? "text-accent" : "text-primary"
              }`}>
                {cat.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, si) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 * ci + 0.08 * si, type: "spring", stiffness: 200 }}
                    className={`px-3 py-1 rounded-full text-xs font-heading tracking-wide border ${
                      cat.color === "accent"
                        ? "border-accent/20 text-accent/80 bg-accent/5"
                        : "border-primary/20 text-primary/80 bg-primary/5"
                    }`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
