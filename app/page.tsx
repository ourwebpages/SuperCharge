"use client";

import { useMemo, useState, useCallback } from "react";
import { HeroScene } from "./components/canvas/HeroScene";
import { HeroOverlay } from "./components/ui/HeroOverlay";
import { AboutOverlay, WorkOverlay, ServicesOverlay, ContactOverlay } from "./components/ui/SectionOverlay";
import { Nav } from "./components/ui/Nav";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { ParallaxLayer, GradientOrb } from "./components/ui/ParallaxLayer";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const SECTIONS = [
  { id: "hero", start: 0, end: 0.2 },
  { id: "about", start: 0.2, end: 0.4 },
  { id: "work", start: 0.4, end: 0.6 },
  { id: "services", start: 0.6, end: 0.8 },
  { id: "contact", start: 0.8, end: 1.0 },
];

function getActiveSection(progress: number): string {
  for (const section of SECTIONS) {
    if (progress >= section.start && progress < section.end) {
      return section.id;
    }
  }
  return "contact";
}

export default function Home() {
  const scrollProgress = useScrollProgress();
  const activeSection = useMemo(() => getActiveSection(scrollProgress), [scrollProgress]);
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      {/* Loading screen -- fades out once the 3D scene is ready */}
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Fixed 3D canvas behind everything */}
      <HeroScene scrollProgress={scrollProgress} />

      {/* Fixed navigation */}
      <Nav activeSection={activeSection} />

      {/* Mid-ground gradient orbs -- drift at parallax speed between 3D and content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <GradientOrb color="#4f46e5" size={600} x="-10%" y="20%" speed={0.3} blur={100} />
        <GradientOrb color="#06b6d4" size={500} x="70%" y="50%" speed={0.5} blur={120} />
        <GradientOrb color="#7c3aed" size={400} x="20%" y="70%" speed={0.4} blur={90} />
      </div>

      {/* Scrollable content layer */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Hero section */}
        <section id="hero" className="relative h-screen flex items-center justify-center">
          <HeroOverlay activeSection={activeSection} />
        </section>

        {/* About section */}
        <section id="about" className="relative h-screen flex items-center justify-center">
          <ParallaxLayer speed={0.15} className="w-full flex items-center justify-center">
            <AboutOverlay activeSection={activeSection} />
          </ParallaxLayer>
        </section>

        {/* Work section */}
        <section id="work" className="relative h-screen flex items-center justify-center">
          <ParallaxLayer speed={0.2} className="w-full flex items-center justify-center">
            <WorkOverlay activeSection={activeSection} />
          </ParallaxLayer>
        </section>

        {/* Services section */}
        <section id="services" className="relative h-screen flex items-center justify-center">
          <ParallaxLayer speed={0.1} className="w-full flex items-center justify-center">
            <ServicesOverlay activeSection={activeSection} />
          </ParallaxLayer>
        </section>

        {/* Contact section */}
        <section id="contact" className="relative h-screen flex items-center justify-center">
          <ParallaxLayer speed={0.05} className="w-full flex items-center justify-center">
            <ContactOverlay activeSection={activeSection} />
          </ParallaxLayer>
        </section>
      </div>
    </>
  );
}
