"use client";

import { useRouter } from "next/navigation";

export default function EquipoDeleteButton({ id, nombre }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm(`¿Eliminar el equipo "${nombre}"?`)) return;
        const res = await fetch(`/api/equipos/${id}`, { method: "DELETE" });
        if (res.ok) router.push("/equipos");
        else alert("No se pudo eliminar.");
    }

    return <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar equipo</button>;
}
