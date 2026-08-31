"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Floating background dust/particles that drift slowly.
// Moves at 30% of the camera speed — when the camera pans,
// these particles lag behind, creating a parallax depth cue.
const COUNT = 200;

export function BackgroundParticles({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate random positions and speeds for each particle
  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 15 - 3,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.015,
      speedZ: (Math.random() - 0.5) * 0.01,
      scale: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Parallax offset — particles move at 30% of scroll speed
    const parallaxOffset = scrollProgress * 4;

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];

      // Slow drift + gentle float
      const x = p.x + Math.sin(time * p.speedX * 20 + p.phase) * 0.5;
      const y = p.y + Math.cos(time * p.speedY * 20 + p.phase) * 0.3 - parallaxOffset;
      const z = p.z;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(p.scale * (0.8 + Math.sin(time + p.phase) * 0.2));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
    </instancedMesh>
  );
}
