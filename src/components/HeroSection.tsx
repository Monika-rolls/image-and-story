import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useMemo } from "react";
import { ArrowDown, Sparkles, FolderOpen, User, Code, Mail } from "lucide-react";
import useTypewriter from "@/hooks/use-typewriter";
import useMousePosition from "@/hooks/use-mouse-position";
import MagneticButton from "./MagneticButton";
import portfolioVideo from "@/assets/portfolio-video.mp4.asset.json";

const speechText = "Hi, I'm Monika. Want a quick tour of what I build?";

const HeroSection = () => {
  const { displayed: speechDisplayed, done: speechDone } = useTypewriter(speechText, 40, 2000);
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

  const navButtons = [
    { label: "Show Projects", href: "#projects", icon: FolderOpen },
    { label: "About Me", href: "#about", icon: User },
    { label: "Skills", href: "#skills", icon: Code },
    { label: "Contact", href: "#contact", icon: Mail },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Ambient background video — stronger, blended into the hero */}
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.8], [1, 0]) }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <video
          src={portfolioVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(1.1) contrast(1.05)" }}
        />
        {/* Subtle dark + cyan blend so text stays legible but video shines through */}
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
      </motion.div>


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

          {/* Speech Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6, type: "spring" }}
            className="relative bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl rounded-bl-sm px-5 py-3 mb-6 max-w-md glow-box"
          >
            <p className="font-body text-base text-foreground min-h-[1.5rem]">
              {speechDisplayed}
              {!speechDone && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse-glow align-middle" />}
            </p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-card/80 border-b border-l border-primary/20 rotate-[-45deg]" />
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {navButtons.map((btn, i) => (
              <MagneticButton
                key={btn.label}
                href={btn.href}
                strength={0.3}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-foreground font-heading text-sm tracking-wide hover:border-primary/50 hover:bg-primary/5 transition-all relative overflow-hidden"
              >
                <btn.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="relative z-10">{btn.label}</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </MagneticButton>
            ))}
          </motion.div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: "3+", label: "Hackathon Wins" },
              { value: "4+", label: "Companies" },
              { value: "60%", label: "Cost Reduction" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 + i * 0.15 }}
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

        {/* Right - 3D Hologram */}
        <motion.div
          style={{ y: photoY }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <HologramPhoto />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
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
