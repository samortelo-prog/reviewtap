"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema, resetRequestSchema, resetPasswordSchema } from "@/lib/validations";
import { appUrl } from "@/lib/utils";

export type ActionState = { error?: string; success?: string } | undefined;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Email o contraseña incorrectos" };
    throw err; // el redirect de next-auth se propaga aquí, no lo tragamos
  }
  return undefined;
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // El registro abierto solo se permite para crear la primera cuenta (o si ALLOW_REGISTER=true).
  const userCount = await prisma.user.count();
  if (userCount > 0 && process.env.ALLOW_REGISTER !== "true") {
    return { error: "El registro está deshabilitado. Contacta al administrador." };
  }

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Ya existe una cuenta con ese email" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash, role: "ADMIN" },
  });

  redirect("/login?registered=1");
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/**
 * MVP sin proveedor de email: genera el token y lo escribe en los logs del servidor.
 * En producción conecta Resend/SendGrid en el punto marcado con TODO.
 */
export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Respuesta idéntica exista o no el usuario (evita enumeración de cuentas)
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000 * 60 * 30) },
    });
    const link = `${appUrl()}/reset-password/${token}`;
    // TODO: enviar por email con Resend/SendGrid
    console.log(`[reset-password] Enlace para ${user.email}: ${link}`);
  }

  return { success: "Si el email existe, se generó un enlace de recuperación (revisa los logs del servidor)." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    return { error: "El enlace expiró o no es válido. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  redirect("/login?reset=1");
}
