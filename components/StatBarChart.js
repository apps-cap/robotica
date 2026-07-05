"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StatBarChart({ data, domain = [0, 4], barColor = "#818cf8", valueSuffix = "", emptyMessage = "Aún no hay datos suficientes para graficar." }) {
    if (!data.length) {
        return <p className="empty-state">{emptyMessage}</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" domain={domain} stroke="#94a3b8" />
                <YAxis type="category" dataKey="nombre" width={220} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem" }}
                    labelStyle={{ color: "#f8fafc" }}
                    formatter={(value) => [`${value}${valueSuffix}`, "Promedio"]}
                />
                <Bar dataKey="promedio" fill={barColor} radius={[0, 6, 6, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
