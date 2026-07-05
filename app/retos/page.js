import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { GRADOS, PERIODOS, labelGrado, labelPeriodo } from "@/lib/constants";
import RetoRowActions from "@/components/RetoRowActions";

export default async function RetosPage({ searchParams }) {
    const user = await requireUsuario();
    const gradoFiltro = user.isAdmin ? (searchParams.grado || undefined) : user.grado;
    const periodoFiltro = searchParams.periodo || undefined;

    const retos = await prisma.reto.findMany({
        where: {
            ...(gradoFiltro ? { grado: gradoFiltro } : {}),
            ...(periodoFiltro ? { periodo: periodoFiltro } : {}),
        },
        include: { habilidades: { include: { habilidad: true } }, _count: { select: { intentos: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>Retos</h1>
                    <p className="subtitle">Retos y rúbricas del taller, con enlace a su documento de referencia.</p>
                </div>
                <Link href="/retos/nuevo" className="btn btn-primary">+ Nuevo reto</Link>
            </div>

            <form className="filters" method="get">
                {user.isAdmin && (
                    <select name="grado" defaultValue={gradoFiltro || ""}>
                        <option value="">Todos los grados</option>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                )}
                <select name="periodo" defaultValue={periodoFiltro || ""}>
                    <option value="">Todos los periodos</option>
                    {PERIODOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button type="submit" className="btn btn-outline btn-sm">Filtrar</button>
            </form>

            {retos.length === 0 ? (
                <div className="glass-card empty-state">No hay retos registrados todavía.</div>
            ) : (
                <div className="grid grid-2">
                    {retos.map((r) => (
                        <div key={r.id} className="glass-card">
                            <h2 style={{ fontSize: "1.15rem" }}>{r.titulo}</h2>
                            <p className="subtitle" style={{ marginTop: 0 }}>
                                {labelGrado(r.grado)} · {labelPeriodo(r.periodo)} · {r.tipo === "EQUIPO" ? "Equipo" : "Individual"}
                                {r.tiempoLimiteSeg ? ` · ${r.tiempoLimiteSeg}s límite` : ""}
                            </p>
                            {r.descripcion && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{r.descripcion}</p>}
                            <div style={{ margin: "0.75rem 0" }}>
                                {r.habilidades.map((rh) => (
                                    <span key={rh.habilidadId} className="chip">{rh.habilidad.nombre}</span>
                                ))}
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r._count.intentos} evaluación(es) registrada(s)</p>
                            <div className="actions-cell" style={{ marginTop: "1rem" }}>
                                <Link className="btn btn-outline btn-sm" href={`/retos/${r.id}`}>Ver / evaluar</Link>
                                {r.documentoUrl && (
                                    <a className="btn btn-outline btn-sm" href={r.documentoUrl} target="_blank" rel="noreferrer">Documento</a>
                                )}
                                <RetoRowActions reto={r} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
