"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({ data, domain = [0, 20] }) {
    if (data.length < 2) {
        return <p className="empty-state">Se necesitan al menos 2 evaluaciones para ver una tendencia.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="fecha" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={domain} stroke="#94a3b8" />
                <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem" }}
                    labelStyle={{ color: "#f8fafc" }}
                />
                <Line type="monotone" dataKey="puntaje" name="Puntaje" stroke="#c084fc" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}
