"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Toggle de tema claro/oscuro para la Topbar.
 * Reutiliza el ThemeContext existente (persiste en localStorage y
 * conmuta la clase `.dark` en <html>). No duplica lógica de estado.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:text-[#F37021] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="flex items-center justify-center"
      >
        {isDark ? <Sun className="h-4.5 w-4.5" size={18} /> : <Moon className="h-4.5 w-4.5" size={18} />}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
