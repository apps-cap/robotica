"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn("google")}
            className="btn btn-primary"
            style={{ width: "100%" }}
        >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: "20px", height: "20px" }} />
            Iniciar sesión con Google
        </button>
    );
}
