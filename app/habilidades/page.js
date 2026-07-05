import prisma from "@/lib/prisma";
import { requireUsuario, scopeGrado } from "@/lib/access";
import { GRADOS, labelGrado } from "@/lib/constants";
import HabilidadForm from "@/components/HabilidadForm";
import HabilidadDeleteButton from "@/components/HabilidadDeleteButton";

export default async function HabilidadesPage() {
    const user = await requireUsuario();
    const grado = scopeGrado(user);

    const habilidades = await prisma.habilidad.findMany({
        where: grado ? { grado } : {},
        orderBy: [{ grado: "asc" }, { categoria: "asc" }],
    });

    const grados = user.isAdmin ? GRADOS.map((g) => g.value) : [user.grado];

    return (
        <div className="container">
            <h1>Catálogo de habilidades</h1>
            <p className="subtitle">Competencias que se evalúan en cada reto, según el plan de trabajo por grado.</p>

            {user.isAdmin && <HabilidadForm />}

            {grados.map((g) => (
                <div key={g} className="glass-card" style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.2rem" }}>{labelGrado(g)}</h2>
                    {habilidades.filter((h) => h.grado === g).length === 0 ? (
                        <p className="empty-state">Sin habilidades registradas para este grado.</p>
                    ) : (
                        habilidades.filter((h) => h.grado === g).map((h) => (
                            <div key={h.id} className="rubric-item">
                                <div>
                                    <p>{h.nombre}</p>
                                    <span className="chip">{h.categoria}</span>
                                    {h.descripcion && <p className="subtitle" style={{ margin: "0.3rem 0 0" }}>{h.descripcion}</p>}
                                </div>
                                {user.isAdmin && <HabilidadDeleteButton id={h.id} nombre={h.nombre} />}
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
}
