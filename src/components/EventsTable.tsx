import type { RecentEvent } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";
import type { EventType } from "@/lib/types";

const BADGE: Record<EventType, { label: string; cls: string }> = {
  NFC_READ: { label: "NFC", cls: "bg-brand-50 text-brand-700" },
  QR_READ: { label: "QR", cls: "bg-indigo-50 text-indigo-700" },
  GOOGLE_CLICK: { label: "Google", cls: "bg-emerald-50 text-emerald-700" },
  WHATSAPP_CLICK: { label: "WhatsApp", cls: "bg-green-50 text-green-700" },
  INSTAGRAM_CLICK: { label: "Instagram", cls: "bg-pink-50 text-pink-700" },
  FACEBOOK_CLICK: { label: "Facebook", cls: "bg-blue-50 text-blue-700" },
  WEBSITE_CLICK: { label: "Web", cls: "bg-slate-100 text-slate-600" },
};

export function EventsTable({ events, showBusiness = true }: { events: RecentEvent[]; showBusiness?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800">Actividad reciente</h3>
      </div>
      {events.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">Sin eventos todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Evento</th>
                {showBusiness && <th className="px-5 py-3 font-medium">Negocio</th>}
                <th className="px-5 py-3 font-medium">Dispositivo</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((e) => {
                const b = BADGE[e.type];
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span>
                    </td>
                    {showBusiness && <td className="px-5 py-3 text-slate-700">{e.business}</td>}
                    <td className="px-5 py-3 text-slate-500">
                      {[e.device, e.browser].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(e.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
