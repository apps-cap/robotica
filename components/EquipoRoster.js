"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EquipoRoster({ equipo, miembros, disponibles }) {
    const router = useRouter();
    const [alumnoId, setAlumnoId] = useState(disponibles[0]?.id || "");
    const [rol, setRol] = useState("");
    const [loading, setLoading] = useState(false);

    async function agregar(e) {
        e.preventDefault();
        if (!alumnoId) return;
        setLoading(true);
        const res = await fetch(`/api/equipos/${equipo.id}/miembros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alumnoId, rol }),
        });
        setLoading(false);
        if (res.ok) {
            setRol("");
            router.refresh();
        } else {
            alert("No se pudo agregar.");
        }
    }

    async function quitar(alumnoId) {
        if (!confirm("¿Quitar a este alumno del equipo?")) return;
        const res = await fetch(`/api/equipos/${equipo.id}/miembros/${alumnoId}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("No se pudo quitar.");
    }

    return (
        <div className="glass-card">
            <h2 style={{ fontSize: "1.1rem" }}>Integrantes</h2>

            {miembros.length === 0 ? (
                <p className="empty-state">Sin integrantes todavía.</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Alumno</th><th>Rol</th><th></th></tr>
                        </thead>
                        <tbody>
                            {miembros.map((m) => (
                                <tr key={m.alumnoId}>
                                    <td>{m.alumno.nombre}</td>
                                    <td>{m.rol || "—"}</td>
                                    <td><button className="btn btn-danger btn-sm" onClick={() => quitar(m.alumnoId)}>Quitar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {disponibles.length > 0 && (
                <form onSubmit={agregar} style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Agregar alumno</label>
                        <select value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
                            {disponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Rol (opcional)</label>
                        <input value={rol} onChange={(e) => setRol(e.target.value)} placeholder="Piloto de programación / Constructor / Capitán" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                        {loading ? "..." : "Agregar"}
                    </button>
                </form>
            )}
        </div>
    );
}
