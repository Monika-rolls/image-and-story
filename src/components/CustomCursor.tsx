import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const cursorX = useSpring(0, { stiffness: 300, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 28 });
  const trailX = useSpring(0, { stiffness: 120, damping: 20 });
  const trailY = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = target.closest("a, button, [role='button'], .cursor-hover, input, textarea, select");
      setHovering(!!isHoverable);
    };

    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", checkHover);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", checkHover);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [cursorX, cursorY, trailX, trailY, visible]);

  // Hide on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      {/* Main dot */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        animate={{
          opacity: visible ? 1 : 0,
          scale: clicking ? 0.6 : hovering ? 1.8 : 1,
        }}
        transition={{ scale: { type: "spring", stiffness: 400, damping: 20 } }}
      >
        <div
          className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            boxShadow: hovering
              ? "0 0 20px hsl(265, 85%, 65%, 0.8), 0 0 40px hsl(265, 85%, 65%, 0.4)"
              : "0 0 8px hsl(265, 85%, 65%, 0.4)",
          }}
        />
      </motion.div>

      {/* Trail ring */}
      <motion.div
        style={{ x: trailX, y: trailY }}
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        animate={{
          opacity: visible ? 0.5 : 0,
          scale: clicking ? 0.8 : hovering ? 2 : 1,
        }}
        transition={{ scale: { type: "spring", stiffness: 200, damping: 15 } }}
      >
        <div
          className="w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50"
          style={{ transition: "border-color 0.3s" }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
