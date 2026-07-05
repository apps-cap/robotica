import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const equipo = await prisma.equipo.findUnique({ where: { id: params.id } });
    if (!equipo) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

    const data = await request.json();
    const alumno = await prisma.alumno.findUnique({ where: { id: data.alumnoId } });
    if (!alumno) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    if (!session.user.isAdmin && (equipo.grado !== session.user.grado || alumno.grado !== session.user.grado)) {
        return NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 });
    }

    const miembro = await prisma.equipoAlumno.upsert({
        where: { equipoId_alumnoId: { equipoId: params.id, alumnoId: data.alumnoId } },
        update: { rol: data.rol || null },
        create: { equipoId: params.id, alumnoId: data.alumnoId, rol: data.rol || null },
    });

    return NextResponse.json(miembro, { status: 201 });
}
