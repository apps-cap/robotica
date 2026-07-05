import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { GRADOS, labelGrado } from "@/lib/constants";

async function statsPorGrado(grado) {
    const [alumnosActivos, retos, intentos, equiposSeleccionados, promedio] = await Promise.all([
        prisma.alumno.count({ where: { grado, estado: "ACTIVO" } }),
        prisma.reto.count({ where: { grado } }),
        prisma.intento.count({ where: { alumno: { grado } } }),
        prisma.equipo.count({ where: { grado, estado: "SELECCIONADO" } }),
        prisma.intento.aggregate({
            where: { alumno: { grado } },
            _avg: { puntajeTotal: true },
        }),
    ]);

    return {
        grado,
        alumnosActivos,
        retos,
        intentos,
        equiposSeleccionados,
        promedio: promedio._avg.puntajeTotal ? promedio._avg.puntajeTotal.toFixed(1) : "—",
    };
}

export default async function DashboardPage() {
    const user = await requireUsuario();
    const grados = user.isAdmin ? GRADOS.map((g) => g.value) : [user.grado];

    const stats = await Promise.all(grados.map(statsPorGrado));

    return (
        <div className="container">
            <h1>Panel general</h1>
            <p className="subtitle">
                {user.isAdmin ? "Resumen de los tres grados del taller." : `Resumen del grado ${labelGrado(user.grado)}.`}
            </p>

            <div className="grid grid-2">
                {stats.map((s) => (
                    <div key={s.grado} className="glass-card">
                        <h2 style={{ fontSize: "1.3rem" }}>{labelGrado(s.grado)}</h2>
                        <div className="grid grid-4" style={{ marginTop: "1rem" }}>
                            <div className="stat-card">
                                <div className="value">{s.alumnosActivos}</div>
                                <div className="label">Alumnos activos</div>
                            </div>
                            <div className="stat-card">
                                <div className="value">{s.retos}</div>
                                <div className="label">Retos registrados</div>
                            </div>
                            <div className="stat-card">
                                <div className="value">{s.intentos}</div>
                                <div className="label">Evaluaciones capturadas</div>
                            </div>
                            <div className="stat-card">
                                <div className="value">{s.promedio}</div>
                                <div className="label">Puntaje promedio (máx. 20)</div>
                            </div>
                        </div>
                        <div className="actions-cell" style={{ marginTop: "1.5rem" }}>
                            <Link className="btn btn-outline btn-sm" href={`/alumnos?grado=${s.grado}`}>Ver alumnos</Link>
                            <Link className="btn btn-outline btn-sm" href={`/retos?grado=${s.grado}`}>Ver retos</Link>
                            <Link className="btn btn-outline btn-sm" href={`/seleccion?grado=${s.grado}`}>
                                Panel de selección ({s.equiposSeleccionados} equipo{s.equiposSeleccionados === 1 ? "" : "s"} seleccionado{s.equiposSeleccionados === 1 ? "" : "s"})
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
