# bc-help-desk-api — Semana 03

API REST con Express 5 + TypeScript para gestión de tickets de soporte técnico, aplicando **arquitectura en 4 capas** (`routes → controllers → services → repositories`) con contratos de respuesta tipados.

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

```ts
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  agentId?: string;   // agente asignado, opcional
  createdAt: string;
}
```

## Arquitectura

```
src/
├── app.ts                          # configuración Express (health, router, error handler)
├── server.ts                       # entry point + graceful shutdown
├── types.ts                        # Ticket, DTOs y contratos de respuesta
├── errors/
│   └── app-error.ts                # error de dominio con statusCode (sin dependencia de Express)
├── routes/
│   └── tickets.routes.ts           # solo mapea URL + método → controller
├── controllers/
│   └── tickets.controller.ts       # thin controllers: extraer → llamar service → responder
├── services/
│   └── tickets.service.ts          # paginación + validaciones de dominio, sin imports de Express
└── repositories/
    └── tickets.repository.ts       # único punto de acceso al store, copias defensivas
```

Regla de dependencia: `routes → controllers → services → repositories`. Ninguna capa salta a otra que no sea la inmediatamente inferior.

## Endpoints

| Método | Ruta                     | Descripción                            | Status       |
|--------|--------------------------|-----------------------------------------|--------------|
| GET    | `/api/v1/tickets`        | Listar con paginación `?page&limit`     | 200          |
| GET    | `/api/v1/tickets/:id`    | Obtener un ticket por ID                | 200 / 404    |
| POST   | `/api/v1/tickets`        | Crear un nuevo ticket                   | 201 / 400    |
| PUT    | `/api/v1/tickets/:id`    | Actualizar un ticket existente          | 200 / 400 / 404 |
| DELETE | `/api/v1/tickets/:id`    | Eliminar un ticket                      | 204 / 404    |
| GET    | `/health`                | Health check                            | 200          |

## Contratos de respuesta

```json
// GET /api/v1/tickets?page=1&limit=2 → 200
{ "data": [ { "id": 1, "...": "..." } ], "total": 5, "page": 1, "limit": 2 }

// GET /api/v1/tickets/1 → 200
{ "data": { "id": 1, "title": "Fallo en conexión VPN", "...": "..." } }

// POST /api/v1/tickets → 201
{ "data": { "id": 6, "...": "..." } }

// GET /api/v1/tickets/999 → 404
{ "error": "Not Found", "message": "Ticket 999 not found" }

// POST /api/v1/tickets (campos faltantes) → 400
{ "error": "Bad Request", "message": "Faltan campos requeridos: description, status, priority" }
```

## Validaciones de dominio (capa service)

- `POST` exige `title`, `description`, `status` y `priority`. Si falta alguno → `400`.
- `status` debe ser uno de `open | in_progress | closed`; `priority` uno de `low | medium | high` → si no, `400`.
- `PUT` sobre un ticket inexistente → `404` (no valida el body si el recurso no existe).
- `agentId` es opcional porque un ticket puede crearse sin agente asignado todavía.

## Cómo correr

```bash
pnpm install
pnpm dev              # levanta con recarga automática en localhost:3000
pnpm build             # compila TypeScript en modo estricto
pnpm start              # corre la versión compilada
```

El store vive en memoria — arranca con 5 tickets de ejemplo y se reinicia cada vez que se reinicia el servidor (a partir de la semana 05 se conecta a base de datos).

## Pruebas con curl

```bash
curl http://localhost:3000/api/v1/tickets?page=1&limit=2

curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"No enciende el monitor","description":"El monitor de sala de juntas no enciende","status":"open","priority":"medium","agentId":"AGT-15"}'

curl http://localhost:3000/api/v1/tickets/1

curl -X PUT http://localhost:3000/api/v1/tickets/6 \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

curl -X DELETE http://localhost:3000/api/v1/tickets/6
# Esperado: 204 sin body
```

## Decisiones de diseño

- **`AppError`** centraliza los errores con `statusCode` (400 de validación, 500 inesperados) sin que el service dependa de Express, cumpliendo la regla de la capa.
- Los **404** (recurso no encontrado) se resuelven directamente en el controller comparando el resultado del service contra `undefined`/`false`, en vez de lanzar una excepción — así el flujo "no encontrado" queda explícito en la capa HTTP, tal como pide la arquitectura de la semana.
- El **repository** siempre retorna copias (`{ ...item }` / `[...store]`) para que nadie fuera de esa capa pueda mutar el store por referencia.
- Se reutilizó el mismo dominio Help Desk de las semanas 01–02 para mantener coherencia en el proyecto trimestral, ahora reestructurado en capas.
