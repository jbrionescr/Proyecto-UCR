"use client";

import React from "react";
import { motion } from "framer-motion";

interface SunflowerImageProps {
  className?: string;
  /** Tamaño en px (ancho/alto máx). */
  size?: number;
  /** Ruta de la imagen. Por defecto el girasol ornamental. */
  src?: string;
  /** Rotación continua suave. */
  spin?: boolean;
}

/**
 * Girasol ornamental (imagen real) como elemento decorativo de marca:
 * flota, tiene un halo de color detrás y reacciona al hover. Guarda
 * relación con el girasol 3D pero garantiza mostrar la ilustración exacta.
 */
export const SunflowerImage: React.FC<SunflowerImageProps> = ({
  className = "",
  size = 260,
  src = "/girasol.png",
  spin = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Halo de color detrás */}
      <div className="absolute inset-0 -z-10 rounded-full bg-fu-gold/30 blur-3xl animate-fu-blob" />
      <div className="absolute inset-6 -z-10 rounded-full bg-fu-orange/25 blur-2xl animate-fu-float" />

      <motion.img
        src={src}
        alt="Girasol de la Fundación"
        className="h-full w-full object-contain drop-shadow-[0_10px_40px_rgba(243,112,33,0.35)] select-none"
        draggable={false}
        animate={spin ? { rotate: 360 } : undefined}
        transition={spin ? { duration: 60, repeat: Infinity, ease: "linear" } : undefined}
        whileHover={{ scale: 1.06 }}
        style={{ willChange: "transform" }}
      />
    </div>
  );
};

export default SunflowerImage;
