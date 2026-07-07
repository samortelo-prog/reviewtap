"use client";

import { useActionState, use } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { AuthCard, inputCls, btnCls } from "@/components/AuthCard";

export default function ResetPasswordPage(props: { params: Promise<{ token: string }> }) {
  const { token } = use(props.params);
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <AuthCard title="Nueva contraseña">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input name="password" type="password" placeholder="Nueva contraseña (mín. 8)" required className={inputCls} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className={btnCls}>
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </AuthCard>
  );
}
