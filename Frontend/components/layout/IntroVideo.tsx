"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroVideo() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificamos si ya se reprodujo la introducción en esta sesión
    const hasPlayed = sessionStorage.getItem("hasPlayedIntro");
    if (!hasPlayed) {
      setShow(true);
    } else {
      document.documentElement.classList.remove("intro-playing");
    }
  }, []);

  // Bloqueamos el scroll del body mientras el intro esté activo
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("hasPlayedIntro", "true");
    document.documentElement.classList.remove("intro-playing");
  };

  // Si no está montado en el cliente o no debe mostrarse, no renderizamos nada
  if (!mounted || !show) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleClose}
          className="fixed inset-0 w-screen h-screen z-[9999] bg-[#030712] flex items-center justify-center overflow-hidden cursor-pointer"
        >
          {/* Elemento de Video de Fondo */}
          <video
            src="/intro-video.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleClose}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Sutil indicación visual que aparece y desaparece */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ delay: 2, duration: 3, repeat: Infinity, repeatDelay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-white/50 text-xs font-light tracking-widest uppercase select-none"
          >
            Toca en cualquier parte para omitir
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

