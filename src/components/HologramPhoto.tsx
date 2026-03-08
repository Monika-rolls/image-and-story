import { motion, useSpring, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import monikaPhoto from "@/assets/monika-cutout.png";
import useMousePosition from "@/hooks/use-mouse-position";

const HologramPhoto = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  const smoothX = useSpring(0, { stiffness: 40, damping: 18 });
  const smoothY = useSpring(0, { stiffness: 40, damping: 18 });

  useMemo(() => {
    smoothX.set(mouse.nx);
    smoothY.set(mouse.ny);
  }, [mouse.nx, mouse.ny, smoothX, smoothY]);

  const rotateY = useTransform(smoothX, [-1, 1], [-25, 25]);
  const rotateX = useTransform(smoothY, [-1, 1], [20, -20]);
  const photoX = useTransform(smoothX, [-1, 1], [12, -12]);
  const photoY = useTransform(smoothY, [-1, 1], [8, -8]);
  const glareX = useTransform(smoothX, [-1, 1], ["20%", "80%"]);
  const glareY = useTransform(smoothY, [-1, 1], ["20%", "80%"]);
  const shadowX = useTransform(smoothX, [-1, 1], [30, -30]);
  const shadowY = useTransform(smoothY, [-1, 1], [30, -30]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center" style={{ perspective: "1200px" }}>
      {/* Holographic base glow */}
      <motion.div
        style={{
          rotateY,
          rotateX,
          x: useTransform(smoothX, [-1, 1], [10, -10]),
          y: useTransform(smoothY, [-1, 1], [10, -10]),
        }}
        className="relative"
      >
        {/* Outer scan ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 rounded-full border border-dashed border-primary/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-14 rounded-full border border-dotted border-accent/10"
        />

        {/* Holographic frame layers */}
        {/* Back layer — glowing silhouette */}
        <motion.div
          style={{
            x: useTransform(smoothX, [-1, 1], [-20, 20]),
            y: useTransform(smoothY, [-1, 1], [-15, 15]),
          }}
          className="absolute inset-0 w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden opacity-30 blur-sm"
        >
          <img src={monikaPhoto} alt="" className="w-full h-full object-cover object-top scale-110" />
          <div className="absolute inset-0 bg-primary/40 mix-blend-color" />
        </motion.div>

        {/* Main 3D card */}
        <motion.div
          className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "0 0 60px hsl(175, 80%, 50%, 0.15), 0 0 120px hsl(175, 80%, 50%, 0.05), inset 0 0 60px hsl(175, 80%, 50%, 0.05)",
          }}
        >
          {/* Photo with inner parallax */}
          <motion.img
            src={monikaPhoto}
            alt="Monika Kusumanchi - AI Engineer"
            className="w-full h-full object-cover object-top"
            style={{
              x: photoX,
              y: photoY,
              scale: 1.15,
            }}
          />

          {/* Holographic scan line */}
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            style={{ boxShadow: "0 0 20px hsl(175, 80%, 50%, 0.4), 0 0 60px hsl(175, 80%, 50%, 0.2)" }}
          />

          {/* Holographic grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(0deg, hsl(175, 80%, 50%) 1px, transparent 1px),
                linear-gradient(90deg, hsl(175, 80%, 50%) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Glare/reflection that follows mouse */}
          <motion.div
            style={{ left: glareX, top: glareY }}
            className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-white/[0.06] blur-2xl"
          />

          {/* Holographic color shift overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
            style={{
              background: `linear-gradient(135deg, 
                hsl(175, 80%, 50%, 0.3) 0%, 
                hsl(265, 70%, 60%, 0.2) 30%, 
                transparent 50%, 
                hsl(45, 90%, 60%, 0.15) 70%, 
                hsl(175, 80%, 50%, 0.2) 100%)`,
            }}
          />

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

          {/* Holographic border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: "1px solid hsl(175, 80%, 50%, 0.3)",
              boxShadow: "inset 0 0 30px hsl(175, 80%, 50%, 0.05)",
            }}
          />
        </motion.div>

        {/* Floating data points around the hologram */}
        {[
          { label: "LLMs", angle: -30, dist: 180, color: "primary" },
          { label: "RAG", angle: 30, dist: 190, color: "primary" },
          { label: "PyTorch", angle: 150, dist: 185, color: "accent" },
          { label: "AWS", angle: 210, dist: 175, color: "accent" },
          { label: "CrewAI", angle: 90, dist: 195, color: "primary" },
          { label: "Docker", angle: 270, dist: 180, color: "accent" },
        ].map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = Math.cos(rad) * node.dist;
          const y = Math.sin(rad) * node.dist;
          const mxFactor = node.angle < 180 ? 1 : -1;
          
          return (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.15, type: "spring", stiffness: 100 }}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                x: useTransform(smoothX, [-1, 1], [-15 * mxFactor, 15 * mxFactor]),
                y: useTransform(smoothY, [-1, 1], [-10, 10]),
              }}
              whileHover={{ scale: 1.3, boxShadow: `0 0 20px hsl(${node.color === "primary" ? "175, 80%, 50%" : "265, 70%, 60%"}, 0.5)` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-heading tracking-widest backdrop-blur-md border ${
                node.color === "primary"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-accent/30 bg-accent/10 text-accent"
              }`}
            >
              {/* Connector line */}
              <svg
                className="absolute pointer-events-none opacity-20"
                style={{
                  left: x > 0 ? "auto" : "100%",
                  right: x > 0 ? "100%" : "auto",
                  top: "50%",
                  width: Math.abs(x) * 0.3,
                  height: 1,
                  transform: "translateY(-50%)",
                }}
              >
                <line
                  x1="0" y1="0" x2="100%" y2="0"
                  stroke={node.color === "primary" ? "hsl(175, 80%, 50%)" : "hsl(265, 70%, 60%)"}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>
              {node.label}
            </motion.div>
          );
        })}

        {/* Bottom hologram base */}
        <motion.div
          style={{
            rotateX: 75,
            y: 160,
          }}
          className="absolute left-1/2 -translate-x-1/2 w-64 h-16"
        >
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full rounded-full bg-primary/20 blur-xl"
          />
        </motion.div>
      </motion.div>

      {/* Ground shadow */}
      <motion.div
        style={{
          x: shadowX,
          y: shadowY,
        }}
        className="absolute bottom-[-2rem] w-48 h-6 rounded-full bg-primary/10 blur-xl"
      />
    </div>
  );
};

export default HologramPhoto;
