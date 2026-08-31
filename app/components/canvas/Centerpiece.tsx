"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MouseState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  distance: number;
  angle: number;
}

function EnergyParticle({
  radius,
  speed,
  offset,
  mouse,
}: {
  radius: number;
  speed: number;
  offset: number;
  mouse: MouseState;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    const angle = time * speed + offset;

    const baseX = Math.cos(angle) * radius;
    const baseY = Math.sin(angle * 0.7) * radius * 0.4 + Math.sin(angle) * 0.2;
    const baseZ = Math.sin(angle) * radius * 0.6;

    const mouseInfluence = mouse.distance * 0.4;

    ref.current.position.x = baseX + mouse.x * mouseInfluence;
    ref.current.position.y = baseY + mouse.y * mouseInfluence * 0.5;
    ref.current.position.z = baseZ + mouse.distance * 0.15;

    const activityBoost = Math.abs(mouse.vx) + Math.abs(mouse.vy);
    const pulse = Math.sin(time * 3 + offset) * 0.3 + 0.7 + activityBoost * 3;
    ref.current.scale.setScalar(Math.min(pulse, 1.3));
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.06, 0]} />
      <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2} transparent opacity={0.9} />
    </mesh>
  );
}

// Wireframe globe with cursor-proximity glow and pulse
function WireframeGlobe({ mouse }: { mouse: MouseState }) {
  const groupRef = useRef<THREE.Group>(null);
  const mainMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);

  const smooth = useRef({ rotY: 0, rotX: 0, rotZ: 0, posX: 0, posY: 0 });

  // Generate latitude/longitude line geometry
  const gridGeometry = useMemo(() => {
    const RADIUS = 1.4;
    const LATITUDES = 12;
    const LONGITUDES = 18;
    const vertices: number[] = [];

    for (let i = 1; i < LATITUDES; i++) {
      const phi = (Math.PI * i) / LATITUDES;
      const ringRadius = RADIUS * Math.sin(phi);
      const y = RADIUS * Math.cos(phi);
      const segments = 64;
      for (let j = 0; j < segments; j++) {
        const t1 = (2 * Math.PI * j) / segments;
        const t2 = (2 * Math.PI * ((j + 1) % segments)) / segments;
        vertices.push(
          Math.cos(t1) * ringRadius, y, Math.sin(t1) * ringRadius,
          Math.cos(t2) * ringRadius, y, Math.sin(t2) * ringRadius
        );
      }
    }

    for (let i = 0; i < LONGITUDES; i++) {
      const theta = (2 * Math.PI * i) / LONGITUDES;
      const segments = 32;
      for (let j = 0; j < segments; j++) {
        const p1 = (Math.PI * j) / segments;
        const p2 = (Math.PI * (j + 1)) / segments;
        vertices.push(
          RADIUS * Math.sin(p1) * Math.cos(theta), RADIUS * Math.cos(p1), RADIUS * Math.sin(p1) * Math.sin(theta),
          RADIUS * Math.sin(p2) * Math.cos(theta), RADIUS * Math.cos(p2), RADIUS * Math.sin(p2) * Math.sin(theta)
        );
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  // Custom shader — makes lines glow based on cursor proximity and time
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#3b82f6") },
      uGlowColor: { value: new THREE.Color("#93c5fd") },
      uBaseOpacity: { value: 0.35 },
      uMaxOpacity: { value: 1.0 },
    }),
    []
  );

  const vertexShader = `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uBaseOpacity;
    uniform float uMaxOpacity;

    varying vec3 vPosition;

    void main() {
      // Project cursor direction onto the sphere surface
      vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 0.5));

      // Distance from this vertex to the cursor direction on the sphere
      vec3 normalizedPos = normalize(vPosition);
      float dotProduct = dot(normalizedPos, mouseDir);
      float proximity = smoothstep(-0.2, 0.8, dotProduct);

      // Pulse effect — a traveling wave from the cursor direction
      float wave = sin(dotProduct * 4.0 - uTime * 2.0) * 0.5 + 0.5;
      float pulse = proximity * wave * 0.4;

      // Combine base opacity with proximity glow and pulse
      float opacity = uBaseOpacity + proximity * (uMaxOpacity - uBaseOpacity) * 0.6 + pulse;

      // Color shifts toward brighter glow color near cursor
      vec3 finalColor = mix(uColor, uGlowColor, proximity * 0.5 + pulse * 0.3);

      gl_FragColor = vec4(finalColor, opacity);
    }
  `;

  // Glow layer — additive blend, slightly offset, for bloom-like effect
  const glowUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color("#60a5fa") },
    }),
    []
  );

  const glowFragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor;

    varying vec3 vPosition;

    void main() {
      vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 0.5));
      vec3 normalizedPos = normalize(vPosition);
      float dotProduct = dot(normalizedPos, mouseDir);
      float proximity = smoothstep(0.0, 1.0, dotProduct);

      // Glow only near cursor
      float glow = proximity * 0.25;
      float wave = sin(dotProduct * 3.0 - uTime * 1.5) * 0.5 + 0.5;
      glow += proximity * wave * 0.1;

      gl_FragColor = vec4(uColor, glow);
    }
  `;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Update shader uniforms
    if (mainMatRef.current) {
      mainMatRef.current.uniforms.uTime.value = time;
      mainMatRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uTime.value = time;
      glowMatRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }

    // Smooth rotation
    const baseRotY = time * 0.06;
    const cursorTiltY = mouse.x * 0.5;
    const cursorTiltX = mouse.y * 0.3;
    const velocityTiltY = mouse.vx * 1.2;
    const velocityTiltX = mouse.vy * 0.8;

    const targetRotY = baseRotY + cursorTiltY + velocityTiltY;
    const targetRotX = cursorTiltX + velocityTiltX;
    const targetRotZ = mouse.vx * 0.15;

    smooth.current.rotY += (targetRotY - smooth.current.rotY) * 0.05;
    smooth.current.rotX += (targetRotX - smooth.current.rotX) * 0.05;
    smooth.current.rotZ += (targetRotZ - smooth.current.rotZ) * 0.04;

    groupRef.current.rotation.y = smooth.current.rotY;
    groupRef.current.rotation.x = smooth.current.rotX;
    groupRef.current.rotation.z = smooth.current.rotZ;

    // Smooth position
    const targetPosX = mouse.x * 0.25;
    const targetPosY = mouse.y * 0.18;
    smooth.current.posX += (targetPosX - smooth.current.posX) * 0.04;
    smooth.current.posY += (targetPosY - smooth.current.posY) * 0.04;
    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
  });

  return (
    <group ref={groupRef}>
      {/* Main wireframe lines — cursor-reactive glow */}
      <lineSegments geometry={gridGeometry}>
        <shaderMaterial
          ref={mainMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>

      {/* Glow layer — additive blend for luminance */}
      <lineSegments geometry={gridGeometry}>
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={vertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
                    blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export function Centerpiece({ mouse }: { mouse: MouseState }) {
  const particles = useMemo(
    () => [
      { radius: 2.0, speed: 0.6, offset: 0 },
      { radius: 2.2, speed: -0.45, offset: Math.PI * 0.5 },
      { radius: 1.8, speed: 0.8, offset: Math.PI },
      { radius: 2.4, speed: -0.35, offset: Math.PI * 1.5 },
      { radius: 2.1, speed: 0.55, offset: Math.PI * 0.25 },
      { radius: 2.3, speed: -0.5, offset: Math.PI * 0.75 },
    ],
    []
  );

  return (
    <group>
      <WireframeGlobe mouse={mouse} />
      {particles.map((p, i) => (
        <EnergyParticle key={i} {...p} mouse={mouse} />
      ))}
    </group>
  );
}