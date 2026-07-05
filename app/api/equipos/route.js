import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await request.json();
    if (!session.user.isAdmin && data.grado !== session.user.grado) {
        return NextResponse.json({ error: "No puedes crear equipos fuera de tu grado" }, { status: 403 });
    }
    if (!data.nombre || !data.evento || !data.categoria || !data.grado) {
        return NextResponse.json({ error: "Nombre, evento, categoría y grado son obligatorios" }, { status: 400 });
    }

    const equipo = await prisma.equipo.create({
        data: {
            nombre: data.nombre,
            evento: data.evento,
            categoria: data.categoria,
            grado: data.grado,
            cicloEscolar: data.cicloEscolar || "2026-2027",
            coachId: data.coachId || null,
        },
    });

    return NextResponse.json(equipo, { status: 201 });
}
