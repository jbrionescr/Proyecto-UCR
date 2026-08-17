"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type DialogVariant = "info" | "success" | "warning" | "error";

export type DialogAction = {
  label: string;
  value: unknown;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export type DialogConfig = {
  title?: string;
  message: string;
  variant?: DialogVariant;
  // Alert mode (single dismiss button)
  hideCancel?: boolean;
  buttonLabel?: string;
  // Confirm mode (confirm + cancel)
  confirmLabel?: string;
  cancelLabel?: string;
  // Multi-action mode
  actions?: DialogAction[];
};

type Props = {
  config: DialogConfig;
  onResolve: (value: unknown) => void;
};

const VARIANT_CFG = {
  info:    { Icon: Info,          iconBg: "bg-blue-100",   iconText: "text-blue-600"   },
  success: { Icon: CheckCircle2,  iconBg: "bg-green-100",  iconText: "text-green-600"  },
  warning: { Icon: AlertTriangle, iconBg: "bg-amber-100",  iconText: "text-amber-600"  },
  error:   { Icon: AlertCircle,   iconBg: "bg-red-100",    iconText: "text-red-600"    },
};

const BTN: Record<string, string> = {
  primary:   "bg-primary hover:bg-primary/90 text-primary-foreground",
  secondary: "border border-slate-200 hover:bg-slate-50 text-slate-700",
  danger:    "bg-red-600 hover:bg-red-700 text-white",
  ghost:     "hover:bg-slate-100 text-slate-600",
};

export function ConfirmDialog({ config, onResolve }: Props) {
  const {
    title, message, variant = "info",
    hideCancel, buttonLabel,
    confirmLabel, cancelLabel,
    actions,
  } = config;

  const { Icon, iconBg, iconText } = VARIANT_CFG[variant];

  // Build the action buttons list
  const mainActions: DialogAction[] = actions ?? [
    {
      label: confirmLabel ?? (hideCancel ? (buttonLabel ?? "Entendido") : "Confirmar"),
      value: true,
      variant: variant === "error" || variant === "warning" ? "danger" : "primary",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onResolve(null); }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
        style={{ animation: "dialogIn 150ms cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-3">
          <div className={`mt-0.5 h-9 w-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${iconText}`} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            {title && (
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">
                {title}
              </h3>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => onResolve(null)}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end px-6 pb-6 pt-2">
          {!hideCancel && (
            <button
              onClick={() => onResolve(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${BTN.ghost}`}
            >
              {cancelLabel ?? "Cancelar"}
            </button>
          )}
          {mainActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onResolve(action.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${BTN[action.variant ?? "primary"]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
