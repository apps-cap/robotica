"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_EQUIPO } from "@/lib/constants";

export default function EquipoEstadoForm({ equipo, usuarios }) {
    const router = useRouter();
    const [estado, setEstado] = useState(equipo.estado);
    const [justificacion, setJustificacion] = useState(equipo.justificacion || "");
    const [coachId, setCoachId] = useState(equipo.coachId || "");
    const [loading, setLoading] = useState(false);

    async function guardar(e) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch(`/api/equipos/${equipo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado, justificacion, coachId }),
        });
        setLoading(false);
        if (res.ok) router.refresh();
        else alert("No se pudo guardar.");
    }

    return (
        <form onSubmit={guardar} className="glass-card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Estado, coach y justificación</h2>
            <p className="subtitle" style={{ marginTop: 0 }}>Esta justificación es la que se muestra en el dashboard de cada alumno para explicar a los padres por qué fue seleccionado.</p>

            <div className="grid grid-2">
                <div className="form-group">
                    <label>Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        {ESTADOS_EQUIPO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Coach responsable</label>
                    <select value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                        <option value="">Sin asignar</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nombre} ({u.rol === "ADMIN" ? "Admin" : u.grado})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Justificación de la selección</label>
                <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} placeholder="Ej. Equipo seleccionado por su desempeño consistente en retos de sensores y trabajo colaborativo durante P1 y P2..." />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
            </button>
        </form>
    );
}
