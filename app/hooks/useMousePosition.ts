"use client";

import { useRef, useCallback, useEffect } from "react";

// Returns smoothly interpolated mouse position with velocity tracking.
// The raw position is lerped toward the target for fluid, non-jerky motion.
// Also provides distance-from-center and angle for advanced effects.
export function useMousePosition() {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const state = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    distance: 0,
    angle: 0,
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    target.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Call this each frame (from useFrame) to update the smoothed values
  const update = useCallback((lerpFactor = 0.08) => {
    const prev = { ...current.current };

    // Smooth lerp toward target
    current.current.x += (target.current.x - current.current.x) * lerpFactor;
    current.current.y += (target.current.y - current.current.y) * lerpFactor;

    // Calculate velocity (delta per frame)
    velocity.current.x = current.current.x - prev.x;
    velocity.current.y = current.current.y - prev.y;

    // Distance from center (0 = center, 1 = edge)
    const dist = Math.sqrt(current.current.x ** 2 + current.current.y ** 2);
    // Angle in radians
    const angle = Math.atan2(current.current.y, current.current.x);

    state.current.x = current.current.x;
    state.current.y = current.current.y;
    state.current.vx = velocity.current.x;
    state.current.vy = velocity.current.y;
    state.current.distance = dist;
    state.current.angle = angle;

    return state.current;
  }, []);

  return { target: target.current, state: state.current, update };
}
