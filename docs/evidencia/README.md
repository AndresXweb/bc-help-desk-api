# Evidencia de pruebas — Semana 03

Este directorio debe contener las capturas pedidas en los entregables de
`3-proyecto/README.md`. Las de la semana 02 se retiraron porque
corresponden a una arquitectura distinta (sin capas, sin paginación, sin
`data` wrapper) — hay que generar capturas nuevas para semana 03.

## Checklist de capturas a agregar (Thunder Client / VS Code)

| Archivo sugerido | Endpoint | Qué debe verse |
|---|---|---|
| `01-get-tickets.png` | `GET /api/v1/tickets?page=1&limit=2` | 200 — `{ data: [...], total, page, limit }` |
| `02-get-ticket-by-id.png` | `GET /api/v1/tickets/1` | 200 — `{ data: { ... } }` |
| `03-post-ticket.png` | `POST /api/v1/tickets` | 201 — ticket creado con `id` nuevo |
| `04-put-ticket.png` | `PUT /api/v1/tickets/:id` | 200 — campos actualizados |
| `05-delete-ticket.png` | `DELETE /api/v1/tickets/:id` | 204 — sin body |
| `06-get-404.png` | `GET /api/v1/tickets/999` | 404 — `{ error: "Not Found", message: "..." }` |
| `07-pnpm-build.png` | terminal | `pnpm build` sin errores de TypeScript |

## Cómo generarlas

1. `pnpm dev` para levantar el servidor en `localhost:3000`.
2. En Thunder Client, ejecuta cada request de la tabla y captura la respuesta (status + body).
3. En terminal, corre `pnpm build` y captura la salida limpia (sin errores).
4. Guarda las imágenes aquí con los nombres sugeridos (o los que prefieras, mientras sean descriptivos).
