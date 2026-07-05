import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const grado = session.user.isAdmin ? searchParams.get("grado") || undefined : session.user.grado;

    const habilidades = await prisma.habilidad.findMany({
        where: grado ? { grado } : {},
        orderBy: [{ grado: "asc" }, { categoria: "asc" }],
    });

    return NextResponse.json(habilidades);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede crear habilidades" }, { status: 403 });

    const data = await request.json();
    if (!data.nombre || !data.grado || !data.categoria) {
        return NextResponse.json({ error: "Nombre, categoría y grado son obligatorios" }, { status: 400 });
    }

    const habilidad = await prisma.habilidad.create({
        data: {
            nombre: data.nombre,
            categoria: data.categoria,
            grado: data.grado,
            descripcion: data.descripcion || null,
        },
    });

    return NextResponse.json(habilidad, { status: 201 });
}
