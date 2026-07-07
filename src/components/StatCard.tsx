export function StatCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5"
          : "rounded-2xl border border-slate-200 bg-white p-5"
      }
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-brand-600" : "text-slate-900"}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
