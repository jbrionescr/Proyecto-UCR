"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { ConfirmDialog, type DialogConfig } from "@/components/ui/ConfirmDialog";

type Resolver = (value: unknown) => void;

interface DialogContextValue {
  /** Muestra un modal informativo con un solo botón de cierre. */
  showAlert: (message: string, opts?: Partial<DialogConfig>) => Promise<void>;
  /** Muestra un modal de confirmación. Devuelve true si el usuario confirma. */
  showConfirm: (message: string, opts?: Partial<DialogConfig>) => Promise<boolean>;
  /** Modal de propósito general. Devuelve el value del botón pulsado o null si se cierra. */
  showDialog: (config: DialogConfig) => Promise<unknown>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  const showDialog = useCallback((cfg: DialogConfig): Promise<unknown> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfig(cfg);
    });
  }, []);

  const handleResolve = useCallback((value: unknown) => {
    setConfig(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const showAlert = useCallback(
    (message: string, opts?: Partial<DialogConfig>) =>
      showDialog({
        variant: "info",
        ...opts,
        message,
        hideCancel: true,
        confirmLabel: opts?.buttonLabel ?? opts?.confirmLabel ?? "Entendido",
      }).then(() => undefined),
    [showDialog],
  );

  const showConfirm = useCallback(
    (message: string, opts?: Partial<DialogConfig>) =>
      showDialog({ variant: "warning", ...opts, message }).then((v) => v === true),
    [showDialog],
  );

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showDialog }}>
      {children}
      {config && <ConfirmDialog config={config} onResolve={handleResolve} />}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog debe usarse dentro de <DialogProvider>");
  return ctx;
}
