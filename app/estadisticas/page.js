import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { GRADOS, labelGrado, PUNTAJE_MAX_TOTAL, CRITERIOS_RUBRICA } from "@/lib/constants";
import StatBarChart from "@/components/StatBarChart";

function calcularPromedio(intentos) {
    return intentos.length ? intentos.reduce((sum, i) => sum + i.puntajeTotal, 0) / intentos.length : null;
}

function calcularAsistenciaPct(asistencias) {
    return asistencias.length
        ? Math.round((asistencias.filter((a) => a.estado !== "AUSENTE").length / asistencias.length) * 100)
        : null;
}

export default async function EstadisticasPage({ searchParams }) {
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
        prisma.equipo.findMany({ where: { grado }, include: { miembros: true } }),
    ]);

    const promedioPorAlumno = new Map();
    for (const a of alumnos) {
        promedioPorAlumno.set(a.id, calcularPromedio(a.intentos));
    }

    const rankingData = alumnos
        .filter((a) => a.intentos.length > 0)
        .map((a) => ({ nombre: a.nombre, promedio: Number(promedioPorAlumno.get(a.id).toFixed(1)) }))
        .sort((a, b) => b.promedio - a.promedio);

    const habilidadAcumGrupo = new Map();
    for (const a of alumnos) {
        for (const intento of a.intentos) {
            for (const rh of intento.reto.habilidades) {
                const key = rh.habilidad.id;
                const actual = habilidadAcumGrupo.get(key) || { nombre: rh.habilidad.nombre, total: 0, n: 0 };
                actual.total += intento.puntajeTotal / CRITERIOS_RUBRICA.length;
                actual.n += 1;
                habilidadAcumGrupo.set(key, actual);
            }
        }
    }
    const groupSkillData = Array.from(habilidadAcumGrupo.values())
        .map((h) => ({ nombre: h.nombre, promedio: Number((h.total / h.n).toFixed(2)) }))
        .sort((a, b) => b.promedio - a.promedio);

    const attendanceData = alumnos
        .filter((a) => a.asistencias.length > 0)
        .map((a) => ({ nombre: a.nombre, promedio: calcularAsistenciaPct(a.asistencias) }))
        .sort((a, b) => b.promedio - a.promedio);

    const equipoChartData = equipos
        .map((e) => {
            const promedios = e.miembros
                .map((m) => promedioPorAlumno.get(m.alumnoId))
                .filter((p) => p !== null && p !== undefined);
            if (promedios.length === 0) return null;
            return {
                nombre: e.nombre,
                promedio: Number((promedios.reduce((s, p) => s + p, 0) / promedios.length).toFixed(1)),
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.promedio - a.promedio);

    const topAlumno = rankingData[0];
    const topHabilidad = groupSkillData[0];
    const topEquipo = equipoChartData[0];

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>Estadísticas</h1>
                    <p className="subtitle">Panel visual para apoyar decisiones por alumno y por equipo en {labelGrado(grado)}.</p>
                </div>
                <Link href={`/seleccion?grado=${grado}`} className="btn btn-outline">Ir a panel de selección</Link>
            </div>

            {user.isAdmin && (
                <form className="filters" method="get">
                    <select name="grado" defaultValue={grado}>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    <button type="submit" className="btn btn-outline btn-sm">Ver</button>
                </form>
            )}

            <div className="grid grid-3" style={{ marginBottom: "1.5rem" }}>
                <div className="stat-card">
                    <div className="value">{topAlumno ? topAlumno.promedio : "—"}</div>
                    <div className="label">Mejor puntaje individual{topAlumno ? ` — ${topAlumno.nombre}` : ""}</div>
                </div>
                <div className="stat-card">
                    <div className="value">{topHabilidad ? topHabilidad.promedio : "—"}</div>
                    <div className="label">Fortaleza grupal{topHabilidad ? ` — ${topHabilidad.nombre}` : ""}</div>
                </div>
                <div className="stat-card">
                    <div className="value">{topEquipo ? topEquipo.promedio : "—"}</div>
                    <div className="label">Mejor equipo{topEquipo ? ` — ${topEquipo.nombre}` : ""}</div>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Ranking de alumnos por puntaje</h2>
                <p className="subtitle" style={{ marginTop: 0 }}>Promedio de puntaje total (máx. {PUNTAJE_MAX_TOTAL}) por alumno.</p>
                <StatBarChart data={rankingData} domain={[0, PUNTAJE_MAX_TOTAL]} emptyMessage="Aún no hay evaluaciones registradas en este grado." />
            </div>

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Fortalezas del grupo por habilidad</h2>
                <p className="subtitle" style={{ marginTop: 0 }}>Promedio grupal (0-4) por cada habilidad evaluada.</p>
                <StatBarChart data={groupSkillData} domain={[0, 4]} barColor="#c084fc" emptyMessage="Aún no hay evaluaciones registradas en este grado." />
            </div>

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Comparativa de equipos</h2>
                <p className="subtitle" style={{ marginTop: 0 }}>Promedio del puntaje de los integrantes de cada equipo (máx. {PUNTAJE_MAX_TOTAL}).</p>
                <StatBarChart data={equipoChartData} domain={[0, PUNTAJE_MAX_TOTAL]} barColor="#34d399" emptyMessage="Crea equipos y agrégales integrantes para poder compararlos." />
            </div>

            <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem" }}>Asistencia por alumno</h2>
                <p className="subtitle" style={{ marginTop: 0 }}>Porcentaje de sesiones con presencia (presente o retardo) registradas en /asistencia.</p>
                <StatBarChart data={attendanceData} domain={[0, 100]} barColor="#fbbf24" valueSuffix="%" emptyMessage="Aún no se ha pasado lista para este grado." />
            </div>
        </div>
    );
}
