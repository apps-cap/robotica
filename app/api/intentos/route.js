import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CRITERIOS_RUBRICA } from "@/lib/constants";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await request.json();

    const [reto, alumno] = await Promise.all([
        prisma.reto.findUnique({ where: { id: data.retoId } }),
        prisma.alumno.findUnique({ where: { id: data.alumnoId } }),
    ]);

    if (!reto || !alumno) return NextResponse.json({ error: "Reto o alumno no encontrado" }, { status: 404 });
    if (!session.user.isAdmin && (reto.grado !== session.user.grado || alumno.grado !== session.user.grado)) {
        return NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 });
    }

    const criterios = {};
    let puntajeTotal = 0;
    for (const c of CRITERIOS_RUBRICA) {
        const valor = Math.min(4, Math.max(0, Number(data[c.key]) || 0));
        criterios[c.key] = valor;
        puntajeTotal += valor;
    }

    const intento = await prisma.intento.create({
        data: {
            retoId: data.retoId,
            alumnoId: data.alumnoId,
            equipoLabel: data.equipoLabel || null,
            ...criterios,
            puntajeTotal,
            tiempoSegundos: data.tiempoSegundos ? Number(data.tiempoSegundos) : null,
            evidenciaUrl: data.evidenciaUrl || null,
            comentarios: data.comentarios || null,
            evaluadoPorEmail: session.user.email,
        },
    });

    return NextResponse.json(intento, { status: 201 });
}
