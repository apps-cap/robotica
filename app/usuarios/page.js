import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { labelGrado } from "@/lib/constants";
import UsuarioForm from "@/components/UsuarioForm";
import UsuarioDeleteButton from "@/components/UsuarioDeleteButton";

export default async function UsuariosPage() {
    await requireAdmin();
    const usuarios = await prisma.usuario.findMany({ orderBy: [{ rol: "asc" }, { nombre: "asc" }] });

    return (
        <div className="container">
            <h1>Usuarios</h1>
            <p className="subtitle">Administra quién puede iniciar sesión y con qué rol/grado.</p>

            <UsuarioForm />

            <div className="table-container glass-card">
                <table>
                    <thead>
                        <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Grado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td>{u.nombre}</td>
                                <td>{u.email}</td>
                                <td><span className="badge badge-neutral">{u.rol}</span></td>
                                <td>{u.grado ? labelGrado(u.grado) : "—"}</td>
                                <td><UsuarioDeleteButton id={u.id} nombre={u.nombre} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
