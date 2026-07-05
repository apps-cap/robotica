"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_ASISTENCIA } from "@/lib/constants";

export default function AsistenciaForm({ alumnos, fecha, registrosExistentes }) {
    const router = useRouter();
    const [registros, setRegistros] = useState(
        Object.fromEntries(alumnos.map((a) => [a.id, registrosExistentes[a.id] || "PRESENTE"]))
    );
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    async function guardar() {
        setLoading(true);
        setMensaje("");
        const res = await fetch("/api/asistencia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fecha,
                registros: alumnos.map((a) => ({ alumnoId: a.id, estado: registros[a.id] })),
            }),
        });
        setLoading(false);
        if (res.ok) {
            setMensaje("Asistencia guardada.");
            router.refresh();
        } else {
            setMensaje("Ocurrió un error al guardar.");
        }
    }

    function marcarTodos(estado) {
        setRegistros(Object.fromEntries(alumnos.map((a) => [a.id, estado])));
    }

    if (alumnos.length === 0) {
        return <p className="empty-state">No hay alumnos activos para pasar lista.</p>;
    }

    return (
        <div className="glass-card">
            {mensaje && <p style={{ color: "var(--success)", marginBottom: "1rem" }}>{mensaje}</p>}

            <div className="actions-cell" style={{ marginBottom: "1rem" }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => marcarTodos("PRESENTE")}>Marcar todos presentes</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Alumno</th><th>Asistencia</th></tr>
                    </thead>
                    <tbody>
                        {alumnos.map((a) => (
                            <tr key={a.id}>
                                <td>{a.nombre}</td>
                                <td>
                                    <div className="attendance-selector">
                                        {ESTADOS_ASISTENCIA.map((e) => (
                                            <button
                                                type="button"
                                                key={e.value}
                                                className={`attendance-btn attendance-btn-${e.value.toLowerCase()} ${registros[a.id] === e.value ? "active" : ""}`}
                                                onClick={() => setRegistros((r) => ({ ...r, [a.id]: e.value }))}
                                            >
                                                {e.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button type="button" className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={guardar} disabled={loading}>
                {loading ? "Guardando..." : "Guardar asistencia"}
            </button>
        </div>
    );
}
