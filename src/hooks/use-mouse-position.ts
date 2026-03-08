import { useState, useEffect, useCallback, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  // Normalized -1 to 1 from center
  nx: number;
  ny: number;
}

const useMousePosition = (elementRef?: React.RefObject<HTMLElement>) => {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0, nx: 0, ny: 0 });

  const handleMouse = useCallback((e: MouseEvent) => {
    if (elementRef?.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPos({
        x,
        y,
        nx: (x / rect.width - 0.5) * 2,
        ny: (y / rect.height - 0.5) * 2,
      });
    } else {
      setPos({
        x: e.clientX,
        y: e.clientY,
        nx: (e.clientX / window.innerWidth - 0.5) * 2,
        ny: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    }
  }, [elementRef]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse]);

  return pos;
};

export default useMousePosition;
