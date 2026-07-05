import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede gestionar usuarios" }, { status: 403 });

    const data = await request.json();
    if (!data.email || !data.nombre || !data.rol) {
        return NextResponse.json({ error: "Email, nombre y rol son obligatorios" }, { status: 400 });
    }
    if (data.rol === "PROFESOR" && !data.grado) {
        return NextResponse.json({ error: "Un profesor debe tener un grado asignado" }, { status: 400 });
    }

    const usuario = await prisma.usuario.create({
        data: {
            email: data.email.trim().toLowerCase(),
            nombre: data.nombre,
            rol: data.rol,
            grado: data.rol === "ADMIN" ? null : data.grado,
        },
    });

    return NextResponse.json(usuario, { status: 201 });
}
