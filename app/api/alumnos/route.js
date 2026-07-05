import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const grado = session.user.isAdmin ? searchParams.get("grado") || undefined : session.user.grado;
    const estado = searchParams.get("estado") || undefined;
    const q = searchParams.get("q") || undefined;

    const alumnos = await prisma.alumno.findMany({
        where: {
            ...(grado ? { grado } : {}),
            ...(estado ? { estado } : {}),
            ...(q ? { nombre: { contains: q } } : {}),
        },
        orderBy: { nombre: "asc" },
    });

    return NextResponse.json(alumnos);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await request.json();

    if (!session.user.isAdmin && data.grado !== session.user.grado) {
        return NextResponse.json({ error: "No puedes crear alumnos fuera de tu grado" }, { status: 403 });
    }

    if (!data.nombre || !data.grado) {
        return NextResponse.json({ error: "Nombre y grado son obligatorios" }, { status: 400 });
    }

    const alumno = await prisma.alumno.create({
        data: {
            nombre: data.nombre,
            grado: data.grado,
            grupo: data.grupo || null,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            tutorNombre: data.tutorNombre || null,
            tutorContacto: data.tutorContacto || null,
            disponibleExtracurricular: !!data.disponibleExtracurricular,
            asistenciaNota: data.asistenciaNota ? Number(data.asistenciaNota) : null,
            avalFamilia: !!data.avalFamilia,
            notas: data.notas || null,
        },
    });

    await prisma.log.create({
        data: { message: `Alta de alumno ${alumno.nombre}`, details: session.user.email },
    });

    return NextResponse.json(alumno, { status: 201 });
}
