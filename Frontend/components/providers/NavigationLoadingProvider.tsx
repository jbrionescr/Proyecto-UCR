"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BookLoader } from "@/components/ui/BookLoader";

interface NavLoadingContextType {
  startLoading: () => void;
  stopLoading: () => void;
}

const NavLoadingContext = createContext<NavLoadingContextType>({
  startLoading: () => {},
  stopLoading: () => {},
});

export function useNavLoading() {
  return useContext(NavLoadingContext);
}

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  // Keep currentPathRef in sync
  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname, searchParams]);

  // Hide loader when route actually changes
  useEffect(() => {
    if (isLoadingRef.current) {
      isLoadingRef.current = false;
      setLoading(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [pathname, searchParams]);

  const startLoading = useCallback(() => {
    isLoadingRef.current = true;
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Safety fallback: hide after 4 s max
    timerRef.current = setTimeout(() => {
      isLoadingRef.current = false;
      setLoading(false);
    }, 4000);
  }, []);

  const stopLoading = useCallback(() => {
    isLoadingRef.current = false;
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Intercept all internal anchor clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external / special links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#")
      ) return;

      // Normalize href and compare with current path
      const clickedPath = href.split("?")[0].split("#")[0];
      if (!clickedPath.startsWith("/")) return;
      if (clickedPath === currentPathRef.current) return;

      startLoading();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startLoading]);

  return (
    <NavLoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}

      {/* Full-screen overlay */}
      <div
        aria-hidden={!loading}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(248, 250, 252, 0.93)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "opacity 0.22s ease, visibility 0.22s ease",
          opacity: loading ? 1 : 0,
          visibility: loading ? "visible" : "hidden",
          pointerEvents: loading ? "all" : "none",
        }}
      >
        <BookLoader message="Cargando" />
      </div>
    </NavLoadingContext.Provider>
  );
}
