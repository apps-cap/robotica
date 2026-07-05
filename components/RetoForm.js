"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GRADOS, PERIODOS, TIPOS_RETO } from "@/lib/constants";

export default function RetoForm({ habilidades, isAdmin, gradoFijo }) {
    const router = useRouter();
    const [form, setForm] = useState({
        titulo: "",
        descripcion: "",
        grado: gradoFijo || GRADOS[0].value,
        periodo: PERIODOS[0].value,
        tipo: TIPOS_RETO[0].value,
        tiempoLimiteSeg: "",
        documentoUrl: "",
        habilidadIds: [],
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const habilidadesDelGrado = useMemo(
        () => habilidades.filter((h) => h.grado === form.grado),
        [habilidades, form.grado]
    );

    function toggleHabilidad(id) {
        setForm((f) => ({
            ...f,
            habilidadIds: f.habilidadIds.includes(id)
                ? f.habilidadIds.filter((h) => h !== id)
                : [...f.habilidadIds, id],
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/retos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || "Ocurrió un error al guardar.");
            return;
        }

        router.push("/retos");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

            <div className="form-group">
                <label>Título del reto</label>
                <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>

            <div className="grid grid-3">
                <div className="form-group">
                    <label>Grado</label>
                    <select
                        value={form.grado}
                        disabled={!isAdmin}
                        onChange={(e) => setForm({ ...form, grado: e.target.value, habilidadIds: [] })}
                    >
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Periodo</label>
                    <select value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })}>
                        {PERIODOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Tipo</label>
                    <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                        {TIPOS_RETO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Tiempo límite (segundos, opcional)</label>
                    <input type="number" min="0" value={form.tiempoLimiteSeg} onChange={(e) => setForm({ ...form, tiempoLimiteSeg: e.target.value })} />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Documento de referencia (URL del reto y rúbrica, PDF/Word)</label>
                    <input type="url" placeholder="https://drive.google.com/..." value={form.documentoUrl} onChange={(e) => setForm({ ...form, documentoUrl: e.target.value })} />
                </div>
            </div>

            <div className="form-group">
                <label>Habilidades que evalúa este reto</label>
                {habilidadesDelGrado.length === 0 ? (
                    <p className="subtitle">No hay habilidades registradas para este grado. Agrégalas en el catálogo de Habilidades.</p>
                ) : (
                    <div>
                        {habilidadesDelGrado.map((h) => (
                            <label key={h.id} className="checkbox-row" style={{ marginBottom: "0.5rem" }}>
                                <input
                                    type="checkbox"
                                    checked={form.habilidadIds.includes(h.id)}
                                    onChange={() => toggleHabilidad(h.id)}
                                />
                                <span>{h.nombre} <span className="chip">{h.categoria}</span></span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Crear reto"}
            </button>
        </form>
    );
}
