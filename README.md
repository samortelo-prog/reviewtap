# ReviewTap

SaaS de tarjetas NFC inteligentes para conseguir reseñas de Google.

## Stack
Next.js 15 · React 19 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Auth.js v5 · Railway

## Desarrollo local

```bash
cp .env.example .env      # completa DATABASE_URL y AUTH_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

Abre http://localhost:3000/register y crea la primera cuenta (será ADMIN).
Luego pon `ALLOW_REGISTER="false"` en `.env`.

## Deploy en Railway (resumen)

1. Crea proyecto en Railway → agrega servicio **PostgreSQL**.
2. Agrega servicio desde tu repo de GitHub.
3. Variables del servicio web:
   - `DATABASE_URL` → referencia a `${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET` → `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_URL` → tu dominio (ej. `https://reviewtap.up.railway.app`)
   - `AUTH_TRUST_HOST` → `true`
   - `ALLOW_REGISTER` → `true` (solo la primera vez)
4. El `railway.json` ya ejecuta `prisma migrate deploy` en cada arranque.
5. Genera la migración inicial localmente y súbela al repo:
   `npx prisma migrate dev --name init`

## Flujo NFC

Cada tarjeta tiene una URL corta tipo `https://tudominio.com/r/negocio?t=RT-0001`
que cabe en un chip **NTAG213** (144 bytes). Grábala con la app *NFC Tools* (Android/iOS).

- Lectura NFC → se registra `NFC_READ`
- Escaneo QR → `QR_READ` (el QR agrega `&src=qr`)
- Clic en reseña → `/go/RT-0001?to=google` registra `GOOGLE_CLICK` y redirige

Documentación completa (manuales, guía NFC, mantenimiento) llega en la Fase 5.
