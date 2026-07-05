import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { GRADOS, labelGrado, PUNTAJE_MAX_TOTAL, CRITERIOS_RUBRICA } from "@/lib/constants";
import AddToTeamButton from "@/components/AddToTeamButton";

function construirRanking(alumnos) {
    return alumnos
        .map((a) => {
            const intentos = a.intentos;
            const promedioGeneral = intentos.length
                ? intentos.reduce((sum, i) => sum + i.puntajeTotal, 0) / intentos.length
                : null;

            const habilidadAcum = new Map();
            for (const intento of intentos) {
                for (const rh of intento.reto.habilidades) {
                    const key = rh.habilidad.id;
                    const actual = habilidadAcum.get(key) || { nombre: rh.habilidad.nombre, total: 0, n: 0 };
                    actual.total += intento.puntajeTotal / CRITERIOS_RUBRICA.length;
                    actual.n += 1;
                    habilidadAcum.set(key, actual);
                }
            }
            const topHabilidades = Array.from(habilidadAcum.values())
                .map((h) => ({ nombre: h.nombre, promedio: h.total / h.n }))
                .sort((a, b) => b.promedio - a.promedio)
                .slice(0, 3);

            const asistencias = a.asistencias;
            const asistenciaPct = asistencias.length
                ? Math.round((asistencias.filter((x) => x.estado !== "AUSENTE").length / asistencias.length) * 100)
                : null;

            return {
                alumno: a,
                promedioGeneral,
                numIntentos: intentos.length,
                topHabilidades,
                asistenciaPct,
            };
        })
        .sort((a, b) => (b.promedioGeneral ?? -1) - (a.promedioGeneral ?? -1));
}

export default async function SeleccionPage({ searchParams }) {
    const user = await requireUsuario();
    const grado = user.isAdmin ? (searchParams.grado || GRADOS[0].value) : user.grado;

    const [alumnos, equipos] = await Promise.all([
        prisma.alumno.findMany({
            where: { grado, estado: "ACTIVO" },
            include: {
                intentos: { include: { reto: { include: { habilidades: { include: { habilidad: true } } } } } },
                asistencias: true,
            },
        }),
        prisma.equipo.findMany({ where: { grado }, include: { coach: true }, orderBy: { createdAt: "desc" } }),
    ]);

    const ranking = construirRanking(alumnos);

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>Panel de selección</h1>
                    <p className="subtitle">
                        Ranking de desempeño para apoyar la selección de equipos representativos (criterios: puntaje acumulado, asistencia/consistencia, disponibilidad y aval familiar).
                    </p>
                </div>
                <div className="actions-cell">
                    <Link href={`/asistencia?grado=${grado}`} className="btn btn-outline">Pasar lista</Link>
                    <Link href="/equipos/nuevo" className="btn btn-primary">+ Nuevo equipo</Link>
                </div>
            </div>

            {user.isAdmin && (
                <form className="filters" method="get">
                    <select name="grado" defaultValue={grado}>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    <button type="submit" className="btn btn-outline btn-sm">Ver</button>
                </form>
            )}

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Equipos de {labelGrado(grado)}</h2>
                {equipos.length === 0 ? (
                    <p className="empty-state">Sin equipos creados para este grado todavía.</p>
                ) : (
                    <div className="grid grid-3">
                        {equipos.map((e) => (
                            <div key={e.id} className="stat-card">
                                <div className="label">{e.evento.replace("_", " ")} · {e.categoria}</div>
                                <div style={{ fontWeight: 700 }}>{e.nombre}</div>
                                <span className={`badge ${e.estado === "SELECCIONADO" ? "badge-completed" : "badge-pending"}`}>
                                    {e.estado}
                                </span>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                                    Coach: {e.coach ? e.coach.nombre : "sin asignar"}
                                </div>
                                <div style={{ marginTop: "0.75rem" }}>
                                    <Link className="btn btn-outline btn-sm" href={`/equipos/${e.id}`}>Ver roster</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="table-container glass-card">
                {ranking.length === 0 ? (
                    <p className="empty-state">No hay alumnos activos en este grado.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Alumno</th>
                                <th>Promedio</th>
                                <th>Evaluaciones</th>
                                <th>Asistencia (real)</th>
                                <th>Nota manual</th>
                                <th>Disponible</th>
                                <th>Aval familia</th>
                                <th>Habilidades destacadas</th>
                                <th>Agregar a equipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((r, idx) => (
                                <tr key={r.alumno.id}>
                                    <td>{idx + 1}</td>
                                    <td><Link href={`/alumnos/${r.alumno.id}/dashboard`}>{r.alumno.nombre}</Link></td>
                                    <td>{r.promedioGeneral !== null ? `${r.promedioGeneral.toFixed(1)} / ${PUNTAJE_MAX_TOTAL}` : "—"}</td>
                                    <td>{r.numIntentos}</td>
                                    <td>{r.asistenciaPct !== null ? `${r.asistenciaPct}%` : "—"}</td>
                                    <td>{r.alumno.asistenciaNota ?? "—"}</td>
                                    <td>{r.alumno.disponibleExtracurricular ? "✓" : "—"}</td>
                                    <td>{r.alumno.avalFamilia ? "✓" : "—"}</td>
                                    <td>
                                        {r.topHabilidades.length === 0
                                            ? "—"
                                            : r.topHabilidades.map((h) => (
                                                <span key={h.nombre} className="chip">{h.nombre} ({h.promedio.toFixed(1)})</span>
                                            ))}
                                    </td>
                                    <td><AddToTeamButton alumnoId={r.alumno.id} equipos={equipos} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
