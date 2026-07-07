"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { AuthCard, inputCls, btnCls } from "@/components/AuthCard";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <AuthCard title="Crear cuenta">
      <form action={formAction} className="space-y-4">
        <input name="name" placeholder="Nombre" required className={inputCls} />
        <input name="email" type="email" placeholder="Email" required className={inputCls} />
        <input name="password" type="password" placeholder="Contraseña (mín. 8)" required className={inputCls} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className={btnCls}>
          {pending ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta? <Link href="/login" className="text-brand-600">Inicia sesión</Link>
      </p>
    </AuthCard>
  );
}
