import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireUsuario } from "@/lib/access";
import { labelGrado, labelPeriodo } from "@/lib/constants";
import IntentoForm from "@/components/IntentoForm";

export default async function EvaluarRetoPage({ params }) {
    const user = await requireUsuario();
    const reto = await prisma.reto.findUnique({ where: { id: params.id } });
    if (!reto) notFound();
    if (!user.isAdmin && reto.grado !== user.grado) redirect("/retos");

    const alumnos = await prisma.alumno.findMany({
        where: { grado: reto.grado, estado: "ACTIVO" },
        orderBy: { nombre: "asc" },
    });

    return (
        <div className="container" style={{ maxWidth: "820px" }}>
            <h1>Registrar evaluación</h1>
            <p className="subtitle">{reto.titulo} · {labelGrado(reto.grado)} · {labelPeriodo(reto.periodo)}</p>
            <IntentoForm reto={reto} alumnos={alumnos} />
        </div>
    );
}
