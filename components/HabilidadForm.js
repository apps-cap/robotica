"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADOS } from "@/lib/constants";

export default function HabilidadForm() {
    const router = useRouter();
    const [form, setForm] = useState({ nombre: "", categoria: "Técnica", grado: GRADOS[0].value, descripcion: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/habilidades", {
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

        setForm({ nombre: "", categoria: "Técnica", grado: form.grado, descripcion: "" });
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Agregar habilidad al catálogo</h2>
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <div className="grid grid-4">
                <div className="form-group">
                    <label>Nombre</label>
                    <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Categoría</label>
                    <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                        <option value="Cognitiva">Cognitiva</option>
                        <option value="Técnica">Técnica</option>
                        <option value="Socioemocional">Socioemocional</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Grado</label>
                    <select value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Descripción (opcional)</label>
                    <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? "Guardando..." : "Agregar habilidad"}
            </button>
        </form>
    );
}
