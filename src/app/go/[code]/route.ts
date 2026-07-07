import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordVisit } from "@/lib/tracking";
import type { EventType } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Redirect con tracking: /go/RT-0001?to=google
 * Registra el clic y redirige 302 al destino real.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const to = req.nextUrl.searchParams.get("to") ?? "google";

  const tag = await prisma.nfcTag.findUnique({
    where: { code },
    include: { business: true },
  });
  if (!tag || tag.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const b = tag.business;
  const destinations: Record<string, { url: string | null; event: EventType }> = {
    google: { url: b.googleReviewUrl, event: "GOOGLE_CLICK" },
    whatsapp: { url: b.whatsapp ? `https://wa.me/${b.whatsapp.replace(/\D/g, "")}` : null, event: "WHATSAPP_CLICK" },
    instagram: { url: b.instagram ? `https://instagram.com/${b.instagram.replace(/^@/, "")}` : null, event: "INSTAGRAM_CLICK" },
    facebook: { url: b.facebook, event: "FACEBOOK_CLICK" },
    website: { url: b.website, event: "WEBSITE_CLICK" },
  };

  const dest = destinations[to];
  if (!dest?.url) return NextResponse.redirect(new URL(`/r/${b.slug}`, req.url));

  await recordVisit(tag.id, dest.event);
  return NextResponse.redirect(dest.url, 302);
}
