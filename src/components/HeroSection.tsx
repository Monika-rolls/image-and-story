import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useMemo } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import useTypewriter from "@/hooks/use-typewriter";
import useMousePosition from "@/hooks/use-mouse-position";
import MagneticButton from "./MagneticButton";
import HologramPhoto from "./HologramPhoto";

const tagline = "Building intelligent systems that think, reason, and automate. From LLM-powered copilots to real-time call analytics — engineering AI that drives business impact.";

const HeroSection = () => {
  const { displayed, done } = useTypewriter(tagline, 30, 1200);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mouse = useMousePosition();

  const smoothX = useSpring(0, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(0, { stiffness: 50, damping: 20 });

  useMemo(() => {
    smoothX.set(mouse.nx);
    smoothY.set(mouse.ny);
  }, [mouse.nx, mouse.ny, smoothX, smoothY]);

  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgLayer1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgLayer2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Parallax decorative layers */}
      <motion.div
        style={{ y: bgLayer1Y, x: useTransform(smoothX, [-1, 1], [-30, 30]) }}
        className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: bgLayer2Y, x: useTransform(smoothX, [-1, 1], [20, -20]) }}
        className="absolute -bottom-20 -right-32 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ x: useTransform(smoothX, [-1, 1], [-40, 40]), y: useTransform(smoothY, [-1, 1], [-40, 40]) }}
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-glow-warm/3 blur-2xl pointer-events-none"
      />

      <motion.div style={{ opacity }} className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left - Text */}
        <motion.div
          style={{ y: textY, x: useTransform(smoothX, [-1, 1], [-8, 8]) }}
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
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </motion.div>
            <span className="font-heading text-xs tracking-widest text-primary uppercase">AI Engineer</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
            <motion.span
              className="text-foreground inline-block"
              whileHover={{ scale: 1.02, color: "hsl(175, 80%, 50%)" }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Monika
            </motion.span>
            <br />
            <motion.span
              className="text-primary glow-text inline-block"
              whileHover={{ scale: 1.02, textShadow: "0 0 40px hsl(175, 80%, 50%, 0.8)" }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Kusumanchi
            </motion.span>
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8 min-h-[5rem]">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse-glow align-middle" />}
          </p>

          <div className="flex flex-wrap gap-4">
            <MagneticButton
              href="#projects"
              className="group relative px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide overflow-hidden"
              strength={0.4}
            >
              <span className="relative z-10">Explore My Work</span>
              {/* Shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ translateX: ["−100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </MagneticButton>
            <MagneticButton
              href="#about"
              className="group px-6 py-3 rounded-lg border border-border bg-card text-foreground font-heading font-semibold text-sm tracking-wide hover:border-primary/50 transition-all relative overflow-hidden"
              strength={0.3}
            >
              <span className="relative z-10">About Me</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </MagneticButton>
          </div>

          {/* Stats with count-up micro animation */}
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
                whileHover={{ scale: 1.1, y: -4 }}
                className="cursor-default"
              >
                <motion.div
                  className="font-display text-2xl font-bold text-primary"
                  whileHover={{ textShadow: "0 0 20px hsl(175, 80%, 50%, 0.6)" }}
                >
                  {stat.value}
                </motion.div>
                <div className="font-body text-xs text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right - 3D Interactive Photo */}
        <motion.div
          style={{
            y: photoY,
            rotateX: useTransform(smoothY, [-1, 1], [12, -12]),
            rotateY: useTransform(smoothX, [-1, 1], [-12, 12]),
            transformPerspective: 1200,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            style={{ x: useTransform(smoothX, [-1, 1], [15, -15]), y: useTransform(smoothY, [-1, 1], [15, -15]) }}
            className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border border-primary/10 animate-pulse-glow"
          />
          <motion.div
            style={{ x: useTransform(smoothX, [-1, 1], [-10, 10]), y: useTransform(smoothY, [-1, 1], [-10, 10]) }}
            className="absolute w-[22rem] md:w-[28rem] h-[22rem] md:h-[28rem] rounded-full border border-primary/5"
          />
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-primary/20 animate-signal" />

          <motion.div
            style={{
              x: useTransform(smoothX, [-1, 1], [-20, 20]),
              y: useTransform(smoothY, [-1, 1], [-15, 15]),
              scale: useTransform(smoothY, [-1, 1], [1.04, 0.96]),
            }}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.7 }}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-primary/40 glow-box"
          >
            <motion.img
              src={monikaPhoto}
              alt="Monika Kusumanchi - AI Engineer"
              className="w-full h-full object-cover object-top"
              style={{
                x: useTransform(smoothX, [-1, 1], [15, -15]),
                y: useTransform(smoothY, [-1, 1], [10, -10]),
                scale: useTransform(smoothY, [-1, 1], [1.12, 1.02]),
              }}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1.07 }}
              transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <motion.div
              style={{ x: useTransform(smoothX, [-1, 1], [-80, 80]), y: useTransform(smoothY, [-1, 1], [-80, 80]) }}
              className="absolute w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none"
            />
          </motion.div>

          {[
            { label: "LLMs", x: "-left-4", y: "top-8", color: "primary", mx: 25, my: 20 },
            { label: "RAG", x: "-right-2", y: "top-16", color: "primary", mx: -20, my: 15 },
            { label: "PyTorch", x: "-left-8", y: "bottom-20", color: "accent", mx: 30, my: -18 },
            { label: "AWS", x: "-right-6", y: "bottom-12", color: "accent", mx: -25, my: -22 },
          ].map((node, i) => (
            <motion.div
              key={node.label}
              style={{
                x: useTransform(smoothX, [-1, 1], [-node.mx, node.mx]),
                y: useTransform(smoothY, [-1, 1], [-node.my, node.my]),
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.2 }}
              whileHover={{ scale: 1.2, boxShadow: `0 0 15px hsl(${node.color === "primary" ? "175, 80%, 50%" : "265, 70%, 60%"}, 0.4)` }}
              className={`absolute ${node.x} ${node.y} px-3 py-1.5 rounded-full border text-xs font-heading tracking-wider backdrop-blur-sm ${
                node.color === "primary"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-accent/40 bg-accent/10 text-accent"
              }`}
            >
              {node.label}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <MagneticButton href="#about" strength={0.5}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <span className="font-heading text-xs tracking-widest">SCROLL</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </MagneticButton>
      </motion.div>
    </section>
  );
};

export default HeroSection;
