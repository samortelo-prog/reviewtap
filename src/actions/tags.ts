"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

/** Genera código secuencial RT-0001, RT-0002... con reintento ante colisión */
async function nextCode(): Promise<string> {
  const count = await prisma.nfcTag.count();
  for (let i = 1; i <= 50; i++) {
    const code = `RT-${String(count + i).padStart(4, "0")}`;
    const exists = await prisma.nfcTag.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("No se pudo generar código de tarjeta");
}

/** Uso interno (al crear negocio) y desde la acción pública de abajo */
export async function createTagForBusiness(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("Negocio no encontrado");

  const code = await nextCode();
  // URL corta: cabe de sobra en un NTAG213 (144 bytes útiles)
  const url = `${appUrl()}/r/${business.slug}?t=${code}`;

  return prisma.nfcTag.create({ data: { businessId, code, url } });
}

export async function createTag(businessId: string): Promise<void> {
  await requireAdmin();
  await createTagForBusiness(businessId);
  revalidatePath(`/dashboard/businesses/${businessId}`);
}

export async function toggleTag(tagId: string): Promise<void> {
  await requireAdmin();
  const tag = await prisma.nfcTag.findUnique({ where: { id: tagId } });
  if (!tag) return;
  await prisma.nfcTag.update({
    where: { id: tagId },
    data: { status: tag.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath(`/dashboard/businesses/${tag.businessId}`);
}
