# bc-help-desk-api

Entrega de la semana 01 — bootcamp `bc-expressjs`.

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

Entidades del dominio:
- **Ticket**: `id`, `title`, `status` (`open` / `in_progress` / `closed`), `agentId`, `categoryId`, `createdAt`, `resolution?`
- **Agent**: agente que atiende el ticket
- **Category**: categoría del ticket (red, hardware, software, cuentas, correo)
- **Resolution**: detalle de cómo y cuándo se cerró un ticket (`resolvedAt`)

## Qué hace el proyecto

Lee `data/tickets.json`, procesa los tickets y genera un reporte en
`output/report.json` con:

- Total de tickets, cerrados y abiertos/en progreso
- Tiempo de resolución: promedio, ticket más rápido y más lento (calculado
  entre `createdAt` y `resolution.resolvedAt`)
- Detalle de resoluciones aplicadas

Acepta un filtro opcional por categoría. Si la categoría no existe, muestra
un aviso y lista las categorías disponibles en lugar de fallar.

## Cómo correr

```bash
pnpm install
pnpm dev                          # procesa todos los tickets
pnpm dev -- --category CAT-NET    # filtra por categoría
pnpm build                        # verifica TypeScript estricto
pnpm start                        # corre la versión compilada (dist/)
```

Categorías disponibles en los datos de ejemplo: `CAT-NET`, `CAT-HW`,
`CAT-ACC`, `CAT-SW`, `CAT-EMAIL`.

## Manejo de errores

- Si `data/tickets.json` no existe o no se puede leer, el script muestra un
  error descriptivo y termina con `process.exit(1)`.
- Si `--category` no coincide con ninguna categoría existente, se muestra
  una advertencia con las categorías disponibles (el proceso no falla).
