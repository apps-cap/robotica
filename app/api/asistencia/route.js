import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await request.json();
    const { fecha, registros } = data;

    if (!fecha || !Array.isArray(registros) || registros.length === 0) {
        return NextResponse.json({ error: "Fecha y registros son obligatorios" }, { status: 400 });
    }

    const fechaNormalizada = new Date(`${fecha}T00:00:00`);

    const alumnos = await prisma.alumno.findMany({
        where: { id: { in: registros.map((r) => r.alumnoId) } },
    });

    if (!session.user.isAdmin && alumnos.some((a) => a.grado !== session.user.grado)) {
        return NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 });
    }

    await Promise.all(
        registros.map((r) =>
            prisma.asistencia.upsert({
                where: { alumnoId_fecha: { alumnoId: r.alumnoId, fecha: fechaNormalizada } },
                update: { estado: r.estado, registradoPorEmail: session.user.email },
                create: {
                    alumnoId: r.alumnoId,
                    fecha: fechaNormalizada,
                    estado: r.estado,
                    registradoPorEmail: session.user.email,
                },
            })
        )
    );

    return NextResponse.json({ ok: true, guardados: registros.length });
}
