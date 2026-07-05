"use client";

import { useRouter } from "next/navigation";

export default function AlumnoRowActions({ alumno, isAdmin }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm(`¿Eliminar definitivamente a ${alumno.nombre}? Esta acción no se puede deshacer.`)) return;
        const res = await fetch(`/api/alumnos/${alumno.id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("No se pudo eliminar.");
    }

    if (!isAdmin) return null;

    return (
        <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar</button>
    );
}
