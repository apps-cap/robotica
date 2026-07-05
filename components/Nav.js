import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function Nav({ user }) {
    if (!user) return null;

    const links = [
        { href: "/dashboard", label: "Panel" },
        { href: "/alumnos", label: "Alumnos" },
        { href: "/asistencia", label: "Asistencia" },
        { href: "/retos", label: "Retos" },
        { href: "/habilidades", label: "Habilidades" },
        { href: "/estadisticas", label: "Estadísticas" },
        { href: "/seleccion", label: "Selección" },
        { href: "/equipos", label: "Equipos" },
    ];

    if (user.isAdmin) {
        links.push({ href: "/usuarios", label: "Usuarios" });
    }

    return (
        <header className="navbar">
            <span className="brand">🤖 Taller de Robótica</span>
            <nav>
                {links.map((l) => (
                    <Link key={l.href} href={l.href}>{l.label}</Link>
                ))}
            </nav>
            <div className="user-info">
                <span>{user.name} · {user.isAdmin ? "Admin" : user.grado}</span>
                <LogoutButton />
            </div>
        </header>
    );
}
