import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LoginButton from "@/components/LoginButton";
import DevLoginForm from "@/components/DevLoginForm";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);
    if (session?.user) redirect("/dashboard");

    const usuarios = process.env.NODE_ENV !== "production"
        ? await prisma.usuario.findMany({ orderBy: { rol: "asc" } })
        : [];

    return (
        <div className="container" style={{ maxWidth: "420px", marginTop: "4rem" }}>
            <div className="glass-card">
                <h1 style={{ fontSize: "1.8rem" }}>Taller de Robótica</h1>
                <p className="subtitle">Ciclo escolar 2026-2027</p>
                <LoginButton />

                {usuarios.length > 0 && (
                    <>
                        <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid var(--glass-border)" }} />
                        <DevLoginForm usuarios={usuarios} />
                    </>
                )}
            </div>
        </div>
    );
}
