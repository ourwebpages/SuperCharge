"use client";

import { useRef, useEffect, useState } from "react";

// Parallax depth layer — shifts content vertically at a different rate
// than the scroll speed. Creates a sense of depth between foreground
// and background elements.
//
// speed: 0 = static (moves with scroll), 1 = full parallax (stays in place),
//        negative = moves faster than scroll
// Examples:
//   0.3  — slow background layer (lags behind scroll)
//   0    — normal scroll speed (no parallax)
//  -0.2  — foreground layer (moves slightly faster than scroll)

interface ParallaxLayerProps {
  speed?: number;
  children: React.ReactNode;
  className?: string;
}

export function ParallaxLayer({ speed = 0.3, children, className = "" }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            // Distance from viewport center, normalized
            const distFromCenter = (centerY - viewportCenter) / window.innerHeight;
            setOffset(distFromCenter * speed * 100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// Decorative gradient orb that drifts at parallax speed
// Adds visual depth between the 3D scene and the content overlays
interface GradientOrbProps {
  color: string;
  size: number;
  x: string;
  y: string;
  speed?: number;
  blur?: number;
}

export function GradientOrb({ color, size, x, y, speed = 0.5, blur = 80 }: GradientOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? scrollY / docHeight : 0;
          setOffset(progress * speed * -200);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        transform: `translateY(${offset}px)`,
        willChange: "transform",
        opacity: 0.3,
      }}
    />
  );
}
