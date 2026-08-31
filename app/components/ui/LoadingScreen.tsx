"use client";

import { useState, useEffect, useCallback } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Full-screen loading overlay with animated progress bar.
 * Progress advances automatically during mount, then completes
 * when the Canvas fires its onCreated callback.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Simulate incremental progress while the scene initializes.
  // Jumps quickly to 85%, then creeps toward 95% waiting for onCreated.
  useEffect(() => {
    let frame: number;
    let current = 0;

    const tick = () => {
      // Ease toward a ceiling of 95% -- the last 5% comes from onCreated
      const target = Math.min(current + (95 - current) * 0.08, 95);
      current = Math.max(target, current + 0.3);
      setProgress(Math.min(current, 95));

      if (current < 95) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Called from HeroScene when the Canvas is created
  const handleReady = useCallback(() => {
    // Animate from current progress to 100%
    let frame: number;
    let current = progress;

    const tick = () => {
      current = Math.min(current + 3, 100);
      setProgress(current);

      if (current < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        // Begin fade-out, then remove from DOM
        setFadeOut(true);
        setTimeout(() => setHidden(true), 600);
        onComplete();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress, onComplete]);

  // Expose handleReady via a global so HeroScene can call it
  useEffect(() => {
    (window as any).__superchargeLoadingReady = handleReady;
    return () => {
      delete (window as any).__superchargeLoadingReady;
    };
  }, [handleReady]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      style={{ pointerEvents: fadeOut ? "none" : "auto" }}
    >
      {/* Brand name */}
      <div className="mb-8 flex items-center gap-3">
        {/* Lightning bolt icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            fill="#6366f1"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl font-bold tracking-tight text-white">
          SuperCharge
        </span>
      </div>

      {/* Progress bar track */}
      <div className="w-48 h-0.5 rounded-full bg-white/10 overflow-hidden">
        {/* Progress bar fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <span className="mt-3 text-xs tabular-nums text-zinc-500 font-mono">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
