# bc-help-desk-api — Semana 04

API REST con Express 5 + TypeScript para gestión de tickets de soporte técnico, con **arquitectura en 4 capas**, **validación con Zod**, **errores estructurados con `AppError`** y **logging profesional con Winston + Morgan**.

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

```ts
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  agentId?: string;        // agente asignado, opcional
  estimatedHours: number;  // horas estimadas para resolver el ticket
  createdAt: string;
}
```

## Validación (Zod) — `src/schemas/ticket.schema.ts`

| Campo | Validación |
|---|---|
| `title` | string, mínimo 3 caracteres, obligatorio |
| `description` | string, no vacío, obligatorio |
| `status` | enum `open \| in_progress \| closed`, obligatorio |
| `priority` | enum `low \| medium \| high`, obligatorio |
| `agentId` | string, opcional |
| `estimatedHours` | número positivo, opcional (default `1`) |

`updateTicketSchema` reutiliza `createTicketSchema.partial()` — todos los campos opcionales para actualizaciones parciales. Los tipos `CreateTicketDto`/`UpdateTicketDto` se infieren con `z.infer<>`, así el schema es la única fuente de verdad.

El parámetro `:id` de las rutas se valida por separado con `z.coerce.number().int().positive()`.

## Arquitectura

```
src/
├── app.ts                     # Express + orden de middlewares
├── server.ts                  # entry point + graceful shutdown + logger.info
├── types.ts                   # Ticket + contratos de respuesta
├── config/
│   └── logger.ts              # Winston + stream de Morgan
├── errors/
│   └── app-error.ts           # AppError: statusCode, isOperational
├── middlewares/
│   ├── notFound.ts            # 404 → AppError, antes del errorHandler
│   └── errorHandler.ts        # 4 parámetros: ZodError / AppError / genérico
├── schemas/
│   └── ticket.schema.ts       # createTicketSchema, updateTicketSchema
├── routes/
│   └── tickets.routes.ts
├── controllers/
│   └── tickets.controller.ts  # thin: valida con Zod → llama service → responde
├── services/
│   └── tickets.service.ts     # paginación, lanza AppError(404) si no existe
└── repositories/
    └── tickets.repository.ts  # único acceso al store, copias defensivas
```

## Manejo de errores

`errorHandler` (4 parámetros, único middleware al final de `app.ts`) distingue:
- **`ZodError`** → 400 con `issues[]` (defensivo, por si se usa `.parse()` en vez de `.safeParse()`)
- **`AppError`** → su propio `statusCode`, se registra con `logger.warn`
- **Error genérico** → 500, stack visible solo si `NODE_ENV !== 'production'`, se registra con `logger.error`

## Logging

- **Winston** (`src/config/logger.ts`): nivel `http` en desarrollo / `warn` en producción; formato coloreado en dev, JSON en producción; archivo `logs/error.log` solo en producción.
- **Morgan** integrado vía stream a `logger.http()` — cada petición queda registrada.
- `console.log` reemplazado por `logger.*` en todo el proyecto.

## Endpoints

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/api/v1/tickets` | Listar con paginación `?page&limit` | 200 |
| GET | `/api/v1/tickets/:id` | Obtener por ID | 200 / 400 / 404 |
| POST | `/api/v1/tickets` | Crear (valida con Zod) | 201 / 400 |
| PUT | `/api/v1/tickets/:id` | Actualizar parcial (valida con Zod) | 200 / 400 / 404 |
| DELETE | `/api/v1/tickets/:id` | Eliminar | 204 / 400 / 404 |
| GET | `/health` | Health check | 200 |

## Cómo correr

```bash
pnpm install
pnpm dev              # localhost:3000, con recarga automática
pnpm build             # compila TypeScript en modo estricto
pnpm start              # corre la versión compilada
```

## Pruebas con curl

```bash
curl "http://localhost:3000/api/v1/tickets?page=1&limit=2"

curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"No enciende el monitor","description":"Monitor de sala de juntas","status":"open","priority":"medium","agentId":"AGT-15"}'

# Body inválido → 400 con issues[]
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" -d '{"title":"a"}'

# id no numérico → 400
curl http://localhost:3000/api/v1/tickets/abc

# id inexistente → 404 (AppError)
curl http://localhost:3000/api/v1/tickets/999

# ruta inexistente → 404 JSON
curl http://localhost:3000/ruta-inexistente
```

## Decisiones de diseño

- **`estimatedHours`** se agregó como campo numérico del dominio (horas estimadas para resolver el ticket) para poder aplicar `.positive()` de forma coherente — Help Desk no tenía un campo numérico natural como "precio" en otros dominios.
- Los DTOs (`CreateTicketDto`/`UpdateTicketDto`) ya no se definen a mano en `types.ts`: se infieren con `z.infer<>` desde el schema de Zod, para no duplicar la fuente de verdad.
- El **service** ahora lanza `AppError(404, ...)` en vez de retornar `undefined` (a diferencia de la semana 03) — así el controller queda más simple y el 404 se resuelve de forma centralizada en el `errorHandler`.
- `notFound` se registra como middleware de 3 parámetros (no error handler) que construye un `AppError(404, ...)` y lo pasa con `next()`, reutilizando el mismo `errorHandler` para todos los 404 — de ruta o de recurso.
