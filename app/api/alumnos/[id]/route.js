import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getAuthorizedAlumno(id, session) {
    const alumno = await prisma.alumno.findUnique({ where: { id } });
    if (!alumno) return { error: NextResponse.json({ error: "No encontrado" }, { status: 404 }) };
    if (!session.user.isAdmin && alumno.grado !== session.user.grado) {
        return { error: NextResponse.json({ error: "No autorizado para este grado" }, { status: 403 }) };
    }
    return { alumno };
}

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { alumno, error } = await getAuthorizedAlumno(params.id, session);
    if (error) return error;
    return NextResponse.json(alumno);
}

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.rol) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { alumno: existente, error } = await getAuthorizedAlumno(params.id, session);
    if (error) return error;

    const data = await request.json();
    const nuevoEstado = data.estado || existente.estado;

    const alumno = await prisma.alumno.update({
        where: { id: params.id },
        data: {
            nombre: data.nombre ?? existente.nombre,
            grado: session.user.isAdmin ? (data.grado ?? existente.grado) : existente.grado,
            grupo: data.grupo ?? existente.grupo,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : existente.fechaNacimiento,
            tutorNombre: data.tutorNombre ?? existente.tutorNombre,
            tutorContacto: data.tutorContacto ?? existente.tutorContacto,
            disponibleExtracurricular: data.disponibleExtracurricular ?? existente.disponibleExtracurricular,
            asistenciaNota: data.asistenciaNota !== undefined ? Number(data.asistenciaNota) || null : existente.asistenciaNota,
            avalFamilia: data.avalFamilia ?? existente.avalFamilia,
            notas: data.notas ?? existente.notas,
            estado: nuevoEstado,
            fechaBaja: nuevoEstado === "BAJA"
                ? (existente.fechaBaja ?? new Date())
                : null,
        },
    });

    await prisma.log.create({
        data: { message: `Actualización de alumno ${alumno.nombre}`, details: session.user.email },
    });

    return NextResponse.json(alumno);
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede eliminar" }, { status: 403 });

    const { alumno, error } = await getAuthorizedAlumno(params.id, session);
    if (error) return error;

    await prisma.alumno.delete({ where: { id: params.id } });
    await prisma.log.create({
        data: { message: `Eliminación de alumno ${alumno.nombre}`, details: session.user.email },
    });

    return NextResponse.json({ ok: true });
}
