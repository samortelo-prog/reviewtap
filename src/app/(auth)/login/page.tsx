"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { AuthCard, inputCls, btnCls } from "@/components/AuthCard";

function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const params = useSearchParams();

  return (
    <AuthCard title="Iniciar sesión">
      {params.get("registered") && (
        <p className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm p-3">Cuenta creada. Inicia sesión.</p>
      )}
      {params.get("reset") && (
        <p className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm p-3">Contraseña actualizada.</p>
      )}
      <form action={formAction} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className={inputCls} />
        <input name="password" type="password" placeholder="Contraseña" required className={inputCls} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className={btnCls}>
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-slate-500">
        <Link href="/forgot-password" className="hover:text-brand-600">¿Olvidaste tu contraseña?</Link>
        <Link href="/register" className="hover:text-brand-600">Crear cuenta</Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
