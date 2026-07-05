import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import EquipoForm from "@/components/EquipoForm";

export default async function NuevoEquipoPage() {
    const user = await requireUsuario();
    const usuarios = await prisma.usuario.findMany({ orderBy: [{ rol: "asc" }, { nombre: "asc" }] });
    const coachSugerido = usuarios.find((u) => u.email === user.email);

    return (
        <div className="container" style={{ maxWidth: "760px" }}>
            <h1>Nuevo equipo</h1>
            <p className="subtitle">Crea un equipo representativo para un evento (WRO México, Infomatrix o Expociencias) y asígnale un coach responsable.</p>
            <EquipoForm isAdmin={user.isAdmin} gradoFijo={user.grado} usuarios={usuarios} coachSugeridoId={coachSugerido?.id} />
        </div>
    );
}
