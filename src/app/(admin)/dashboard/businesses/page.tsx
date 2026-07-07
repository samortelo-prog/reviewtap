import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tags: true } } },
  });

  type BusinessRow = (typeof businesses)[number];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Negocios</h1>
        <Link
          href="/dashboard/businesses/new"
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 transition"
        >
          + Nuevo negocio
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-slate-500">Aún no hay negocios. Crea el primero.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {businesses.map((b: BusinessRow) => (
            <Link
              key={b.id}
              href={`/dashboard/businesses/${b.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-semibold text-slate-900">{b.name}</p>
                <p className="text-sm text-slate-500">{b.category}{b.city ? ` · ${b.city}` : ""}</p>
              </div>
              <span className="text-sm text-slate-400">{b._count.tags} tarjeta(s)</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
