import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const grado = session.user.isAdmin ? searchParams.get("grado") || undefined : session.user.grado;
    const periodo = searchParams.get("periodo") || undefined;

    const retos = await prisma.reto.findMany({
        where: {
            ...(grado ? { grado } : {}),
            ...(periodo ? { periodo } : {}),
        },
        include: { habilidades: { include: { habilidad: true } }, _count: { select: { intentos: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(retos);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await request.json();

    if (!session.user.isAdmin && data.grado !== session.user.grado) {
        return NextResponse.json({ error: "No puedes crear retos fuera de tu grado" }, { status: 403 });
    }
    if (!data.titulo || !data.grado || !data.periodo) {
        return NextResponse.json({ error: "Título, grado y periodo son obligatorios" }, { status: 400 });
    }

    const habilidadIds = Array.isArray(data.habilidadIds) ? data.habilidadIds : [];

    const reto = await prisma.reto.create({
        data: {
            titulo: data.titulo,
            descripcion: data.descripcion || null,
            grado: data.grado,
            periodo: data.periodo,
            tipo: data.tipo || "INDIVIDUAL",
            tiempoLimiteSeg: data.tiempoLimiteSeg ? Number(data.tiempoLimiteSeg) : null,
            documentoUrl: data.documentoUrl || null,
            creadoPorEmail: session.user.email,
            habilidades: {
                create: habilidadIds.map((habilidadId) => ({ habilidadId })),
            },
        },
    });

    return NextResponse.json(reto, { status: 201 });
}
