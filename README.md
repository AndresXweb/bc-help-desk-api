# bc-help-desk-api — Semana 02

API REST con Express 5 + TypeScript para gestión de tickets de soporte técnico.

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

```ts
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  agentId?: string; // agente asignado, opcional
}
```

## Endpoints

| Método | Ruta                  | Descripción                 | Status       |
|--------|-----------------------|------------------------------|--------------|
| GET    | `/api/v1/tickets`     | Listar todos los tickets     | 200          |
| GET    | `/api/v1/tickets/:id` | Obtener un ticket por ID     | 200 / 404    |
| POST   | `/api/v1/tickets`     | Crear un nuevo ticket        | 201 / 400    |
| PUT    | `/api/v1/tickets/:id` | Actualizar un ticket         | 200 / 404    |
| DELETE | `/api/v1/tickets/:id` | Eliminar un ticket           | 204 / 404    |
| GET    | `/health`             | Health check                 | 200          |

## Middlewares (en orden)

1. `express.json()` — parseo de body
2. Logger personalizado — imprime método, ruta, status code y duración en ms
3. Rutas de `/api/v1/tickets`
4. Handler 404 — rutas no encontradas
5. Error handler global (4 parámetros) — centraliza los errores lanzados con `next(new HttpError(status, mensaje))`

## Validación

`POST /api/v1/tickets` exige `title`, `description`, `status` y `priority`. Si falta alguno, responde `400` con el detalle de los campos faltantes.

## Cómo correr

```bash
pnpm install
pnpm dev              # levanta con recarga automática en localhost:3000
pnpm build             # verifica TypeScript estricto
pnpm start              # corre la versión compilada
```

El store vive en memoria — arranca con 2 tickets de ejemplo y se reinicia cada vez que se reinicia el servidor (a partir de la semana 05 se conecta a base de datos).

## Pruebas con curl

```bash
curl http://localhost:3000/api/v1/tickets

curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"No llegan correos","description":"El usuario no recibe correos externos","status":"open","priority":"medium","agentId":"AGT-13"}'

curl http://localhost:3000/api/v1/tickets/1

curl -X PUT http://localhost:3000/api/v1/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"closed"}'

curl -X DELETE http://localhost:3000/api/v1/tickets/1
# Esperado: 204 sin body
```

## Decisiones de diseño

- Se usó una clase `HttpError` con `statusCode` para lanzar errores desde las rutas con `next(err)` y formatearlos en un único lugar (el error handler global), en vez de repetir `res.status(...)` disperso.
- El store arranca con 2 tickets de ejemplo para poder probar `GET`, `PUT` y `DELETE` sin depender de haber creado datos antes.
- `agentId` es opcional porque un ticket puede crearse sin agente asignado todavía.
