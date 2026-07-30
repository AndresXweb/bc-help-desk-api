# Evidencia de pruebas — Semana 02

Pruebas de los 5 endpoints CRUD de `/api/v1/tickets`, ejecutadas con el servidor corriendo localmente (`pnpm dev`).

| Captura | Endpoint | Resultado |
|---|---|---|
| `01-get-tickets.png` | `GET /api/v1/tickets` | 200 — lista los 2 tickets de ejemplo |
| `02-post-ticket.png` | `POST /api/v1/tickets` | 201 — crea el ticket con `id: 3` |
| `03-put-ticket.png` | `PUT /api/v1/tickets/3` | 200 — actualiza `status` a `in_progress`, conserva el resto de campos |
| `04-delete-ticket.png` | `DELETE /api/v1/tickets/3` | 204 — sin body en la respuesta |

Las pruebas de `POST`, `PUT` y `DELETE` se hicieron con Thunder Client (VS Code). En la terminal de cada captura se ve además el log del middleware personalizado (método, ruta, status y duración).
