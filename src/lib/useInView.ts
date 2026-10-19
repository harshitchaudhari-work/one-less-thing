"use client";

import { useEffect, useRef, useState } from "react";

/** True once (or while, if `once` is false) the element is on screen. */
export function useInView<T extends Element>(options: { threshold?: number; once?: boolean } = {}) {
  const { threshold = 0.3, once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return [ref, inView] as const;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
