"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADOS, EVENTOS } from "@/lib/constants";

export default function EquipoForm({ isAdmin, gradoFijo, usuarios, coachSugeridoId }) {
    const router = useRouter();
    const [form, setForm] = useState({
        nombre: "",
        evento: EVENTOS[0].value,
        categoria: "",
        grado: gradoFijo || GRADOS[0].value,
        coachId: coachSugeridoId || "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/equipos", {
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

        const equipo = await res.json();
        router.push(`/equipos/${equipo.id}`);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

            <div className="form-group">
                <label>Nombre del equipo</label>
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Los Ingenieros 4A" />
            </div>

            <div className="grid grid-3">
                <div className="form-group">
                    <label>Evento</label>
                    <select value={form.evento} onChange={(e) => setForm({ ...form, evento: e.target.value })}>
                        {EVENTOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Categoría</label>
                    <input required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ej. RoboMission Elementary" />
                </div>

                <div className="form-group">
                    <label>Grado</label>
                    <select value={form.grado} disabled={!isAdmin} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
                        {GRADOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Coach responsable</label>
                    <select value={form.coachId} onChange={(e) => setForm({ ...form, coachId: e.target.value })}>
                        <option value="">Sin asignar</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nombre} ({u.rol === "ADMIN" ? "Admin" : u.grado})</option>
                        ))}
                    </select>
                </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Crear equipo"}
            </button>
        </form>
    );
}
