"use client";

import React from "react";

export function Isotipo({ color = "#fff", size = 34 }: any) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 240 210" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M120 124 L120 150" strokeWidth="15" />
        <path d="M120 150 L103 194" strokeWidth="15" />
        <path d="M120 150 L137 194" strokeWidth="15" />
        <path d="M117 122 C88 98 68 100 54 114" strokeWidth="15" />
        <path d="M120 106 C96 82 76 80 60 90" strokeWidth="12.5" />
        <path d="M123 122 C152 98 172 100 186 114" strokeWidth="15" />
        <path d="M120 106 C144 82 164 80 180 90" strokeWidth="12.5" />
      </g>
      <g fill={color}>
        <circle cx="72" cy="72" r="10.5" /><circle cx="110" cy="56" r="10.5" /><circle cx="148" cy="68" r="10.5" />
      </g>
    </svg>
  );
}
