"use client";
import { useEffect, useRef, type HTMLAttributes } from "react";
import styles from "./Reveal.module.css";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className = "", style, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver !== "function" || typeof window.matchMedia !== "function") return;
    let observer: IntersectionObserver | undefined;
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        // Only optional movement is enhanced. There is no hidden state, timeout
        // recovery or visibility dependency on this callback ever running.
        node.classList.add(styles.entered);
        observer?.disconnect();
      }, { threshold: 0.1 });
      observer.observe(node);
    } catch {
      observer?.disconnect();
    }
    return () => observer?.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.root} ${className}`.trim()}
      style={{ animationDelay: `${delay}s`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
