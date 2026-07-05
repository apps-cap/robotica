import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

const providers = [
    GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
    }),
];

// Proveedor de solo-desarrollo: permite iniciar sesión eligiendo un email
// ya registrado en la tabla Usuario, sin necesidad de credenciales reales
// de Google OAuth. Nunca se activa en producción.
if (process.env.NODE_ENV !== "production") {
    providers.push(
        CredentialsProvider({
            id: "dev-login",
            name: "Acceso de desarrollo",
            credentials: {
                email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;
                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email },
                });
                if (!usuario) return null;
                return {
                    id: usuario.id,
                    email: usuario.email,
                    name: usuario.nombre,
                };
            },
        })
    );
}

export const authOptions = {
    providers,
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.sub;
                const usuario = await prisma.usuario.findUnique({
                    where: { email: session.user.email },
                });
                if (usuario) {
                    session.user.rol = usuario.rol;
                    session.user.grado = usuario.grado;
                    session.user.isAdmin = usuario.rol === "ADMIN";
                } else {
                    session.user.rol = null;
                    session.user.grado = null;
                    session.user.isAdmin = false;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
