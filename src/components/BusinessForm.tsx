"use client";

import { useActionState } from "react";
import { inputCls, btnCls } from "@/components/AuthCard";

type State = { error?: string } | undefined;

// Campos editables del negocio (subconjunto del modelo Prisma que expone el formulario)
type BusinessFields =
  | "name" | "category" | "googleReviewUrl" | "logoUrl" | "description"
  | "address" | "city" | "phone" | "whatsapp" | "instagram" | "facebook" | "website";

type BusinessData = Partial<Record<BusinessFields, string | null>>;

const fields: { name: BusinessFields; label: string; placeholder?: string; required?: boolean }[] = [
  { name: "name", label: "Nombre del negocio *", required: true, placeholder: "Restaurante La Plaza" },
  { name: "category", label: "Categoría *", required: true, placeholder: "Restaurante" },
  { name: "googleReviewUrl", label: "Google Review URL *", required: true, placeholder: "https://g.page/r/xxxxx/review" },
  { name: "logoUrl", label: "Logo (URL de imagen)", placeholder: "https://..." },
  { name: "description", label: "Descripción corta" },
  { name: "address", label: "Dirección" },
  { name: "city", label: "Ciudad", placeholder: "Lima" },
  { name: "phone", label: "Teléfono" },
  { name: "whatsapp", label: "WhatsApp (con código de país)", placeholder: "51999999999" },
  { name: "instagram", label: "Instagram (usuario sin @)" },
  { name: "facebook", label: "Facebook (URL)" },
  { name: "website", label: "Página web (URL)" },
];

export function BusinessForm({
  action,
  business,
  submitLabel,
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
  business?: BusinessData;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <label key={f.name} className="block text-sm">
            <span className="text-slate-600">{f.label}</span>
            <input
              name={f.name}
              defaultValue={(business?.[f.name] as string) ?? ""}
              placeholder={f.placeholder}
              required={f.required}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        ))}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className={btnCls}>
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
