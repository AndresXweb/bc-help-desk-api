# Evidencia de pruebas — Semana 06

Capturas de Thunder Client / Postman para el entregable.

| Archivo sugerido | Endpoint | Qué debe verse |
|---|---|---|
| 01-get-tickets.png | GET /api/v1/tickets?page=1&limit=2 | 200 — `{ data, total, page, totalPages }` y `category` populada |
| 02-get-ticket-by-id.png | GET /api/v1/tickets/:id | 200 — ticket con objeto `category` |
| 03-post-ticket.png | POST /api/v1/tickets | 201 — ticket creado |
| 04-post-invalid-id.png | POST con `category` inválido (`abc123`) | 400 |
| 05-post-duplicate-code.png | POST con `code: "TKT-1001"` | 409 |
| 06-put-ticket.png | PUT /api/v1/tickets/:id | 200 |
| 07-delete-ticket.png | DELETE /api/v1/tickets/:id | 204 |
| 08-get-categories.png | GET /api/v1/categories | 200 — listado de categorías |
| 09-pnpm-dev.png | terminal | servidor + MongoDB connected |
