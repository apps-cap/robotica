import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { GRADOS, labelGrado } from "@/lib/constants";
import AsistenciaForm from "@/components/AsistenciaForm";

function hoyISO() {
    const d = new Date();
    const tz = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tz * 60000);
    return local.toISOString().slice(0, 10);
}

export default async function AsistenciaPage({ searchParams }) {
    const user = await requireUsuario();
    const grado = user.isAdmin ? (searchParams.grado || GRADOS[0].value) : user.grado;
    const fecha = searchParams.fecha || hoyISO();
    const grupoFiltro = searchParams.grupo || undefined;

    const [alumnos, gruposDisponibles] = await Promise.all([
        prisma.alumno.findMany({
            where: { grado, estado: "ACTIVO", ...(grupoFiltro ? { grupo: grupoFiltro } : {}) },
            orderBy: { nombre: "asc" },
        }),
        prisma.alumno.findMany({
            where: { grado, estado: "ACTIVO", grupo: { not: null } },
            select: { grupo: true },
            distinct: ["grupo"],
        }),
    ]);

    const fechaNormalizada = new Date(`${fecha}T00:00:00`);
    const registrosExistentesRaw = await prisma.asistencia.findMany({
        where: { fecha: fechaNormalizada, alumnoId: { in: alumnos.map((a) => a.id) } },
    });
    const registrosExistentes = Object.fromEntries(registrosExistentesRaw.map((r) => [r.alumnoId, r.estado]));

    return (
        <div className="container">
            <h1>Pasar lista de asistencia</h1>
            <p className="subtitle">Registra la asistencia de la sesión del taller para {labelGrado(grado)}.</p>

            <form className="filters" method="get">
                {user.isAdmin && (
                    <select name="grado" defaultValue={grado}>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                )}
                {gruposDisponibles.length > 0 && (
                    <select name="grupo" defaultValue={grupoFiltro || ""}>
                        <option value="">Todos los grupos</option>
                        {gruposDisponibles.map((g) => <option key={g.grupo} value={g.grupo}>{g.grupo}</option>)}
                    </select>
                )}
                <input type="date" name="fecha" defaultValue={fecha} />
                <button type="submit" className="btn btn-outline btn-sm">Ver</button>
            </form>

            <AsistenciaForm alumnos={alumnos} fecha={fecha} registrosExistentes={registrosExistentes} />
        </div>
    );
}
