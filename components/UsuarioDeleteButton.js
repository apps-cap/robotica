"use client";

import { useRouter } from "next/navigation";

export default function UsuarioDeleteButton({ id, nombre }) {
    const router = useRouter();

    async function eliminar() {
        if (!confirm(`¿Eliminar el acceso de ${nombre}?`)) return;
        const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else {
            const body = await res.json().catch(() => ({}));
            alert(body.error || "No se pudo eliminar.");
        }
    }

    return <button className="btn btn-danger btn-sm" onClick={eliminar}>Eliminar</button>;
}
