import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireUsuario, scopeGrado } from "@/lib/access";
import { labelGrado, labelEvento } from "@/lib/constants";

export default async function EquiposPage() {
    const user = await requireUsuario();
    const grado = scopeGrado(user);

    const equipos = await prisma.equipo.findMany({
        where: grado ? { grado } : {},
        include: { _count: { select: { miembros: true } }, coach: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container">
            <div className="toolbar">
                <div>
                    <h1>Equipos</h1>
                    <p className="subtitle">Equipos representativos por evento y grado.</p>
                </div>
                <Link href="/equipos/nuevo" className="btn btn-primary">+ Nuevo equipo</Link>
            </div>

            {equipos.length === 0 ? (
                <div className="glass-card empty-state">Sin equipos registrados todavía. Ve al <Link href="/seleccion">panel de selección</Link> para elegir candidatos.</div>
            ) : (
                <div className="grid grid-3">
                    {equipos.map((e) => (
                        <div key={e.id} className="glass-card">
                            <h2 style={{ fontSize: "1.1rem" }}>{e.nombre}</h2>
                            <p className="subtitle" style={{ marginTop: 0 }}>{labelEvento(e.evento)} · {e.categoria} · {labelGrado(e.grado)}</p>
                            <span className={`badge ${e.estado === "SELECCIONADO" ? "badge-completed" : e.estado === "NO_SELECCIONADO" ? "badge-danger" : "badge-pending"}`}>
                                {e.estado}
                            </span>
                            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{e._count.miembros} integrante(s)</p>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Coach: {e.coach ? e.coach.nombre : "sin asignar"}</p>
                            <Link className="btn btn-outline btn-sm" href={`/equipos/${e.id}`} style={{ marginTop: "0.75rem" }}>Ver roster</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
