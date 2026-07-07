import type { ChannelBreakdown } from "@/lib/analytics";

const COLORS: Record<string, string> = {
  Google: "bg-brand-500",
  WhatsApp: "bg-emerald-500",
  Instagram: "bg-pink-500",
  Facebook: "bg-blue-600",
  Web: "bg-slate-500",
};

export function ChannelBars({ data }: { data: ChannelBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-slate-800">Clics por canal</h3>
      {total === 0 ? (
        <p className="text-sm text-slate-400">Aún no hay clics registrados.</p>
      ) : (
        <div className="space-y-3">
          {data.map((d) => {
            const pct = Math.round((d.count / total) * 100);
            return (
              <div key={d.channel}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{d.channel}</span>
                  <span className="text-slate-400">{d.count} · {pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${COLORS[d.channel] ?? "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
