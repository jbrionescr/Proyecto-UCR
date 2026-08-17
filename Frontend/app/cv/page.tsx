import { redirect } from "next/navigation";

// Ruta renombrada a /mi-curriculum según el spec de la plataforma
export default function CVRedirect() {
  redirect("/mi-curriculum");
}
