"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { createPortal } from "react-dom";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

export function UserDropdown() {
  const { data: session } = useSession();
  const imageUrl = session?.user?.image || "https://github.com/shadcn.png";
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalcula la posición del dropdown basado en el botón del avatar
  const updatePos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  // Cierra al hacer click fuera o al hacer scroll/resize
  useEffect(() => {
    if (!open) return;

    function handleClose(e: MouseEvent) {
      if (buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleScrollResize(e: Event) {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClose);
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      document.removeEventListener("mousedown", handleClose);
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) updatePos();
    setOpen((v) => !v);
  };

  return (
    <>
      {/* Botón avatar */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#0f4c81] transition-all overflow-hidden focus:outline-none focus:ring-[#0f4c81]"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <img src={imageUrl} alt="User" className="h-full w-full object-cover" />
      </button>

      {/* Dropdown en portal → renderizado en document.body, sin stacking context padre */}
      {mounted && open && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 99999,
          }}
          className="w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          // Evita que mousedown en el dropdown cierre el menú
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Info usuario */}
          {session?.user?.name && (
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {session.user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
            </div>
          )}

          <Link
            href="/perfil/editar"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            onClick={async () => {
              startTransition(async () => {
                await signOut({ redirect: false });
                window.location.href = "/login";
              });
            }}
            disabled={isPending}
            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 font-medium transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <LogOut className={`h-4 w-4 ${isPending ? "animate-pulse" : ""}`} />
            {isPending ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
