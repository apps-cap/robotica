import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const equipo = await prisma.equipo.findUnique({ where: { id: params.id } });
    if (!equipo) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    if (!session.user.isAdmin && equipo.grado !== session.user.grado) {
        return NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 });
    }

    await prisma.equipoAlumno.delete({
        where: { equipoId_alumnoId: { equipoId: params.id, alumnoId: params.alumnoId } },
    });

    return NextResponse.json({ ok: true });
}
