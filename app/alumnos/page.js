import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario, scopeGrado } from "@/lib/access";
import { GRADOS, labelGrado } from "@/lib/constants";
import AlumnoRowActions from "@/components/AlumnoRowActions";

export default async function AlumnosPage({ searchParams }) {
    const user = await requireUsuario();
    const gradoFiltro = user.isAdmin ? (searchParams.grado || undefined) : user.grado;
    const estadoFiltro = searchParams.estado || undefined;
    const q = searchParams.q || undefined;

    const alumnos = await prisma.alumno.findMany({
        where: {
            ...(gradoFiltro ? { grado: gradoFiltro } : {}),
            ...(estadoFiltro ? { estado: estadoFiltro } : {}),
            ...(q ? { nombre: { contains: q } } : {}),
        },
        orderBy: { nombre: "asc" },
    });

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>Alumnos</h1>
                    <p className="subtitle">Alta, baja y edición de alumnos del taller.</p>
                </div>
                <Link href="/alumnos/nuevo" className="btn btn-primary">+ Nuevo alumno</Link>
            </div>

            <form className="filters" method="get">
                {user.isAdmin && (
                    <select name="grado" defaultValue={gradoFiltro || ""}>
                        <option value="">Todos los grados</option>
                        {GRADOS.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                    </select>
                )}
                <select name="estado" defaultValue={estadoFiltro || ""}>
                    <option value="">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="BAJA">Baja</option>
                </select>
                <input type="text" name="q" placeholder="Buscar por nombre..." defaultValue={q || ""} />
                <button type="submit" className="btn btn-outline btn-sm">Filtrar</button>
            </form>

            <div className="table-container glass-card">
                {alumnos.length === 0 ? (
                    <p className="empty-state">No hay alumnos que coincidan con los filtros.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Grado</th>
                                <th>Grupo</th>
                                <th>Estado</th>
                                <th>Tutor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnos.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.nombre}</td>
                                    <td>{labelGrado(a.grado)}</td>
                                    <td>{a.grupo || "—"}</td>
                                    <td>
                                        <span className={`badge ${a.estado === "ACTIVO" ? "badge-completed" : "badge-neutral"}`}>
                                            {a.estado === "ACTIVO" ? "Activo" : "Baja"}
                                        </span>
                                    </td>
                                    <td>{a.tutorNombre || "—"}</td>
                                    <td className="actions-cell">
                                        <Link className="btn btn-outline btn-sm" href={`/alumnos/${a.id}/dashboard`}>Dashboard</Link>
                                        <Link className="btn btn-outline btn-sm" href={`/alumnos/${a.id}/editar`}>Editar</Link>
                                        <AlumnoRowActions alumno={a} isAdmin={user.isAdmin} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
