"use client";

import { useRouter } from "next/navigation";

export default function RetoRowActions({ reto }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm(`¿Eliminar el reto "${reto.titulo}"? Se eliminarán también sus evaluaciones registradas.`)) return;
        const res = await fetch(`/api/retos/${reto.id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("No se pudo eliminar.");
    }

    return <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar</button>;
}
