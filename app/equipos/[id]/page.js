import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { labelGrado, labelEvento, PUNTAJE_MAX_TOTAL } from "@/lib/constants";
import EquipoEstadoForm from "@/components/EquipoEstadoForm";
import EquipoRoster from "@/components/EquipoRoster";
import EquipoDeleteButton from "@/components/EquipoDeleteButton";
import StatBarChart from "@/components/StatBarChart";

export default async function EquipoDetallePage({ params }) {
    const user = await requireUsuario();
    const equipo = await prisma.equipo.findUnique({
        where: { id: params.id },
        include: {
            miembros: { include: { alumno: { include: { intentos: true } } } },
            coach: true,
        },
    });
    if (!equipo) notFound();
    if (!user.isAdmin && equipo.grado !== user.grado) redirect("/equipos");

    const [todosAlumnos, usuarios] = await Promise.all([
        prisma.alumno.findMany({
            where: { grado: equipo.grado, estado: "ACTIVO" },
            orderBy: { nombre: "asc" },
        }),
        prisma.usuario.findMany({ orderBy: [{ rol: "asc" }, { nombre: "asc" }] }),
    ]);
    const idsEnEquipo = new Set(equipo.miembros.map((m) => m.alumnoId));
    const disponibles = todosAlumnos.filter((a) => !idsEnEquipo.has(a.id));

    const comparativaData = equipo.miembros
        .filter((m) => m.alumno.intentos.length > 0)
        .map((m) => ({
            nombre: m.alumno.nombre,
            promedio: Number((m.alumno.intentos.reduce((s, i) => s + i.puntajeTotal, 0) / m.alumno.intentos.length).toFixed(1)),
        }))
        .sort((a, b) => b.promedio - a.promedio);

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>{equipo.nombre}</h1>
                    <p className="subtitle">
                        {labelEvento(equipo.evento)} · {equipo.categoria} · {labelGrado(equipo.grado)} · Ciclo {equipo.cicloEscolar}
                        {equipo.coach ? ` · Coach: ${equipo.coach.nombre}` : " · Sin coach asignado"}
                    </p>
                </div>
                <EquipoDeleteButton id={equipo.id} nombre={equipo.nombre} />
            </div>

            <EquipoEstadoForm equipo={equipo} usuarios={usuarios} />

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Comparativa de integrantes</h2>
                <p className="subtitle" style={{ marginTop: 0 }}>Puntaje promedio (máx. {PUNTAJE_MAX_TOTAL}) de cada integrante, para apoyar decisiones de roster.</p>
                <StatBarChart data={comparativaData} domain={[0, PUNTAJE_MAX_TOTAL]} barColor="#34d399" emptyMessage="Los integrantes de este equipo aún no tienen evaluaciones registradas." />
            </div>

            <EquipoRoster equipo={equipo} miembros={equipo.miembros} disponibles={disponibles} />
        </div>
    );
}
