import { headers } from "next/headers";
import UAParser from "ua-parser-js";
import { prisma } from "@/lib/prisma";
import type { EventType } from "@/lib/types";

/**
 * Registra un evento (lectura NFC/QR o clic) de forma no bloqueante para el usuario final.
 * Nunca lanza error: la página pública jamás debe romperse por analítica.
 */
export async function recordVisit(tagId: string, type: EventType): Promise<void> {
  try {
    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    const parser = new UAParser(ua);

    const device = parser.getDevice().type ?? "desktop";
    const browser = parser.getBrowser().name ?? null;
    const os = parser.getOS().name ?? null;
    // Cloudflare / Vercel exponen el país. Railway no lo hace por defecto:
    // si pones Cloudflare delante del dominio, cf-ipcountry llega solo.
    const country = h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? null;

    await prisma.visit.create({
      data: { tagId, type, device, browser, os, country },
    });
  } catch (err) {
    console.error("[tracking] no se pudo registrar la visita:", err);
  }
}
