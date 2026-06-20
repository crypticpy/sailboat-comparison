// Count a number up from zero once, on mount, with an ease-out. Returns the
// target immediately under prefers-reduced-motion (no animation, no flicker).
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, ms = 900): number {
  const [val, setVal] = useState(target);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) {
      setVal(target);
      return;
    }
    started.current = true;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || target <= 0) {
      setVal(target);
      return;
    }
    setVal(0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}
