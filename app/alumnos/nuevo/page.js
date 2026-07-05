import { requireUsuario } from "@/lib/access";
import AlumnoForm from "@/components/AlumnoForm";

export default async function NuevoAlumnoPage() {
    const user = await requireUsuario();

    return (
        <div className="container" style={{ maxWidth: "760px" }}>
            <h1>Nuevo alumno</h1>
            <p className="subtitle">Registrar un alumno en el taller de robótica.</p>
            <AlumnoForm isAdmin={user.isAdmin} gradoFijo={user.grado} />
        </div>
    );
}
