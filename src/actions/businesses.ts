"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { businessSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { createTagForBusiness } from "@/actions/tags";

export type ActionState = { error?: string } | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return session.user as { id: string; role: string };
}

/** Genera un slug único agregando sufijo numérico si hace falta */
async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "negocio";
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const clash = await prisma.business.findUnique({ where: { slug } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
  throw new Error("No se pudo generar un slug único");
}

export async function createBusiness(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();

  const parsed = businessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const slug = await uniqueSlug(parsed.data.name);
  const business = await prisma.business.create({
    data: { ...parsed.data, slug, ownerId: user.id },
  });

  // Cada negocio nace con su primera tarjeta NFC lista para grabar
  await createTagForBusiness(business.id);

  revalidatePath("/dashboard");
  redirect(`/dashboard/businesses/${business.id}`);
}

export async function updateBusiness(businessId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = businessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const current = await prisma.business.findUnique({ where: { id: businessId } });
  if (!current) return { error: "Negocio no encontrado" };

  // El slug solo cambia si cambió el nombre (las tarjetas ya grabadas siguen funcionando
  // porque la resolución pública usa el código de tarjeta como fallback)
  const slug = current.name !== parsed.data.name ? await uniqueSlug(parsed.data.name, businessId) : current.slug;

  await prisma.business.update({ where: { id: businessId }, data: { ...parsed.data, slug } });

  revalidatePath(`/dashboard/businesses/${businessId}`);
  revalidatePath("/dashboard/businesses");
  return undefined;
}

export async function deleteBusiness(businessId: string): Promise<void> {
  await requireAdmin();
  await prisma.business.delete({ where: { id: businessId } });
  revalidatePath("/dashboard");
  redirect("/dashboard/businesses");
}
