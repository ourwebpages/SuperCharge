"use client";

import { content } from "@/lib/content";
import { useInView } from "@/hooks/useInView";

interface SectionOverlayProps {
  activeSection: string;
}

function SectionWrapper({ id, activeSection, children }: { id: string; activeSection: string; children: React.ReactNode }) {
  const isActive = activeSection === id;
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ zIndex: 10 }}
    >
      <div className="pointer-events-auto max-w-2xl w-full">{children}</div>
    </div>
  );
}

function AnimCard({ inView, active, delay, children }: { inView: boolean; active: boolean; delay?: string; children: React.ReactNode }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
      style={{ transitionDelay: delay || "0ms" }}
    >
      {children}
    </div>
  );
}

function FadeIn({ inView, delay, className, children }: { inView: boolean; delay?: string; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`transition-all duration-500 ease-out ${inView ? 'opacity-100 translate-y-4' : 'opacity-0 translate-y-6'} ${className || ''}`}
      style={{ transitionDelay: delay || "0ms" }}
    >
      {children}
    </div>
  );
}

export function AboutOverlay({ activeSection }: SectionOverlayProps) {
  const isActive = activeSection === "about";
  const { ref, isInView } = useInView({ threshold: 0.2, once: false });
  return (
    <SectionWrapper id="about" activeSection={activeSection}>
      <div ref={ref} className="bg-black/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10">
        <AnimCard inView={isInView} active={isActive} delay="0ms">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About</h2>
        </AnimCard>
        <AnimCard inView={isInView} active={isActive} delay="100ms">
          <div className="text-zinc-300 text-lg leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: content.about.bioHtml }} />
        </AnimCard>
        <div className="flex flex-wrap gap-2">
          {content.about.skills.map((skill, i) => (
            <FadeIn key={skill} inView={isInView} delay={`${150 + i * 75}ms`} className="inline-block">
              <span className="px-3 py-1 text-sm font-medium text-indigo-300 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                {skill}
              </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export function WorkOverlay({ activeSection }: SectionOverlayProps) {
  const isActive = activeSection === "work";
  const { ref, isInView } = useInView({ threshold: 0.2, once: false });
  return (
    <SectionWrapper id="work" activeSection={activeSection}>
      <div ref={ref} className="bg-black/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10">
        <AnimCard inView={isInView} active={isActive} delay="0ms">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Work</h2>
        </AnimCard>
        <div className="space-y-6">
          {content.work.map((project, i) => (
            <FadeIn key={project.id} inView={isInView} delay={`${100 + i * 150}ms`}>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="block group">
                <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                <p className="text-zinc-400 text-sm mt-1">{project.description}</p>
                <p className="text-indigo-400 text-sm mt-2 font-medium">{project.outcome}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export function ServicesOverlay({ activeSection }: SectionOverlayProps) {
  const isActive = activeSection === "services";
  const { ref, isInView } = useInView({ threshold: 0.2, once: false });
  return (
    <SectionWrapper id="services" activeSection={activeSection}>
      <div ref={ref} className="bg-black/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10">
        <AnimCard inView={isInView} active={isActive} delay="0ms">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Services</h2>
        </AnimCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.services.map((service, i) => (
            <FadeIn key={service.title} inView={isInView} delay={`${100 + i * 100}ms`}>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 h-full">
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

export function ContactOverlay({ activeSection }: SectionOverlayProps) {
  const isActive = activeSection === "contact";
  const { ref, isInView } = useInView({ threshold: 0.2, once: false });
  return (
    <SectionWrapper id="contact" activeSection={activeSection}>
      <div ref={ref} className="bg-black/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10 text-center">
        <AnimCard inView={isInView} active={isActive} delay="0ms">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get in Touch</h2>
        </AnimCard>
        <AnimCard inView={isInView} active={isActive} delay="100ms">
          <p className="text-zinc-400 text-lg mb-8">Ready to build something extraordinary? Reach out and let&apos;s talk.</p>
        </AnimCard>
        <AnimCard inView={isInView} active={isActive} delay="200ms">
          <a href={`mailto:${content.contact.email}`} className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-full transition-colors mb-8">
            {content.contact.email}
          </a>
        </AnimCard>
        <div className="flex justify-center gap-6">
          {content.contact.socials.map((social, i) => (
            <FadeIn key={social.label} inView={isInView} delay={`${250 + i * 100}ms`}>
              <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                {social.label}
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
