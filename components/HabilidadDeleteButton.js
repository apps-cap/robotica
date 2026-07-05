"use client";

import { useRouter } from "next/navigation";

export default function HabilidadDeleteButton({ id, nombre }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm(`¿Eliminar la habilidad "${nombre}" del catálogo?`)) return;
        const res = await fetch(`/api/habilidades/${id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("No se pudo eliminar (puede estar en uso por algún reto).");
    }

    return <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar</button>;
}
