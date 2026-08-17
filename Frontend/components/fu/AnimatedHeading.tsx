"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type HeadingTag = "h1" | "h2" | "h3" | "h4";

interface AnimatedHeadingProps extends Omit<HTMLMotionProps<"h1">, "children"> {
  children: React.ReactNode;
  /** Etiqueta semántica a renderizar. Por defecto h2. */
  as?: HeadingTag;
  className?: string;
  /** Color de marca al hacer hover. Por defecto naranja FU. */
  hoverColor?: string;
  /** Si es true, hace fade-up al entrar en viewport. */
  reveal?: boolean;
}

/**
 * Título con micro-interacción de marca:
 * al pasar el mouse crece ligeramente y cambia de color.
 * No modifica ninguna lógica; es puramente presentacional.
 *
 * El cambio de color al hover se resuelve con CSS puro (no con
 * whileHover de Framer Motion): Framer cachea el color "de reposo"
 * leyendo el DOM una sola vez al montar, y si el tema (claro/oscuro)
 * cambia después, ese color cacheado queda desactualizado y el título
 * se puede volver invisible (blanco sobre blanco o negro sobre negro).
 * Con CSS, el color de reposo siempre se resuelve desde `fu-text`.
 */
export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  children,
  as = "h2",
  className = "",
  hoverColor = "#F37021",
  reveal = false,
  style,
  ...rest
}) => {
  const MotionTag = motion[as] as typeof motion.h2;

  const revealProps = reveal
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
      }
    : {};

  return (
    <MotionTag
      className={`fu-text fu-animated-heading font-display font-extrabold tracking-tight cursor-default transition-colors ${className}`}
      style={{ ["--fu-heading-hover" as any]: hoverColor, ...style }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...revealProps}
      {...rest}
    >
      {children}
    </MotionTag>
  );
};

export default AnimatedHeading;
