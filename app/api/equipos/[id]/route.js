import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getAuthorizedEquipo(id, session) {
    const equipo = await prisma.equipo.findUnique({ where: { id } });
    if (!equipo) return { error: NextResponse.json({ error: "No encontrado" }, { status: 404 }) };
    if (!session.user.isAdmin && equipo.grado !== session.user.grado) {
        return { error: NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 }) };
    }
    return { equipo };
}

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { equipo: existente, error } = await getAuthorizedEquipo(params.id, session);
    if (error) return error;

    const data = await request.json();
    const nuevoEstado = data.estado || existente.estado;

    const equipo = await prisma.equipo.update({
        where: { id: params.id },
        data: {
            nombre: data.nombre ?? existente.nombre,
            justificacion: data.justificacion ?? existente.justificacion,
            coachId: data.coachId !== undefined ? (data.coachId || null) : existente.coachId,
            estado: nuevoEstado,
            fechaSeleccion: nuevoEstado === "SELECCIONADO" ? (existente.fechaSeleccion ?? new Date()) : existente.fechaSeleccion,
        },
    });

    return NextResponse.json(equipo);
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { equipo, error } = await getAuthorizedEquipo(params.id, session);
    if (error) return error;

    await prisma.equipo.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
