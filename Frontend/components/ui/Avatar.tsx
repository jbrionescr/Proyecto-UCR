"use client";

import React from "react";
import { C } from "@/lib/theme";

export function Avatar({ name, size = 40, tone }: any) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const palette = [C.blue, C.green, C.amarillo, C.naranja, C.esmeralda, C.celeste];
  const bg = tone || palette[name.charCodeAt(0) % palette.length];
  const fg = bg === C.celeste || bg === C.green || bg === C.amarillo ? "#0a3a2a" : "#fff";
  return <div className="flex items-center justify-center rounded-full font-bold shrink-0" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}>{initials}</div>;
}
