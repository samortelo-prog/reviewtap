import { prisma } from "@/lib/prisma";
import type { EventType } from "@/lib/types";

const READ_TYPES: EventType[] = ["NFC_READ", "QR_READ"];

export type DashboardStats = {
  businesses: number;
  tags: number;
  reads: number;
  clicks: number;
  conversion: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [businesses, tags, reads, clicks] = await prisma.$transaction([
    prisma.business.count(),
    prisma.nfcTag.count(),
    prisma.visit.count({ where: { type: { in: READ_TYPES } } }),
    prisma.visit.count({ where: { type: "GOOGLE_CLICK" } }),
  ]);
  const conversion = reads > 0 ? Math.round((clicks / reads) * 100) : 0;
  return { businesses, tags, reads, clicks, conversion };
}

export type DayPoint = { date: string; label: string; reads: number; clicks: number };

/**
 * Serie diaria de los últimos N días (lecturas vs clics) para el gráfico.
 * Rellena días sin datos con ceros para que la línea no tenga huecos.
 */
export async function getDailySeries(days = 30, businessId?: string): Promise<DayPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const visits = await prisma.visit.findMany({
    where: {
      createdAt: { gte: since },
      ...(businessId ? { tag: { businessId } } : {}),
    },
    select: { type: true, createdAt: true },
  });

  const buckets = new Map<string, { reads: number; clicks: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { reads: 0, clicks: 0 });
  }

  type Visit = (typeof visits)[number];
  for (const v of visits as Visit[]) {
    const key = v.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    if (READ_TYPES.includes(v.type)) b.reads++;
    else if (v.type === "GOOGLE_CLICK") b.clicks++;
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    label: new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(new Date(date)),
    reads: v.reads,
    clicks: v.clicks,
  }));
}

export type ChannelBreakdown = { channel: string; count: number };

/** Distribución de clics por canal (Google, WhatsApp, IG, FB, web) */
export async function getChannelBreakdown(businessId?: string): Promise<ChannelBreakdown[]> {
  const grouped = await prisma.visit.groupBy({
    by: ["type"],
    _count: { _all: true },
    where: {
      type: { in: ["GOOGLE_CLICK", "WHATSAPP_CLICK", "INSTAGRAM_CLICK", "FACEBOOK_CLICK", "WEBSITE_CLICK"] },
      ...(businessId ? { tag: { businessId } } : {}),
    },
  });

  const labels: Record<string, string> = {
    GOOGLE_CLICK: "Google",
    WHATSAPP_CLICK: "WhatsApp",
    INSTAGRAM_CLICK: "Instagram",
    FACEBOOK_CLICK: "Facebook",
    WEBSITE_CLICK: "Web",
  };

  type Grouped = (typeof grouped)[number];
  return grouped
    .map((g: Grouped) => ({ channel: labels[g.type] ?? g.type, count: g._count._all }))
    .sort((a: ChannelBreakdown, b: ChannelBreakdown) => b.count - a.count);
}

export type RecentEvent = {
  id: string;
  type: EventType;
  business: string;
  device: string | null;
  browser: string | null;
  country: string | null;
  createdAt: Date;
};

export async function getRecentEvents(limit = 15, businessId?: string): Promise<RecentEvent[]> {
  const visits = await prisma.visit.findMany({
    where: businessId ? { tag: { businessId } } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { tag: { include: { business: { select: { name: true } } } } },
  });

  type VisitFull = (typeof visits)[number];
  return visits.map((v: VisitFull) => ({
    id: v.id,
    type: v.type,
    business: v.tag.business.name,
    device: v.device,
    browser: v.browser,
    country: v.country,
    createdAt: v.createdAt,
  }));
}
