"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Progress({ value, tone = C.green, h = 8, showLabel }: any) {
  return (
    <div className="w-full">
      <div className="w-full rounded-full overflow-hidden" style={{ height: h, background: "#EDF1F7" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: tone }} />
      </div>
      {showLabel && <div className="text-[11px] mt-1 font-semibold" style={{ color: C.sub }}>{value}% completado</div>}
    </div>
  );
}
