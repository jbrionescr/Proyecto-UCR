"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Ancho máx. del panel. Por defecto max-w-lg. */
  maxWidthClass?: string;
}

/**
 * Modal/popup que se abre como overlay sobre el fondo (parallax) que sigue
 * vivo detrás. No navega a otra página. Entra/sale con Framer Motion.
 * Cierra con Escape, click en el backdrop o el botón X.
 */
export const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop translúcido: deja ver el fondo parallax detrás */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${maxWidthClass} fu-card overflow-hidden`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            {/* Barra de color de marca */}
            <div className="h-1.5 w-full fu-hero-gradient animate-fu-gradient" />

            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              {title && (
                <h3 className="fu-text font-display text-xl font-extrabold tracking-tight">{title}</h3>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto rounded-full fu-surface-2 fu-text-2 p-2 transition-colors hover:text-fu-orange"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-3 fu-text-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default InfoModal;
