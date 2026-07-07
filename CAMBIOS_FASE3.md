# Fase 3 — Dashboard profesional

## Qué cambió respecto a Fase 2

Solo se **agregaron/reemplazaron** archivos. Tu base de datos y config no cambian.

### Archivos nuevos
- `src/lib/analytics.ts` — consultas de métricas (series diarias, canales, eventos recientes)
- `src/lib/types.ts` — tipos compartidos (EventType, etc.)
- `src/components/StatCard.tsx` — tarjetas de métrica
- `src/components/TrendChart.tsx` — gráfico de líneas (lecturas vs clics, 30 días)
- `src/components/ChannelBars.tsx` — distribución de clics por canal
- `src/components/EventsTable.tsx` — tabla de actividad reciente

### Archivos reemplazados
- `src/app/(admin)/dashboard/page.tsx` — dashboard con gráfico + canales + eventos
- `src/app/(admin)/dashboard/businesses/[id]/page.tsx` — analytics por negocio
- `src/app/(admin)/dashboard/businesses/page.tsx` — tipado
- `src/components/BusinessForm.tsx` — tipado sin dependencia de @prisma/client

## Cómo actualizar en tu Mac

Opción simple: descomprime este ZIP encima de tu carpeta actual (reemplaza archivos).

```bash
cd ~/Desktop/reviewtap
# (con el servidor detenido: Ctrl+C)
npm run dev
```

No necesitas migrar la BD (el schema no cambió). Solo recarga el navegador.

## Novedades visuales

- **Gráfico de actividad** de los últimos 30 días (lecturas azul, clics verde)
- **Clics por canal** con barras de porcentaje (Google/WhatsApp/IG/FB/Web)
- **Tabla de actividad reciente** con badges por tipo de evento y dispositivo
- Tarjeta de **conversión destacada** con degradado
- Todo responsive y mobile-friendly

Para ver datos en los gráficos, genera algunas lecturas escaneando el QR
y haciendo clic en los botones de la página pública.
