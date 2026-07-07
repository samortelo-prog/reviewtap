import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { recordVisit } from "@/lib/tracking";

export const dynamic = "force-dynamic";

/**
 * Página pública del negocio. La lectura NFC/QR se registra en el servidor
 * al renderizar: cero JS de tracking en el cliente.
 */
export default async function PublicBusinessPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; src?: string }>;
}) {
  const { slug } = await props.params;
  const { t, src } = await props.searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { tags: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } } },
  });
  if (!business || business.tags.length === 0) notFound();

  // Resuelve la tarjeta: por código si viene en la URL, si no la primera activa
  type Tag = (typeof business.tags)[number];
  const tag = business.tags.find((x: Tag) => x.code === t) ?? business.tags[0];

  await recordVisit(tag.id, src === "qr" ? "QR_READ" : "NFC_READ");

  const go = (to: string) => `/go/${tag.code}?to=${to}`;

  const secondary: { label: string; to: string; show: boolean }[] = [
    { label: "WhatsApp", to: "whatsapp", show: !!business.whatsapp },
    { label: "Instagram", to: "instagram", show: !!business.instagram },
    { label: "Facebook", to: "facebook", show: !!business.facebook },
    { label: "Página web", to: "website", show: !!business.website },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
        {business.logoUrl ? (
          <Image
            src={business.logoUrl}
            alt={business.name}
            width={96}
            height={96}
            className="mx-auto rounded-2xl object-cover mb-5"
          />
        ) : (
          <div className="mx-auto mb-5 h-24 w-24 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-3xl font-bold">
            {business.name.charAt(0)}
          </div>
        )}

        <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
        {business.city && <p className="text-sm text-slate-500 mt-1">{business.city}</p>}

        <p className="mt-6 text-lg font-medium text-slate-700">¿Cómo fue tu experiencia?</p>

        <a
          href={go("google")}
          className="mt-4 block w-full rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition text-white font-semibold text-lg py-4 shadow-lg shadow-brand-500/30"
        >
          ⭐ Dejar reseña en Google
        </a>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {secondary
            .filter((s) => s.show)
            .map((s) => (
              <a
                key={s.to}
                href={go(s.to)}
                className="rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {s.label}
              </a>
            ))}
        </div>

        <p className="mt-8 text-[11px] text-slate-400">Powered by ReviewTap</p>
      </div>
    </main>
  );
}
