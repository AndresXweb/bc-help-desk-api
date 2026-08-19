# Evidencia de pruebas — Semana 04

Capturas pedidas en los entregables de `3-proyecto/README.md` (validación con Zod, `AppError` y logging).

| Archivo | Qué muestra |
|---|---|
| `CapturaPost.PNG` | `POST /api/v1/tickets` con body inválido → 400 con `issues[]` de Zod |
| `CapturaGet.PNG` | `GET /api/v1/tickets/:id` con id no numérico → 400 |
| `CapturaGET2.PNG` | `GET /api/v1/tickets/:id` con id inexistente → 404 (`AppError`) |
| `Captura3.PNG` | `GET` a una ruta inexistente → 404 en JSON (no HTML) |
| `CapturaLOGS.PNG` | Consola con los logs de Winston + Morgan (`info`/`http`/`warn`) |
