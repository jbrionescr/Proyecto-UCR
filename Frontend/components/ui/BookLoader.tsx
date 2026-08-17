"use client";

import { useState, useEffect } from "react";

interface BookLoaderProps {
  message?: string;
}

export function BookLoader({ message = "Cargando..." }: BookLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", opacity: 0.8 }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.17em", color: "#02477B", textTransform: "uppercase" }}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes book-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes flip-page {
          0%   { transform: rotateY(0deg);    z-index: 10; }
          49%  { transform: rotateY(-90deg);  z-index: 10; }
          50%  { transform: rotateY(-90deg);  z-index: 10; }
          100% { transform: rotateY(-180deg); z-index: 10; }
        }
        @keyframes flip-page-2 {
          0%   { transform: rotateY(0deg);    z-index: 9; }
          49%  { transform: rotateY(-90deg);  z-index: 9; }
          50%  { transform: rotateY(-90deg);  z-index: 9; }
          100% { transform: rotateY(-180deg); z-index: 9; }
        }
        @keyframes flip-page-3 {
          0%   { transform: rotateY(0deg);    z-index: 8; }
          49%  { transform: rotateY(-90deg);  z-index: 8; }
          50%  { transform: rotateY(-90deg);  z-index: 8; }
          100% { transform: rotateY(-180deg); z-index: 8; }
        }

        @keyframes spine-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0,192,243,0.4); }
          50%       { box-shadow: 0 0 16px rgba(0,192,243,0.85); }
        }

        @keyframes dot-pop {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.35; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* ── Wrapper ── */
        .bk-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          animation: book-fadein 0.35s ease both;
        }

        /* ── Scene: 196 × 112 px ── */
        .bk-scene {
          perspective: 500px;
          perspective-origin: center center;
          width: 196px;
          height: 112px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Book body: 196 × 105 px ── */
        .bk-book {
          position: relative;
          width: 196px;
          height: 105px;
          transform-style: preserve-3d;
          display: flex;
          align-items: stretch;
        }

        /* ── Left cover: 84 × 105 px ── */
        .bk-left {
          flex: 0 0 84px;
          height: 105px;
          background: linear-gradient(160deg, #1a5fa8 0%, #02477B 60%, #013360 100%);
          border-radius: 2px 0 0 2px;
          position: relative;
          box-shadow: -4px 5px 14px rgba(0,0,0,0.28);
        }
        .bk-left::before {
          content: '';
          position: absolute;
          inset: 7px 8px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 1px;
        }
        .bk-left::after {
          content: '';
          position: absolute;
          top: 14px; left: 14px; right: 14px;
          height: 1.5px;
          background: rgba(255,255,255,0.18);
          box-shadow:
            0 7px  0 rgba(255,255,255,0.12),
            0 14px 0 rgba(255,255,255,0.10),
            0 21px 0 rgba(255,255,255,0.08),
            0 28px 0 rgba(255,255,255,0.06),
            0 35px 0 rgba(255,255,255,0.05),
            0 42px 0 rgba(255,255,255,0.04),
            0 49px 0 rgba(255,255,255,0.03);
        }

        /* ── Spine: 11 × 105 px ── */
        .bk-spine {
          flex: 0 0 11px;
          height: 105px;
          background: linear-gradient(180deg, #00C0F3 0%, #0284C7 40%, #02477B 100%);
          position: relative;
          z-index: 20;
          animation: spine-glow 1.8s ease-in-out infinite;
        }

        /* ── Right cover: 84 × 105 px ── */
        .bk-right {
          flex: 0 0 84px;
          height: 105px;
          background: linear-gradient(160deg, #013360 0%, #02477B 50%, #1a5fa8 100%);
          border-radius: 0 2px 2px 0;
          position: relative;
          box-shadow: 4px 5px 14px rgba(0,0,0,0.28);
        }
        .bk-right::before {
          content: '';
          position: absolute;
          inset: 7px 8px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 1px;
        }

        /* ── Pages stack left (read) ── */
        .bk-pages-left {
          position: absolute;
          top: 4px; left: 7px;
          width: 77px; height: 97px;
        }
        .bk-page-left-sheet {
          position: absolute;
          inset: 0;
          border-radius: 1px 0 0 1px;
          background: #e8f1fb;
        }
        .bk-page-left-sheet:nth-child(2) { background: #dbe9f8; left: 1px; }
        .bk-page-left-sheet:nth-child(3) { background: #cde1f5; left: 2px; }

        /* ── Pages stack right (unread) ── */
        .bk-pages-right {
          position: absolute;
          top: 4px; right: 7px;
          width: 77px; height: 97px;
        }
        .bk-page-right-sheet {
          position: absolute;
          inset: 0;
          border-radius: 0 1px 1px 0;
          background: #f5f9fe;
        }
        .bk-page-right-sheet:nth-child(2) { background: #eef5fb; right: 1px; }
        .bk-page-right-sheet:nth-child(3) { background: #e5eff9; right: 2px; }

        /* ── Flipping pages
             left = 7(margin) + 84(cover) + 11(spine) = 102px ── */
        .bk-flipping {
          position: absolute;
          top: 4px;
          left: 102px;
          width: 77px;
          height: 97px;
          transform-style: preserve-3d;
        }

        .bk-flip-page {
          position: absolute;
          inset: 0;
          border-radius: 0 1px 1px 0;
          transform-origin: left center;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .bk-flip-page::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0 1px 1px 0;
          background: #f0f7ff;
        }
        .bk-flip-page::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0 1px 1px 0;
          background: #dce9f7;
          transform: rotateY(180deg);
          backface-visibility: hidden;
        }

        .bk-flip-lines {
          position: absolute;
          top: 8px; left: 6px; right: 6px;
          height: 1.5px;
          background: rgba(2,71,123,0.12);
          border-radius: 1px;
          box-shadow:
            0 6px  0 rgba(2,71,123,0.10),
            0 12px 0 rgba(2,71,123,0.10),
            0 18px 0 rgba(2,71,123,0.09),
            0 24px 0 rgba(2,71,123,0.08),
            0 30px 0 rgba(2,71,123,0.07),
            0 36px 0 rgba(2,71,123,0.06),
            0 42px 0 rgba(2,71,123,0.05),
            0 48px 0 rgba(2,71,123,0.04),
            0 54px 0 rgba(2,71,123,0.03),
            0 60px 0 rgba(2,71,123,0.03),
            0 66px 0 rgba(2,71,123,0.02),
            0 72px 0 rgba(2,71,123,0.02);
          z-index: 1;
        }

        .bk-flip-page:nth-child(1) {
          animation: flip-page   2.2s cubic-bezier(0.4,0.0,0.6,1.0) infinite;
          animation-delay: 0s;
        }
        .bk-flip-page:nth-child(2) {
          animation: flip-page-2 2.2s cubic-bezier(0.4,0.0,0.6,1.0) infinite;
          animation-delay: 0.22s;
        }
        .bk-flip-page:nth-child(3) {
          animation: flip-page-3 2.2s cubic-bezier(0.4,0.0,0.6,1.0) infinite;
          animation-delay: 0.42s;
        }

        /* ── Label ── */
        .bk-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.17em;
          color: #02477B;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .bk-dots span {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #00C0F3;
          margin: 0 2px;
          animation: dot-pop 1.4s ease-in-out infinite;
        }
        .bk-dots span:nth-child(2) { animation-delay: 0.2s; }
        .bk-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="bk-wrap" role="status" aria-label={message}>
        <div className="bk-scene">
          <div className="bk-book">
            <div className="bk-left" />
            <div className="bk-spine" />
            <div className="bk-right" />

            {/* Páginas leídas (izquierda) */}
            <div className="bk-pages-left">
              <div className="bk-page-left-sheet" />
              <div className="bk-page-left-sheet" />
              <div className="bk-page-left-sheet" />
            </div>

            {/* Páginas por leer (derecha) */}
            <div className="bk-pages-right">
              <div className="bk-page-right-sheet" />
              <div className="bk-page-right-sheet" />
              <div className="bk-page-right-sheet" />
            </div>

            {/* Páginas volando */}
            <div className="bk-flipping">
              <div className="bk-flip-page"><div className="bk-flip-lines" /></div>
              <div className="bk-flip-page"><div className="bk-flip-lines" /></div>
              <div className="bk-flip-page"><div className="bk-flip-lines" /></div>
            </div>
          </div>
        </div>

        <div className="bk-label">
          <span>{message}</span>
          <span className="bk-dots"><span /><span /><span /></span>
        </div>
      </div>
    </>
  );
}
