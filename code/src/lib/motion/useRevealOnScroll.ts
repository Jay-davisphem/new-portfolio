"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

type Options = {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
};

export function useRevealOnScroll<T extends HTMLElement>(options: Options = {}) {
  const reduced = usePrefersReducedMotion();
  const [node, setNode] = useState<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(() => reduced);

  const setRef = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;
    if (reduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (options.once ?? true) observer.disconnect();
          } else if (!(options.once ?? true)) {
            setIsRevealed(false);
          }
        }
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
        threshold: options.threshold ?? 0.15,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, options.once, options.rootMargin, options.threshold, reduced]);

  return { setRef, isRevealed };
}
