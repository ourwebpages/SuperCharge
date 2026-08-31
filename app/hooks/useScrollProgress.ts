"use client";

import { useState, useEffect, useCallback } from "react";

// Returns a 0-1 value representing scroll progress through the page.
// Uses requestAnimationFrame for smooth, non-blocking updates.
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress(scrollTop / docHeight);
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // initial value
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  return progress;
}
