/**
 * Tipos compartidos derivados del schema de Prisma.
 * Se definen aquí como uniones de strings para no acoplar componentes de UI
 * a la generación del cliente Prisma (que solo existe tras `prisma generate`).
 * Coinciden 1:1 con los enums de prisma/schema.prisma.
 */
export type EventType =
  | "NFC_READ"
  | "QR_READ"
  | "GOOGLE_CLICK"
  | "WHATSAPP_CLICK"
  | "INSTAGRAM_CLICK"
  | "FACEBOOK_CLICK"
  | "WEBSITE_CLICK";

export type TagStatus = "ACTIVE" | "INACTIVE";
export type Role = "ADMIN" | "CLIENT";
