"use client";

import React from "react";
import { C, FONT_DISP } from "@/lib/theme";
import { Isotipo } from "@/components/brand/Isotipo";

export function Brand({ light, size = 34 }: any) {
  const iso = light ? "#fff" : C.blue;
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Isotipo color={iso} size={size} />
      <div className="leading-[0.86]">
        <div className="uppercase" style={{ fontFamily: FONT_DISP, fontWeight: 800, letterSpacing: ".04em", fontSize: size * 0.56, color: light ? "#fff" : C.ink }}>Alumni</div>
        <div className="uppercase" style={{ fontFamily: FONT_DISP, fontWeight: 700, letterSpacing: ".06em", fontSize: size * 0.5, color: light ? C.celeste : C.blue }}>UCR</div>
      </div>
    </div>
  );
}
