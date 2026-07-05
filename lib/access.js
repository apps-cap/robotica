import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Devuelve el usuario de sesión (con rol/grado ya resueltos) o redirige a /login.
export async function requireUsuario() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.rol) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUsuario();
  if (user.rol !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

// Para ADMIN devuelve undefined (sin filtro); para PROFESOR devuelve su grado.
export function scopeGrado(user) {
  return user.rol === "ADMIN" ? undefined : user.grado;
}
