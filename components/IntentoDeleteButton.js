"use client";

import { useRouter } from "next/navigation";

export default function IntentoDeleteButton({ id }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm("¿Eliminar esta evaluación?")) return;
        const res = await fetch(`/api/intentos/${id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("No se pudo eliminar.");
    }

    return <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar</button>;
}
