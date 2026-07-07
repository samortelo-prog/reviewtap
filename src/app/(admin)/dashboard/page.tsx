import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { TrendChart } from "@/components/TrendChart";
import { ChannelBars } from "@/components/ChannelBars";
import { EventsTable } from "@/components/EventsTable";
import { getDashboardStats, getDailySeries, getChannelBreakdown, getRecentEvents } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, series, channels, events] = await Promise.all([
    getDashboardStats(),
    getDailySeries(30),
    getChannelBreakdown(),
    getRecentEvents(12),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen general de tu cuenta</p>
        </div>
        <Link
          href="/dashboard/businesses/new"
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 transition"
        >
          + Nuevo negocio
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Negocios" value={stats.businesses} />
        <StatCard label="Tarjetas NFC" value={stats.tags} />
        <StatCard label="Lecturas" value={stats.reads} />
        <StatCard label="Clics Google" value={stats.clicks} />
        <StatCard label="Conversión" value={`${stats.conversion}%`} accent hint="clics / lecturas" />
      </div>

      <TrendChart data={series} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelBars data={channels} />
        <EventsTable events={events} />
      </div>
    </div>
  );
}
