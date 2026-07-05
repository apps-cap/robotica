import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { labelGrado, labelPeriodo, PUNTAJE_MAX_TOTAL } from "@/lib/constants";
import IntentoDeleteButton from "@/components/IntentoDeleteButton";

export default async function RetoDetallePage({ params }) {
    const user = await requireUsuario();
    const reto = await prisma.reto.findUnique({
        where: { id: params.id },
        include: {
            habilidades: { include: { habilidad: true } },
            intentos: { include: { alumno: true }, orderBy: { fecha: "desc" } },
        },
    });

    if (!reto) notFound();
    if (!user.isAdmin && reto.grado !== user.grado) redirect("/retos");

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>{reto.titulo}</h1>
                    <p className="subtitle">
                        {labelGrado(reto.grado)} · {labelPeriodo(reto.periodo)} · {reto.tipo === "EQUIPO" ? "Equipo" : "Individual"}
                        {reto.tiempoLimiteSeg ? ` · límite ${reto.tiempoLimiteSeg}s` : ""}
                    </p>
                </div>
                <Link href={`/retos/${reto.id}/evaluar`} className="btn btn-primary">+ Registrar evaluación</Link>
            </div>

            {reto.descripcion && <p style={{ marginBottom: "1rem" }}>{reto.descripcion}</p>}

            <div style={{ marginBottom: "1.5rem" }}>
                {reto.habilidades.map((rh) => (
                    <span key={rh.habilidadId} className="chip">{rh.habilidad.nombre}</span>
                ))}
                {reto.documentoUrl && (
                    <a href={reto.documentoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginLeft: "0.75rem" }}>
                        Ver documento / rúbrica
                    </a>
                )}
            </div>

            <div className="table-container glass-card">
                <h2 style={{ fontSize: "1.1rem" }}>Evaluaciones registradas</h2>
                {reto.intentos.length === 0 ? (
                    <p className="empty-state">Todavía no hay evaluaciones para este reto.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Puntaje</th>
                                <th>Tiempo</th>
                                <th>Fecha</th>
                                <th>Evaluador</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reto.intentos.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.alumno.nombre}</td>
                                    <td>{i.puntajeTotal} / {PUNTAJE_MAX_TOTAL}</td>
                                    <td>{i.tiempoSegundos ? `${i.tiempoSegundos}s` : "—"}</td>
                                    <td>{new Date(i.fecha).toLocaleDateString("es-MX")}</td>
                                    <td>{i.evaluadoPorEmail}</td>
                                    <td className="actions-cell">
                                        <Link className="btn btn-outline btn-sm" href={`/alumnos/${i.alumno.id}/dashboard`}>Ver alumno</Link>
                                        <IntentoDeleteButton id={i.id} />
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
