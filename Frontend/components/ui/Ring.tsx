"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Ring({ value, size = 56, stroke = 6 }: any) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const color = value >= 85 ? C.greenDk : value >= 70 ? C.blue : C.amarillo;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF1F7" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ color, fontSize: size * 0.27 }}>{value}</div>
    </div>
  );
}
