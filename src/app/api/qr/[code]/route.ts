import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qrPng, qrSvg } from "@/lib/qr";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * /api/qr/RT-0001?format=png|svg&download=1
 * El QR apunta a la misma URL grabada en el chip NFC (con ?src=qr para diferenciar en analítica).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { code } = await ctx.params;
  const format = req.nextUrl.searchParams.get("format") === "svg" ? "svg" : "png";
  const download = req.nextUrl.searchParams.get("download") === "1";

  const tag = await prisma.nfcTag.findUnique({ where: { code } });
  if (!tag) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const url = `${tag.url}&src=qr`;
  const disposition = download ? `attachment; filename="${code}.${format}"` : "inline";

  if (format === "svg") {
    const svg = await qrSvg(url);
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml", "Content-Disposition": disposition },
    });
  }

  const png = await qrPng(url);
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Content-Disposition": disposition },
  });
}
