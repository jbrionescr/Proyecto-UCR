"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  strength?: number;
  /** Muestra orbes/aurora decorativos animados. */
  orbs?: boolean;
}

/**
 * Fondo con parallax al hacer scroll (GSAP + ScrollTrigger) + aurora animada.
 * Diseñado para ser vistoso: orbes de color grandes, aurora que respira y
 * malla de marca. Se adapta a tema claro/oscuro. Genérico y reutilizable.
 */
export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  className = "",
  strength = 140,
  orbs = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      if (auroraRef.current) {
        gsap.to(auroraRef.current, {
          yPercent: -14,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
      if (orbsRef.current) {
        gsap.to(orbsRef.current, {
          y: strength,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [strength]);

  return (
    <div ref={rootRef} className={`relative overflow-hidden fu-mesh ${className}`}>
      {/* Aurora animada de marca (colorida y visible) */}
      <div
        ref={auroraRef}
        className="pointer-events-none absolute -inset-[15%] -z-20 fu-hero-gradient animate-fu-gradient opacity-[0.22] dark:opacity-30 blur-3xl"
      />

      {/* Orbes de color grandes */}
      {orbs && (
        <div ref={orbsRef} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-16 h-[26rem] w-[26rem] rounded-full bg-fu-blue-sky/40 blur-[90px] animate-fu-blob" />
          <div className="absolute top-1/4 -right-24 h-[30rem] w-[30rem] rounded-full bg-fu-orange/30 blur-[100px] animate-fu-float" />
          <div className="absolute bottom-[-6rem] left-1/4 h-[28rem] w-[28rem] rounded-full bg-fu-green/30 blur-[100px] animate-fu-blob" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-fu-gold/25 blur-[90px] animate-fu-float" style={{ animationDelay: "1.2s" }} />
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxBackground;
