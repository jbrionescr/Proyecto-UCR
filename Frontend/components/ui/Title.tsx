"use client";

import React from "react";
import { C, FONT_DISP } from "@/lib/theme";

export function Title({ children, className = "", style = {}, upper }: any) {
  return <h2 className={`${upper ? "uppercase" : ""} ${className}`} style={{ fontFamily: FONT_DISP, fontWeight: 800, letterSpacing: upper ? ".01em" : "0", color: C.ink, lineHeight: 1.04, ...style }}>{children}</h2>;
}
