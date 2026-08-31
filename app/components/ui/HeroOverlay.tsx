"use client";

import { content } from "@/lib/content";

interface HeroOverlayProps {
  activeSection: string;
}

export function HeroOverlay({ activeSection }: HeroOverlayProps) {
  const isActive = activeSection === "hero";

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pointer-events-none transition-opacity duration-700 ease-in-out ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Title */}
      <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
        {content.hero.title}
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-zinc-300 max-w-md mb-12 font-light">
        {content.hero.subtitle}
      </p>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs uppercase tracking-widest text-zinc-400">
          Scroll to explore
        </span>
        <svg
          className="w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
