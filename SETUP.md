# ReviewTap — Guía de instalación local

## 1. Descarga y extracción

Descarga `reviewtap-fase2.zip` desde los archivos de la conversación.

En tu Mac, en Terminal:

```bash
# Ve a la carpeta donde descargaste el ZIP
cd ~/Downloads

# Descomprímelo
unzip reviewtap-fase2.zip

# Entra en la carpeta del proyecto
cd reviewtap
```

Verifica que ves esta estructura:
```
reviewtap/
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
└── ...
```

Si no ves `prisma/schema.prisma`, **NO DESCOMPRIMISTE BIEN**. Asegúrate de estar en `/reviewtap`, no en `/reviewtap/reviewtap`.

## 2. Base de datos PostgreSQL

### Opción A: Docker (recomendado, no requiere instalación)

Abre otra terminal y ejecuta:

```bash
docker run -d \
  --name reviewtap-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=reviewtap \
  -p 5432:5432 \
  postgres:16
```

Este comando crea una base de datos local lista para usar.

### Opción B: PostgreSQL local

Si ya tienes PostgreSQL instalado:

```bash
createdb -U postgres reviewtap
```

## 3. Configuración del proyecto

En la carpeta `reviewtap/`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` con tu editor favorito y reemplaza:

```
DATABASE_URL="postgresql://postgres:password123@localhost:5432/reviewtap"
AUTH_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOW_REGISTER="true"
AUTH_TRUST_HOST="false"
```

**Nota importante:** El `openssl rand -base64 32` genera un string aleatorio. Cópialo y pégalo tal cual, no ejecutes el comando dentro del archivo.

## 4. Instalación e inicio

En la carpeta `reviewtap/`:

```bash
# Instala dependencias (toma ~1-2 min)
npm install

# Crea la base de datos con las tablas
npx prisma migrate dev --name init

# Inicia el servidor de desarrollo
npm run dev
```

Abre en tu navegador: **http://localhost:3000**

Te redirigirá a `/register`. Crea la primera cuenta (será ADMIN).

## 5. Primeros pasos en la app

- **Email**: cualquiera (ej: `admin@local.test`)
- **Contraseña**: mínimo 8 caracteres

Una vez dentro:

1. Ve a **Negocios** → **+ Nuevo negocio**
2. Llena el formulario (nombre, categoría, Google Review URL)
3. Se crea automáticamente una **tarjeta NFC** con código `RT-0001`
4. Descarga el QR (PNG o SVG)
5. Prueba la página pública: `http://localhost:3000/r/nombre-negocio`

## 6. Lectura NFC local

Como aún no tienes tarjetas NFC físicas, prueba con QR:

1. Escanea el QR con tu celular
2. Se registra automáticamente como `QR_READ` en el dashboard
3. Haz clic en "⭐ Dejar reseña en Google"
4. Se registra como `GOOGLE_CLICK`

Entra a **Dashboard** y ve las métricas en tiempo real.

## 7. Detener el servidor

En la terminal donde corre `npm run dev`, presiona **Ctrl+C**.

## Troubleshooting

### Error: "database does not exist"
→ Ejecuta `npx prisma migrate dev --name init` de nuevo

### Error: "connection refused"
→ Verifica que PostgreSQL está corriendo (Docker debe estar activo o PG debe estar iniciado)

### Error: "Cannot find module '@prisma/client'"
→ Ejecuta `npm install` de nuevo

### La página pública `/r/slug` devuelve 404
→ Asegúrate de estar en `http://localhost:3000/r/...` (el nombre del negocio se convierte a slug)

---

**¿Listo?** Sigue a Fase 3 donde hacemos el dashboard profesional con gráficos y design estilo Stripe.
