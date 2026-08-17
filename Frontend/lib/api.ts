import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Obtener la sesión activa para inyectar el token si existe
  const session = await getSession();

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.user && (session.user as any).accessToken) {
    headers.set("Authorization", `Bearer ${(session.user as any).accessToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Manejar 401: token expirado o inválido → cerrar sesión y redirigir al login
  if (response.status === 401) {
    await signOut({ redirectTo: "/login" });
    throw new Error("Sesión expirada. Por favor vuelve a iniciar sesión.");
  }

  // Intentar parsear JSON, si falla retornar null
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error ${response.status} en la petición a la API`);
  }

  return data;
}
