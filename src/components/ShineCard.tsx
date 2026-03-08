import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ShineCardProps {
  children: ReactNode;
  className?: string;
}

const ShineCard = ({ children, className = "" }: ShineCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glareX = useTransform(mouseX, [0, 1], ["-100%", "200%"]);
  const glareY = useTransform(mouseY, [0, 1], ["-100%", "200%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {/* Shine/glare effect */}
      <motion.div
        style={{ left: glareX, top: glareY }}
        className="absolute w-32 h-32 rounded-full bg-white/[0.07] blur-xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
      {/* Border glow */}
      <motion.div
        style={{ left: glareX, top: glareY }}
        className="absolute w-20 h-20 rounded-full bg-primary/10 blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default ShineCard;
