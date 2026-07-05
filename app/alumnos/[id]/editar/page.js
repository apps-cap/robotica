import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import AlumnoForm from "@/components/AlumnoForm";

export default async function EditarAlumnoPage({ params }) {
    const user = await requireUsuario();
    const alumno = await prisma.alumno.findUnique({ where: { id: params.id } });
    if (!alumno) notFound();
    if (!user.isAdmin && alumno.grado !== user.grado) redirect("/alumnos");

    const alumnoPlano = JSON.parse(JSON.stringify(alumno));

    return (
        <div className="container" style={{ maxWidth: "760px" }}>
            <h1>Editar alumno</h1>
            <p className="subtitle">{alumno.nombre}</p>
            <AlumnoForm alumno={alumnoPlano} isAdmin={user.isAdmin} />
        </div>
    );
}
