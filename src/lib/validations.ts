import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nombre muy corto").max(80),
});

export const resetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional()
  .pipe(z.string().url("URL inválida").optional());

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(100),
  category: z.string().trim().min(2, "Categoría requerida").max(60),
  description: optionalText,
  address: optionalText,
  city: optionalText,
  phone: optionalText,
  whatsapp: optionalText, // solo dígitos con código de país, ej: 51999999999
  instagram: optionalText, // usuario sin @
  facebook: optionalUrl,
  website: optionalUrl,
  logoUrl: optionalUrl,
  googleReviewUrl: z.string().trim().url("URL de Google Reviews inválida"),
});

export type BusinessInput = z.infer<typeof businessSchema>;
