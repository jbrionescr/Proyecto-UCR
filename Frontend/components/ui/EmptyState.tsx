"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";
import { C } from "@/lib/theme";

export function EmptyState({ icon: Icon = LayoutGrid, title, sub, action }: any) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.celesteSoft, color: C.blue }}><Icon size={24} /></div>
      <div className="font-bold text-[15px]" style={{ color: C.ink }}>{title}</div>
      <div className="text-sm mt-1 max-w-sm" style={{ color: C.sub }}>{sub}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
