"use client";

import { useEffect, useRef, useState } from "react";

// Detects when an element enters the viewport using IntersectionObserver.
// Returns [ref, isInView] — attach ref to the element you want to observe.
// once: if true, stays true after first intersection (no re-hide).
export function useInView(options?: IntersectionObserverInit & { once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options?.once) {
            observer.unobserve(el);
          }
        } else if (!options?.once) {
          setIsInView(false);
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.once]);

  return { ref, isInView };
}
