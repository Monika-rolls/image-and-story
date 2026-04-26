import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { Award, GraduationCap, Zap } from "lucide-react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const headingY = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [80, -20]);
  const bgOrbY = useTransform(scrollYProgress, [0, 1], [100, -60]);

  const cards = [
    { icon: GraduationCap, title: "B.Tech CSE (AI & ML)", desc: "JNTU Kakinada • CGPA: 8.0 • 2020-2024" },
    { icon: Award, title: "3x Hackathon Winner", desc: "Smart India Hackathon winner • Accenture AI 2nd/3150 • UNESCO India-Africa finalist" },
    { icon: Zap, title: "Production AI Systems", desc: "AI Copilots, RAG, voice agents — 60% cost cut, <10s latency at scale" },
  ];

  return (
    <section id="about" className="relative py-24 neural-grid overflow-hidden" ref={ref}>
      {/* Parallax background orbs */}
      <motion.div style={{ y: bgOrbY }} className="absolute -top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [-40, 80]) }} className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div style={{ y: headingY }}>
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          >
            <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// ABOUT</h2>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
              The Node Behind The Network
            </h3>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-lg text-muted-foreground max-w-3xl leading-relaxed mb-12"
          >
            AI Engineer specializing in LLM systems, conversational AI, and scalable ML infrastructure
            with 3+ years of experience building production-grade AI copilots, RAG pipelines, and voice
            agents. Proven track record of reducing inference costs by 60% and delivering low-latency
            AI systems (&lt;10s response time) at scale across AWS and GCP. Winner of 3 national-level
            AI hackathons.
          </motion.p>
        </motion.div>

        <motion.div style={{ y: cardsY }} className="grid md:grid-cols-3 gap-6">
          {cards.map((item, i) => {
            const cardX = useMotionValue(0);
            const cardY = useMotionValue(0);
            const rotateX = useSpring(useTransform(cardY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 15 });
            const rotateY = useSpring(useTransform(cardX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 15 });

            const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              cardX.set((e.clientX - rect.left) / rect.width - 0.5);
              cardY.set((e.clientY - rect.top) / rect.height - 0.5);
            };
            const handleMouseLeave = () => { cardX.set(0); cardY.set(0); };

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
                animate={isInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.2, type: "spring", stiffness: 80 }}
                style={{ rotateX, rotateY, transformPerspective: 800 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ y: -8, boxShadow: "0 0 25px hsl(175, 80%, 50%, 0.2)" }}
                className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors group cursor-pointer"
              >
                <item.icon className="w-8 h-8 text-primary mb-4 group-hover:drop-shadow-[0_0_8px_hsl(175,80%,50%,0.5)] transition-all" />
                <h4 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
