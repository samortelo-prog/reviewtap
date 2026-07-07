"use client";

import type { DayPoint } from "@/lib/analytics";

/**
 * Gráfico de líneas SVG puro (sin librería): lecturas vs clics.
 * Ligero y sin dependencias — suficiente para el dashboard del MVP.
 */
export function TrendChart({ data }: { data: DayPoint[] }) {
  const W = 720;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...data.map((d) => Math.max(d.reads, d.clicks)));
  const stepX = data.length > 1 ? iw / (data.length - 1) : 0;

  const toPath = (key: "reads" | "clicks") =>
    data
      .map((d, i) => {
        const x = PAD.left + i * stepX;
        const y = PAD.top + ih - (d[key] / max) * ih;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  // Etiquetas de eje X cada ~6 días para no saturar
  const tickEvery = Math.ceil(data.length / 6);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Actividad · últimos 30 días</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Lecturas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Clics Google
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* líneas de referencia horizontales */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + ih - t * ih;
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={4} y={y + 4} fontSize={10} fill="#94a3b8">
                {Math.round(t * max)}
              </text>
            </g>
          );
        })}

        <path d={toPath("reads")} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" />
        <path d={toPath("clicks")} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" />

        {data.map((d, i) =>
          i % tickEvery === 0 ? (
            <text
              key={d.date}
              x={PAD.left + i * stepX}
              y={H - 8}
              fontSize={10}
              fill="#94a3b8"
              textAnchor="middle"
            >
              {d.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
