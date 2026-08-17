"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Sunburst({ size = 56, color = C.amarillo }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
      <g fill={color}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="46" y="4" width="8" height="22" rx="4" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="15" />
      </g>
    </svg>
  );
}
