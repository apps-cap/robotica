import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Solo el administrador puede eliminar" }, { status: 403 });

    await prisma.habilidad.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
