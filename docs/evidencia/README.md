# Evidencia de pruebas — Semana 06

Capturas de Thunder Client contra MongoDB real (Atlas), con el servidor corriendo (`pnpm dev`).

| Archivo | Qué muestra |
|---|---|
| `EvidenciaFuncionando.PNG` | `pnpm dev` — `MongoDB connected`, servidor arriba |
| `EvidenciaGET.PNG` | `GET /api/v1/tickets?page=1&limit=2` → 200, con `category` populada y paginación |
| `EvidenciaGET2.PNG` | `GET /api/v1/tickets/:id` → detalle con `category` incluida |
| `EvidenciaPOST.PNG` | `POST /api/v1/tickets` válido → 201 |
| `EvidenciaPOSTFALLA.PNG` | `POST /api/v1/tickets` con `category` inválida/inexistente → 400 |
| `EvidenciaPOSTDUPLICADO.PNG` | `POST /api/v1/tickets` con `code` repetido del seed → 409 |

El log de la terminal en las capturas muestra además toda la secuencia de pruebas (`400`, `201`, `409`), confirmando el manejo de errores de extremo a extremo.
