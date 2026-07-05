import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede gestionar usuarios" }, { status: 403 });

    const data = await request.json();
    const usuario = await prisma.usuario.update({
        where: { id: params.id },
        data: {
            nombre: data.nombre,
            rol: data.rol,
            grado: data.rol === "ADMIN" ? null : data.grado,
        },
    });

    return NextResponse.json(usuario);
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede gestionar usuarios" }, { status: 403 });

    const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
    if (usuario?.email === session.user.email) {
        return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 });
    }

    await prisma.usuario.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
