"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRITERIOS_RUBRICA, PUNTAJE_MAX_CRITERIO } from "@/lib/constants";

export default function IntentoForm({ reto, alumnos }) {
    const router = useRouter();
    const [alumnoId, setAlumnoId] = useState(alumnos[0]?.id || "");
    const [scores, setScores] = useState(
        Object.fromEntries(CRITERIOS_RUBRICA.map((c) => [c.key, 0]))
    );
    const [tiempoSegundos, setTiempoSegundos] = useState("");
    const [evidenciaUrl, setEvidenciaUrl] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!alumnoId) {
            setError("Selecciona un alumno.");
            return;
        }
        setLoading(true);
        setError("");

        const res = await fetch("/api/intentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                retoId: reto.id,
                alumnoId,
                ...scores,
                tiempoSegundos: tiempoSegundos || null,
                evidenciaUrl: evidenciaUrl || null,
                comentarios: comentarios || null,
            }),
        });

        setLoading(false);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || "Ocurrió un error al guardar.");
            return;
        }

        router.push(`/retos/${reto.id}`);
        router.refresh();
    }

    if (alumnos.length === 0) {
        return <p className="empty-state">No hay alumnos activos en este grado para evaluar.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

            <div className="form-group">
                <label>Alumno</label>
                <select value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
                    {alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
            </div>

            <div className="rubric-section">
                {CRITERIOS_RUBRICA.map((c) => (
                    <div key={c.key} className="rubric-item">
                        <p>{c.label}</p>
                        <div className="score-selector">
                            {Array.from({ length: PUNTAJE_MAX_CRITERIO + 1 }, (_, n) => n).map((n) => (
                                <button
                                    type="button"
                                    key={n}
                                    className={`score-btn ${scores[c.key] === n ? "active" : ""}`}
                                    onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginBottom: "1.5rem" }}>Puntaje total: <strong>{total}</strong> / {CRITERIOS_RUBRICA.length * PUNTAJE_MAX_CRITERIO}</p>

            <div className="grid grid-2">
                <div className="form-group">
                    <label>Tiempo (segundos, opcional)</label>
                    <input type="number" min="0" value={tiempoSegundos} onChange={(e) => setTiempoSegundos(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Evidencia (enlace a foto/video, opcional)</label>
                    <input type="url" placeholder="https://..." value={evidenciaUrl} onChange={(e) => setEvidenciaUrl(e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label>Comentarios</label>
                <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Registrar evaluación"}
            </button>
        </form>
    );
}
