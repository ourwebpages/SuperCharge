"use client";

import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Centerpiece } from "./Centerpiece";
import { CursorLight } from "./CursorLight";
import { CameraRig } from "./CameraRig";
import { BackgroundParticles } from "./BackgroundParticles";
import { useMousePosition } from "@/hooks/useMousePosition";

interface HeroSceneProps {
  scrollProgress: number;
}

function SceneContent({ scrollProgress, mouseHook }: { scrollProgress: number; mouseHook: ReturnType<typeof useMousePosition> }) {
  const mouseRef = useRef(mouseHook.state);

  useFrame(() => {
    const updated = mouseHook.update(0.08);
    mouseRef.current = updated;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#c8d0ff" />
      <directionalLight position={[-3, -2, 4]} intensity={0.5} color="#6366f1" />
      <directionalLight position={[0, 2, -5]} intensity={0.7} color="#818cf8" />
      <CursorLight mouse={mouseRef.current} />
      <BackgroundParticles scrollProgress={scrollProgress} />
      <Centerpiece mouse={mouseRef.current} />
      <CameraRig scrollProgress={scrollProgress} />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function HeroScene({ scrollProgress }: HeroSceneProps) {
  const mouseHook = useMousePosition();

  // Notify the loading screen when the Canvas finishes initializing.
  // Uses a global callback set by LoadingScreen to avoid prop drilling.
  const handleCreated = useCallback(() => {
    const readyFn = (window as any).__superchargeLoadingReady;
    if (typeof readyFn === "function") {
      readyFn();
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
        onCreated={handleCreated}
      >
        <SceneContent scrollProgress={scrollProgress} mouseHook={mouseHook} />
      </Canvas>
    </div>
  );
}
