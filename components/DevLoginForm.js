"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// Solo para desarrollo: permite elegir un email ya registrado en Usuario
// para entrar sin depender de credenciales reales de Google OAuth.
export default function DevLoginForm({ usuarios }) {
    const [email, setEmail] = useState(usuarios[0]?.email ?? "");

    async function handleSubmit(e) {
        e.preventDefault();
        await signIn("dev-login", { email, callbackUrl: "/dashboard" });
    }

    if (!usuarios.length) return null;

    return (
        <form onSubmit={handleSubmit} className="form-group">
            <label htmlFor="dev-email">Acceso de desarrollo (elige un usuario)</label>
            <select id="dev-email" value={email} onChange={(e) => setEmail(e.target.value)}>
                {usuarios.map((u) => (
                    <option key={u.email} value={u.email}>
                        {u.nombre} — {u.email} ({u.rol}{u.grado ? `, ${u.grado}` : ""})
                    </option>
                ))}
            </select>
            <button type="submit" className="btn btn-outline" style={{ width: "100%", marginTop: "0.75rem" }}>
                Entrar como usuario de prueba
            </button>
        </form>
    );
}
