"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Camera path through the 3D scene driven by scroll progress (0-1).
// Defines keyframes for camera position and lookAt target per section.
// Uses lerp for smooth transitions between keyframes.
interface CameraKeyframe {
  progress: number;
  position: [number, number, number];
  lookAt: [number, number, number];
}

const keyframes: CameraKeyframe[] = [
  // Hero: front-facing, centered
  { progress: 0, position: [0, 0, 5], lookAt: [0, 0, 0] },
  // About: camera pulls back and shifts right
  { progress: 0.2, position: [3, 1, 6], lookAt: [0, 0.5, 0] },
  // Work: camera orbits to the left side
  { progress: 0.4, position: [-3, 0.5, 5], lookAt: [0, 0, 0] },
  // Services: camera moves above and forward
  { progress: 0.6, position: [0, 3, 4], lookAt: [0, 0, 0] },
  // Contact: camera returns to front, slightly elevated
  { progress: 0.8, position: [0, 1.5, 6], lookAt: [0, 0.5, 0] },
  // Loop back to hero feel
  { progress: 1, position: [0, 0, 5], lookAt: [0, 0, 0] },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// Smooth step for easing between keyframes
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

function getInterpolatedValues(progress: number) {
  // Find the two surrounding keyframes
  let lower = keyframes[0];
  let upper = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
      lower = keyframes[i];
      upper = keyframes[i + 1];
      break;
    }
  }

  const range = upper.progress - lower.progress;
  const t = range > 0 ? smoothStep((progress - lower.progress) / range) : 0;

  return {
    position: lerpVec3(lower.position, upper.position, t),
    lookAt: lerpVec3(lower.lookAt, upper.lookAt, t),
  };
}

export function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    const { position, lookAt } = getInterpolatedValues(scrollProgress);

    // Smooth follow toward target values (lerp factor controls transition speed)
    targetPos.current.set(...position);
    targetLookAt.current.set(...lookAt);

    camera.position.lerp(targetPos.current, 0.05);
    
    // Make camera look at the interpolated target
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(5).add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt);
  });

  return null;
}
