"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADOS } from "@/lib/constants";

export default function UsuarioForm() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", nombre: "", rol: "PROFESOR", grado: GRADOS[0].value });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/usuarios", {
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

        setForm({ email: "", nombre: "", rol: "PROFESOR", grado: GRADOS[0].value });
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Agregar usuario</h2>
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <div className="grid grid-4">
                <div className="form-group">
                    <label>Email (cuenta de Google)</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Nombre</label>
                    <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Rol</label>
                    <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                        <option value="PROFESOR">Profesor</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                {form.rol === "PROFESOR" && (
                    <div className="form-group">
                        <label>Grado asignado</label>
                        <select value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
                            {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                    </div>
                )}
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? "Guardando..." : "Agregar usuario"}
            </button>
        </form>
    );
}
