"use client";

import type { ElementType } from "react";
import { useEffect, useId, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  style?: React.CSSProperties;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Reveal(props: RevealProps) {
  const {
    children,
    className,
    as = "div",
    rootMargin = "0px 0px -10% 0px",
    threshold = 0.15,
    once = true,
    style,
  } = props;

  const [revealed, setRevealed] = useState(() => prefersReducedMotion());
  const id = useId();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { root: null, rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [id, once, rootMargin, threshold]);

  const Tag = as;

  return (
    <Tag
      id={id}
      className={["reveal", revealed ? "is-revealed" : "", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </Tag>
  );
}
