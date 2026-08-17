"use client";

import React from "react";
import { C, FONT_DISP } from "@/lib/theme";

export function Eyebrow({ children, tone = C.naranja }: any) {
  return <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.16em]" style={{ color: tone, fontFamily: FONT_DISP }}>
    <span className="w-5 h-[2px] rounded-full" style={{ background: tone }} />{children}</div>;
}
