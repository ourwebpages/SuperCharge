"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

// Inline lightning bolt icon — ties directly to the SuperCharge brand
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        fill="currentColor"
      />
    </svg>
  );
}

interface NavProps {
  activeSection: string;
}

export function Nav({ activeSection }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-black/60 via-black/20 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* Logo — bolt icon + text, clean white on dark */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2 group"
          aria-label="Back to top"
        >
          <BoltIcon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="text-white font-bold text-xl tracking-tight group-hover:text-indigo-100 transition-colors">
            SuperCharge
          </span>
        </button>

        {/* Section links with active pill indicator */}
        <div className="hidden md:flex items-center gap-1">
          {sections.slice(1).map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors duration-300 rounded-full ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-white/[0.1] rounded-full border border-white/[0.08]" />
                )}
                <span className="relative">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 group"
          aria-label="Menu"
          onClick={() => {
            const currentIdx = sections.findIndex((s) => s.id === activeSection);
            const nextIdx = Math.min(currentIdx + 1, sections.length - 1);
            scrollTo(sections[nextIdx].id);
          }}
        >
          <span className="w-5 h-px bg-zinc-300 group-hover:bg-white transition-colors" />
          <span className="w-3.5 h-px bg-zinc-300 group-hover:bg-white transition-colors" />
          <span className="w-5 h-px bg-zinc-300 group-hover:bg-white transition-colors" />
        </button>
      </div>
    </nav>
  );
}
