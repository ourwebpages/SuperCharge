"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A point light that follows the cursor position in 3D space,
// creating dynamic lighting that responds to user interaction.
// Uses velocity to add dynamic intensity boost on fast mouse movement.
export function CursorLight({ mouse }: { mouse: { x: number; y: number; vx?: number; vy?: number } }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    // Smooth follow with lerp for fluid motion
    lightRef.current.position.x += (mouse.x * 3 - lightRef.current.position.x) * 0.06;
    lightRef.current.position.y += (mouse.y * 2 - lightRef.current.position.y) * 0.06;

    // Dynamic intensity based on mouse velocity
    const speed = Math.abs(mouse.vx ?? 0) + Math.abs(mouse.vy ?? 0);
    lightRef.current.intensity = 2 + speed * 30;
  });

  return (
    <pointLight
      ref={lightRef}
      color="#6366f1"
      intensity={2}
      distance={10}
      decay={2}
    />
  );
}
