import { motion } from "framer-motion";
import monikaPhoto from "@/assets/monika-photo.png";
import { ArrowDown, Sparkles } from "lucide-react";
import useTypewriter from "@/hooks/use-typewriter";

const tagline = "Building intelligent systems that think, reason, and automate. From LLM-powered copilots to real-time call analytics — engineering AI that drives business impact.";

const HeroSection = () => {
  const { displayed, done } = useTypewriter(tagline, 30, 1200);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left - Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-heading text-xs tracking-widest text-primary uppercase">AI Engineer</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
            <span className="text-foreground">Monika</span>
            <br />
            <span className="text-primary glow-text">Kusumanchi</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8 min-h-[5rem]">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse-glow align-middle" />}
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#projects"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:shadow-[0_0_25px_hsl(175,80%,50%,0.4)] transition-all"
            >
              Explore My Work
            </a>
            <a
              href="#about"
              className="px-6 py-3 rounded-lg border border-border bg-card text-foreground font-heading font-semibold text-sm tracking-wide hover:border-primary/50 transition-all"
            >
              About Me
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            {[
              { value: "3+", label: "Hackathon Wins" },
              { value: "4+", label: "Companies" },
              { value: "60%", label: "Cost Reduction" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
              >
                <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
                <div className="font-body text-xs text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right - Photo Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative flex items-center justify-center"
        >
          {/* Outer glow rings */}
          <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border border-primary/10 animate-pulse-glow" />
          <div className="absolute w-[22rem] md:w-[28rem] h-[22rem] md:h-[28rem] rounded-full border border-primary/5" />
          
          {/* Signal pulse */}
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-primary/20 animate-signal" />

          {/* Photo container */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.7 }}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-primary/40 glow-box animate-float"
          >
            <motion.img
              src={monikaPhoto}
              alt="Monika Kusumanchi - AI Engineer"
              className="w-full h-full object-cover object-top"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
              whileHover={{ scale: 1.08, transition: { duration: 0.4 } }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </motion.div>

          {/* Floating skill nodes */}
          {[
            { label: "LLMs", x: "-left-4", y: "top-8", color: "primary" },
            { label: "RAG", x: "-right-2", y: "top-16", color: "primary" },
            { label: "PyTorch", x: "-left-8", y: "bottom-20", color: "accent" },
            { label: "AWS", x: "-right-6", y: "bottom-12", color: "accent" },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.2 }}
              className={`absolute ${node.x} ${node.y} px-3 py-1.5 rounded-full border text-xs font-heading tracking-wider ${
                node.color === "primary"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-accent/40 bg-accent/10 text-accent"
              }`}
            >
              {node.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#about" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <span className="font-heading text-xs tracking-widest">SCROLL</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSection;
