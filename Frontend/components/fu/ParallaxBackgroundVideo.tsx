"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxBackgroundVideoProps {
  children?: React.ReactNode;
  className?: string;
  /** Video de fondo opcional (.mp4). */
  videoSrc?: string;
  /** GIF/imagen animada usada como núcleo luminoso. Por defecto el cerebro. */
  gifSrc?: string;
}

/**
 * Parallax cinematográfico inspirado en el video de referencia (cerebro
 * luminoso etéreo). Capas visibles a distintas velocidades + parallax de mouse
 * + un NÚCLEO ANIMADO real usando el GIF de referencia con halo de color.
 *
 * Usado en las páginas especiales (crear proyecto / ver proyecto).
 */
export const ParallaxBackgroundVideo: React.FC<ParallaxBackgroundVideoProps> = ({
  children,
  className = "",
  videoSrc,
  gifSrc = "/cerebro.gif",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLDivElement>(null); // nebulosa lejana
  const l2 = useRef<HTMLDivElement>(null); // rejilla
  const core = useRef<HTMLDivElement>(null); // núcleo gif + halo
  const l4 = useRef<HTMLDivElement>(null); // partículas cercanas

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (!reduce) {
        const layers: Array<[React.RefObject<HTMLDivElement>, number]> = [
          [l1, -60], [l2, -140], [core, -50], [l4, -220],
        ];
        layers.forEach(([ref, y]) => {
          if (!ref.current) return;
          gsap.to(ref.current, {
            y, ease: "none",
            scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.8 },
          });
        });
      }
    }, rootRef);

    const onMove = (e: MouseEvent) => {
      if (reduce || !rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      const move = (ref: React.RefObject<HTMLDivElement>, k: number) => {
        if (ref.current) gsap.to(ref.current, { x: cx * k, y: `+=${cy * k * 0.35}`, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      };
      move(l1, 16); move(l2, 36); move(core, 24); move(l4, 66);
    };
    window.addEventListener("mousemove", onMove);

    return () => { ctx.revert(); window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <div ref={rootRef} className={`relative min-h-screen overflow-hidden bg-[#070f1a] ${className}`}>
      {/* Video de fondo opcional */}
      {videoSrc && (
        <video className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen" src={videoSrc} autoPlay loop muted playsInline />
      )}

      {/* Capa 1 — nebulosa lejana de color */}
      <div ref={l1} className="pointer-events-none absolute -inset-[12%] -z-40"
        style={{ background: "radial-gradient(55% 55% at 28% 32%, rgba(0,93,164,0.6), transparent 70%), radial-gradient(50% 50% at 74% 68%, rgba(107,45,139,0.5), transparent 70%), radial-gradient(45% 45% at 60% 20%, rgba(0,192,243,0.4), transparent 70%)" }} />

      {/* Capa 2 — rejilla en perspectiva */}
      <div ref={l2} className="pointer-events-none absolute inset-x-0 bottom-0 -z-30 h-[70%] opacity-40"
        style={{
          backgroundImage: "linear-gradient(rgba(0,192,243,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,192,243,0.3) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "linear-gradient(to top, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent 85%)",
          transform: "perspective(600px) rotateX(62deg)", transformOrigin: "bottom",
        }} />

      {/* NÚCLEO — GIF del cerebro como orbe luminoso animado (visible) */}
      <div ref={core} className="pointer-events-none absolute inset-0 -z-20 flex items-start justify-center pt-[7vh]">
        <div className="relative flex items-center justify-center">
          {/* Halos de color detrás del gif */}
          <div className="absolute h-[62vmin] w-[62vmin] rounded-full bg-fu-blue-sky/35 blur-[110px] animate-fu-float" />
          <div className="absolute h-[40vmin] w-[40vmin] rounded-full bg-[#8b5cf6]/45 blur-[80px] animate-fu-blob" />
          {/* El gif: blend normal + máscara radial para fundir su fondo claro en el oscuro */}
          <img
            src={gifSrc}
            alt=""
            aria-hidden
            className="relative h-[64vmin] w-[64vmin] object-contain opacity-70 animate-fu-float drop-shadow-[0_0_80px_rgba(139,92,246,0.6)]"
            style={{
              WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 50%, transparent 70%)",
              maskImage: "radial-gradient(circle at 50% 45%, black 50%, transparent 70%)",
            }}
          />
        </div>
      </div>

      {/* Capa 4 — partículas cercanas */}
      <div ref={l4} className="pointer-events-none absolute inset-0 -z-10">
        {[
          ["12%", "22%", "10px", "#00C0F3"], ["82%", "30%", "6px", "#F37021"],
          ["68%", "72%", "12px", "#6DC067"], ["24%", "78%", "8px", "#FDB912"],
          ["48%", "16%", "5px", "#8ED8F8"], ["90%", "60%", "7px", "#E9C3E1"],
          ["36%", "44%", "4px", "#FFDD00"], ["58%", "86%", "6px", "#00C0F3"],
        ].map(([top, left, size, color], i) => (
          <span key={i} className="absolute rounded-full blur-[1px] animate-fu-float"
            style={{ top, left, width: size, height: size, backgroundColor: color as string, boxShadow: `0 0 18px ${color}`, animationDelay: `${i * 0.6}s` }} />
        ))}
      </div>

      {/* Viñeta suave para foco (sin tapar el cerebro) */}
      <div className="pointer-events-none absolute inset-0 -z-[5]"
        style={{ background: "radial-gradient(130% 130% at 50% 35%, transparent 62%, rgba(0,0,0,0.5))" }} />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxBackgroundVideo;
