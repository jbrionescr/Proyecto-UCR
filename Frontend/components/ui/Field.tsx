"use client";

import React from "react";
import { Check } from "lucide-react";
import { C } from "@/lib/theme";

export function Field({ label, children, hint, ok }: any) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold" style={{ color: C.ink }}>{label}</span>
        {ok && <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: C.greenDk }}><Check size={12} />válido</span>}
      </div>
      {children}
      {hint && <div className="text-[11.5px] mt-1" style={{ color: C.faint }}>{hint}</div>}
    </label>
  );
}

export const inputCls = "w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all";

export const inputSty = { border: `1px solid ${C.line}`, color: C.ink, background: "#fff" };
