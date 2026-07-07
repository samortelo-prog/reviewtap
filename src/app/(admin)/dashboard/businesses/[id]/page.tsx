import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBusiness, deleteBusiness } from "@/actions/businesses";
import { createTag, toggleTag } from "@/actions/tags";
import { BusinessForm } from "@/components/BusinessForm";
import { StatCard } from "@/components/StatCard";
import { TrendChart } from "@/components/TrendChart";
import { ChannelBars } from "@/components/ChannelBars";
import { EventsTable } from "@/components/EventsTable";
import { getDailySeries, getChannelBreakdown, getRecentEvents } from "@/lib/analytics";
import { appUrl, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      tags: { orderBy: { createdAt: "asc" }, include: { _count: { select: { visits: true } } } },
    },
  });
  if (!business) notFound();

  // Tipo derivado del query (evita depender de imports de @prisma/client)
  type TagWithCount = (typeof business.tags)[number];

  const [reads, clicks, series, channels, events] = await Promise.all([
    prisma.visit.count({ where: { tag: { businessId: id }, type: { in: ["NFC_READ", "QR_READ"] } } }),
    prisma.visit.count({ where: { tag: { businessId: id }, type: "GOOGLE_CLICK" } }),
    getDailySeries(30, id),
    getChannelBreakdown(id),
    getRecentEvents(10, id),
  ]);
  const conversion = reads > 0 ? Math.round((clicks / reads) * 100) : 0;

  const updateWithId = updateBusiness.bind(null, business.id);
  const deleteWithId = deleteBusiness.bind(null, business.id);
  const createTagWithId = createTag.bind(null, business.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <a href={`/r/${business.slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">
            {appUrl()}/r/{business.slug} ↗
          </a>
        </div>
        <form action={deleteWithId}>
          <button className="text-sm text-red-600 hover:underline">Eliminar negocio</button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <StatCard label="Lecturas NFC/QR" value={reads} />
        <StatCard label="Clics Google" value={clicks} />
        <StatCard label="Conversión" value={`${conversion}%`} accent />
      </div>

      <TrendChart data={series} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelBars data={channels} />
        <EventsTable events={events} showBusiness={false} />
      </div>

      {/* Tarjetas NFC */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tarjetas NFC</h2>
          <form action={createTagWithId}>
            <button className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 transition">
              + Nueva tarjeta
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {business.tags.map((tag: TagWithCount) => {
            const toggleWithId = toggleTag.bind(null, tag.id);
            return (
              <div key={tag.id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
                <div className="min-w-0">
                  <p className="font-mono font-semibold">{tag.code}</p>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{tag.url}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Creada {formatDate(tag.createdAt)} · {tag._count.visits} eventos
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={
                      tag.status === "ACTIVE"
                        ? "px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"
                        : "px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium"
                    }
                  >
                    {tag.status === "ACTIVE" ? "Activa" : "Inactiva"}
                  </span>
                  <a href={`/api/qr/${tag.code}?format=png&download=1`} className="text-brand-600 hover:underline">
                    QR PNG
                  </a>
                  <a href={`/api/qr/${tag.code}?format=svg&download=1`} className="text-brand-600 hover:underline">
                    QR SVG
                  </a>
                  <form action={toggleWithId}>
                    <button className="text-slate-500 hover:text-slate-800">
                      {tag.status === "ACTIVE" ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Graba la URL de la tarjeta en el chip NFC (compatible NTAG213/215/216) con una app como NFC Tools.
        </p>
      </section>

      {/* Editar negocio */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Editar negocio</h2>
        <BusinessForm action={updateWithId} business={business} submitLabel="Guardar cambios" />
      </section>
    </div>
  );
}
