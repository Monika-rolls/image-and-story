import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

const PARTICLES_COUNT = 80;
const INTRO_DURATION = 3800;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const generateParticles = (): Particle[] =>
  Array.from({ length: PARTICLES_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 0.8,
    duration: Math.random() * 2 + 1.5,
  }));

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"particles" | "name" | "dissolve">("particles");
  const [particles] = useState(generateParticles);

  const handleComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("name"), 800);
    const t2 = setTimeout(() => setPhase("dissolve"), 2800);
    const t3 = setTimeout(handleComplete, INTRO_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [handleComplete]);

  return (
    <AnimatePresence>
      {phase !== "dissolve" ? null : null}
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={phase === "dissolve" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
      >
        {/* Particle field */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              phase === "dissolve"
                ? { opacity: 0, scale: 0, x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 500 }
                : { opacity: [0, 0.8, 0.3], scale: [0, 1, 0.6] }
            }
            transition={{
              duration: phase === "dissolve" ? 0.8 : p.duration,
              delay: p.delay,
              repeat: phase === "dissolve" ? 0 : Infinity,
              repeatType: "reverse",
            }}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 4}px hsl(265, 85%, 65%, 0.4)`,
            }}
          />
        ))}

        {/* Neural lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {Array.from({ length: 15 }, (_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <motion.line
                key={i}
                x1={`${x1}%`} y1={`${y1}%`}
                x2={`${x2}%`} y2={`${y2}%`}
                stroke="hsl(265, 85%, 65%)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            className="mb-6"
          >
            <Brain className="w-12 h-12 text-primary mx-auto" style={{ filter: "drop-shadow(0 0 20px hsl(265, 85%, 65%, 0.6))" }} />
          </motion.div>

          {phase !== "particles" && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-display text-5xl md:text-7xl font-bold tracking-tight"
              >
                <motion.span
                  className="inline-block text-foreground"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Monika
                </motion.span>
                <br />
                <motion.span
                  className="inline-block text-primary glow-text"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Kusumanchi
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="font-heading text-sm text-muted-foreground tracking-[0.4em] mt-4 uppercase"
              >
                AI Engineer
              </motion.p>

              {/* Scanning line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.6 }}
                className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mt-6 w-48 mx-auto"
              />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicIntro;
