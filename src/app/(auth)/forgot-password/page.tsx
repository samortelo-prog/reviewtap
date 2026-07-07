"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { AuthCard, inputCls, btnCls } from "@/components/AuthCard";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthCard title="Recuperar contraseña">
      <form action={formAction} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className={inputCls} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-700">{state.success}</p>}
        <button disabled={pending} className={btnCls}>
          {pending ? "Generando..." : "Generar enlace"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/login" className="text-brand-600">Volver a login</Link>
      </p>
    </AuthCard>
  );
}
