import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const intento = await prisma.intento.findUnique({ where: { id: params.id }, include: { alumno: true } });
    if (!intento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (!session.user.isAdmin && intento.alumno.grado !== session.user.grado) {
        return NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 });
    }

    await prisma.intento.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
