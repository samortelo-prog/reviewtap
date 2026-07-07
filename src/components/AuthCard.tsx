export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <span className="text-xl font-bold text-brand-600">ReviewTap</span>
          <h1 className="mt-2 text-lg font-semibold text-slate-800">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}

export const inputCls =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";
export const btnCls =
  "w-full rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 transition";
