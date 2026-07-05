"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADOS } from "@/lib/constants";

export default function AlumnoForm({ alumno, isAdmin, gradoFijo }) {
    const router = useRouter();
    const [form, setForm] = useState({
        nombre: alumno?.nombre || "",
        grado: alumno?.grado || gradoFijo || GRADOS[0].value,
        grupo: alumno?.grupo || "",
        fechaNacimiento: alumno?.fechaNacimiento ? alumno.fechaNacimiento.substring(0, 10) : "",
        tutorNombre: alumno?.tutorNombre || "",
        tutorContacto: alumno?.tutorContacto || "",
        disponibleExtracurricular: alumno?.disponibleExtracurricular || false,
        asistenciaNota: alumno?.asistenciaNota ?? "",
        avalFamilia: alumno?.avalFamilia || false,
        notas: alumno?.notas || "",
        estado: alumno?.estado || "ACTIVO",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const url = alumno ? `/api/alumnos/${alumno.id}` : "/api/alumnos";
        const method = alumno ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setLoading(false);

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || "Ocurrió un error al guardar.");
            return;
        }

        router.push("/alumnos");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            {error && <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>}

            <div className="grid grid-2">
                <div className="form-group">
                    <label>Nombre completo</label>
                    <input required value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Grado</label>
                    <select
                        value={form.grado}
                        disabled={!isAdmin}
                        onChange={(e) => update("grado", e.target.value)}
                    >
                        {GRADOS.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Grupo / sección (opcional)</label>
                    <input value={form.grupo} onChange={(e) => update("grupo", e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Fecha de nacimiento (opcional)</label>
                    <input type="date" value={form.fechaNacimiento} onChange={(e) => update("fechaNacimiento", e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Nombre del tutor</label>
                    <input value={form.tutorNombre} onChange={(e) => update("tutorNombre", e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Contacto del tutor (email/tel)</label>
                    <input value={form.tutorContacto} onChange={(e) => update("tutorContacto", e.target.value)} />
                </div>

                {alumno && (
                    <div className="form-group">
                        <label>Estado</label>
                        <select value={form.estado} onChange={(e) => update("estado", e.target.value)}>
                            <option value="ACTIVO">Activo</option>
                            <option value="BAJA">Baja</option>
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label>Asistencia / consistencia (1-5, criterio de selección)</label>
                    <input type="number" min="1" max="5" value={form.asistenciaNota} onChange={(e) => update("asistenciaNota", e.target.value)} />
                </div>
            </div>

            <div className="form-group checkbox-row">
                <input
                    type="checkbox"
                    id="disponible"
                    checked={form.disponibleExtracurricular}
                    onChange={(e) => update("disponibleExtracurricular", e.target.checked)}
                />
                <label htmlFor="disponible" style={{ marginBottom: 0 }}>Disponible para ensayos extracurriculares</label>
            </div>

            <div className="form-group checkbox-row">
                <input
                    type="checkbox"
                    id="aval"
                    checked={form.avalFamilia}
                    onChange={(e) => update("avalFamilia", e.target.checked)}
                />
                <label htmlFor="aval" style={{ marginBottom: 0 }}>Cuenta con aval de la familia para competir</label>
            </div>

            <div className="form-group">
                <label>Notas</label>
                <textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : alumno ? "Guardar cambios" : "Dar de alta"}
            </button>
        </form>
    );
}
