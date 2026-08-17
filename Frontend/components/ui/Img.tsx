"use client";

import React, { useState } from "react";
import { C } from "@/lib/theme";
import { Sunburst } from "@/components/brand";

export function Img({ src, alt, label, className = "", style = {} }: any) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: `linear-gradient(135deg, ${C.celeste}, ${C.blue})`, ...style }}>
        <div className="text-center px-4"><div className="flex justify-center"><Sunburst size={40} color="rgba(255,255,255,.7)" /></div><div className="text-white font-bold text-[12px] mt-2">{label || "UCR"}</div></div>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={className} style={{ objectFit: "cover", ...style }} />;
}
