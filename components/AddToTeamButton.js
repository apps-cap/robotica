"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToTeamButton({ alumnoId, equipos }) {
    const router = useRouter();
    const [equipoId, setEquipoId] = useState(equipos[0]?.id || "");
    const [loading, setLoading] = useState(false);

    async function agregar() {
        if (!equipoId) return;
        setLoading(true);
        const res = await fetch(`/api/equipos/${equipoId}/miembros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alumnoId }),
        });
        setLoading(false);
        if (res.ok) router.refresh();
        else alert("No se pudo agregar al equipo.");
    }

    if (equipos.length === 0) {
        return <span className="subtitle" style={{ fontSize: "0.8rem" }}>Crea un equipo primero</span>;
    }

    return (
        <div style={{ display: "flex", gap: "0.4rem" }}>
            <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} style={{ minWidth: "140px" }}>
                {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={agregar} disabled={loading}>
                {loading ? "..." : "Agregar"}
            </button>
        </div>
    );
}
