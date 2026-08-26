# Evidencia de pruebas — Semana 05

Capturas de la API funcionando contra PostgreSQL real (Neon), vía Thunder Client / VS Code.

| Archivo | Qué muestra |
|---|---|
| `EvidenciaPNPMRUN.PNG` | `pnpm dev` levantando el servidor conectado a Postgres |
| `EvidenciaGET.PNG` | `GET /api/v1/tickets` — listado paginado con `category` incluida |
| `EvidenciaGETPORID.PNG` | `GET /api/v1/tickets/:id` — detalle con relación |
| `EvidenciaPOST.PNG` | `POST /api/v1/tickets` válido → 201 |
| `EvidenciaPOST400.PNG` | `POST /api/v1/tickets` con body inválido → 400 (Zod) |
| `EvidenciaPOSTYA.PNG` | `POST /api/v1/tickets` con `code` duplicado → 409 (`P2002`) |
| `EvidenciaPUT.PNG` | `PUT /api/v1/tickets/:id` → 200 |
| `EvidenciaDELETE.PNG` / `EvidenciaDELETEfuncionando.PNG` | `DELETE /api/v1/tickets/:id` → 204, y el listado reflejando el borrado |
