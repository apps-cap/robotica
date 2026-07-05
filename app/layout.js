import '@/public/styles/globals.css'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Nav from "@/components/Nav";

export const metadata = {
    title: 'Taller de Robótica',
    description: 'Plataforma del Taller de Robótica Educativa — Ciclo 2026-2027',
}

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="es">
            <body>
                <Nav user={session?.user} />
                <main>{children}</main>
            </body>
        </html>
    )
}
