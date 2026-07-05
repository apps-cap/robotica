import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import RetoForm from "@/components/RetoForm";

export default async function NuevoRetoPage() {
    const user = await requireUsuario();
    const habilidades = user.isAdmin
        ? await prisma.habilidad.findMany({ orderBy: { nombre: "asc" } })
        : await prisma.habilidad.findMany({ where: { grado: user.grado }, orderBy: { nombre: "asc" } });

    return (
        <div className="container" style={{ maxWidth: "820px" }}>
            <h1>Nuevo reto</h1>
            <p className="subtitle">Registra el reto y el enlace a su rúbrica/documento de referencia.</p>
            <RetoForm habilidades={habilidades} isAdmin={user.isAdmin} gradoFijo={user.grado} />
        </div>
    );
}
