import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { labelGrado, labelPeriodo, labelEvento, PUNTAJE_MAX_TOTAL, CRITERIOS_RUBRICA } from "@/lib/constants";
import StatBarChart from "@/components/StatBarChart";
import TrendChart from "@/components/TrendChart";

export default async function AlumnoDashboardPage({ params }) {
    const user = await requireUsuario();
    const alumno = await prisma.alumno.findUnique({
        where: { id: params.id },
        include: {
            intentos: {
                include: { reto: { include: { habilidades: { include: { habilidad: true } } } } },
                orderBy: { fecha: "desc" },
            },
            equipos: { include: { equipo: true } },
            asistencias: { orderBy: { fecha: "desc" } },
        },
    });
    if (!alumno) notFound();
    if (!user.isAdmin && alumno.grado !== user.grado) redirect("/alumnos");

    const promedioGeneral = alumno.intentos.length
        ? alumno.intentos.reduce((sum, i) => sum + i.puntajeTotal, 0) / alumno.intentos.length
        : null;

    const habilidadAcum = new Map();
    for (const intento of alumno.intentos) {
        for (const rh of intento.reto.habilidades) {
            const key = rh.habilidad.id;
            const actual = habilidadAcum.get(key) || { nombre: rh.habilidad.nombre, total: 0, n: 0 };
            actual.total += intento.puntajeTotal / CRITERIOS_RUBRICA.length;
            actual.n += 1;
            habilidadAcum.set(key, actual);
        }
    }
    const skillData = Array.from(habilidadAcum.values())
        .map((h) => ({ nombre: h.nombre, promedio: Number((h.total / h.n).toFixed(2)) }))
        .sort((a, b) => b.promedio - a.promedio);

    const equipoSeleccionado = alumno.equipos.find((e) => e.equipo.estado === "SELECCIONADO");

    const trendData = [...alumno.intentos]
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map((i) => ({ fecha: new Date(i.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }), puntaje: i.puntajeTotal }));

    const asistenciaPct = alumno.asistencias.length
        ? Math.round((alumno.asistencias.filter((a) => a.estado !== "AUSENTE").length / alumno.asistencias.length) * 100)
        : null;

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>{alumno.nombre}</h1>
                    <p className="subtitle">{labelGrado(alumno.grado)}{alumno.grupo ? ` · Grupo ${alumno.grupo}` : ""}</p>
                </div>
                <Link href={`/alumnos/${alumno.id}/editar`} className="btn btn-outline">Editar datos</Link>
            </div>

            {equipoSeleccionado && (
                <div className="glass-card" style={{ marginBottom: "1.5rem", borderColor: "var(--success)" }}>
                    <span className="badge badge-completed">Seleccionado</span>
                    <h2 style={{ fontSize: "1.1rem", marginTop: "0.75rem" }}>
                        {equipoSeleccionado.equipo.nombre} — {labelEvento(equipoSeleccionado.equipo.evento)} ({equipoSeleccionado.equipo.categoria})
                    </h2>
                    {equipoSeleccionado.equipo.justificacion && (
                        <p style={{ marginTop: "0.5rem" }}>{equipoSeleccionado.equipo.justificacion}</p>
                    )}
                    {equipoSeleccionado.rol && <p className="subtitle">Rol en el equipo: {equipoSeleccionado.rol}</p>}
                </div>
            )}

            <div className="grid grid-4" style={{ marginBottom: "1.5rem" }}>
                <div className="stat-card">
                    <div className="value">{promedioGeneral !== null ? promedioGeneral.toFixed(1) : "—"}</div>
                    <div className="label">Puntaje promedio (máx. {PUNTAJE_MAX_TOTAL})</div>
                </div>
                <div className="stat-card">
                    <div className="value">{alumno.intentos.length}</div>
                    <div className="label">Retos evaluados</div>
                </div>
                <div className="stat-card">
                    <div className="value">{asistenciaPct !== null ? `${asistenciaPct}%` : (alumno.asistenciaNota ?? "—")}</div>
                    <div className="label">Asistencia {asistenciaPct !== null ? `(${alumno.asistencias.length} sesiones)` : "/ consistencia"}</div>
                </div>
                <div className="stat-card">
                    <div className="value">{alumno.disponibleExtracurricular ? "Sí" : "No"}</div>
                    <div className="label">Disponible extracurricular</div>
                </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: "1.5rem" }}>
                <div className="glass-card">
                    <h2 style={{ fontSize: "1.1rem" }}>Habilidades desarrolladas</h2>
                    <p className="subtitle" style={{ marginTop: 0 }}>Promedio de puntaje (0-4) en los retos que evalúan cada habilidad.</p>
                    <StatBarChart data={skillData} domain={[0, 4]} emptyMessage="Aún no hay evaluaciones para graficar habilidades." />
                </div>
                <div className="glass-card">
                    <h2 style={{ fontSize: "1.1rem" }}>Tendencia de puntaje</h2>
                    <p className="subtitle" style={{ marginTop: 0 }}>Evolución del puntaje (máx. {PUNTAJE_MAX_TOTAL}) reto por reto.</p>
                    <TrendChart data={trendData} domain={[0, PUNTAJE_MAX_TOTAL]} />
                </div>
            </div>

            <div className="table-container glass-card">
                <h2 style={{ fontSize: "1.1rem" }}>Línea de tiempo de retos</h2>
                {alumno.intentos.length === 0 ? (
                    <p className="empty-state">Sin evaluaciones registradas todavía.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Reto</th>
                                <th>Periodo</th>
                                <th>Puntaje</th>
                                <th>Tiempo</th>
                                <th>Fecha</th>
                                <th>Evidencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumno.intentos.map((i) => (
                                <tr key={i.id}>
                                    <td><Link href={`/retos/${i.reto.id}`}>{i.reto.titulo}</Link></td>
                                    <td>{labelPeriodo(i.reto.periodo)}</td>
                                    <td>{i.puntajeTotal} / {PUNTAJE_MAX_TOTAL}</td>
                                    <td>{i.tiempoSegundos ? `${i.tiempoSegundos}s` : "—"}</td>
                                    <td>{new Date(i.fecha).toLocaleDateString("es-MX")}</td>
                                    <td>{i.evidenciaUrl ? <a href={i.evidenciaUrl} target="_blank" rel="noreferrer">Ver</a> : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
