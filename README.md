# bc-help-desk-api — Semana 05

API REST con Express 5 + TypeScript + **PostgreSQL + Prisma ORM** para gestión de tickets de soporte técnico.

Arquitectura en 4 capas, validación con Zod, errores estructurados con AppError y logging con Winston + Morgan.

## Dominio

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

### Diagrama de entidades

```
Category (1) ──────── (N) Ticket
   │                      │
   ├── id (UUID PK)       ├── id (UUID PK)
   ├── name (unique)      ├── title
   ├── description?       ├── description
   ├── createdAt          ├── status (open|in_progress|closed)
   └── updatedAt          ├── priority (low|medium|high)
                          ├── estimatedHours
                          ├── agentId?
                          ├── categoryId? (FK → Category)
                          ├── createdAt
                          └── updatedAt
```

Relación **1:N**: una Category tiene muchos Tickets. La FK `categoryId` es opcional (`onDelete: SetNull`).

## Requisitos previos

- Node.js ≥ 22
- Docker (para PostgreSQL)
- pnpm

## Cómo correr

```bash
# 1. Levantar PostgreSQL
docker compose up -d

# 2. Instalar dependencias
pnpm install

# 3. Variables de entorno
cp .env.example .env

# 4. Migraciones
pnpm dlx prisma migrate dev --name init

# 5. Seed (datos demo)
pnpm dlx prisma db seed

# 6. Servidor en desarrollo
pnpm dev
```

## Endpoints

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/tickets` | Listado paginado (`?page=1&limit=10`) | 200 |
| GET | `/api/v1/tickets/:id` | Detalle con relación `category` | 200 / 404 |
| POST | `/api/v1/tickets` | Crear (valida con Zod) | 201 / 400 / 409 |
| PUT | `/api/v1/tickets/:id` | Actualizar parcial | 200 / 400 / 404 |
| DELETE | `/api/v1/tickets/:id` | Eliminar | 204 / 404 |
| GET | `/health` | Health check | 200 |

### Ejemplo de respuesta paginada

```json
{
  "data": [
    {
      "id": "3f1a9c2e-5b7d-4e81-9a6f-2c8d0b4e7a15",
      "title": "Fallo en conexión VPN",
      "description": "...",
      "status": "open",
      "priority": "high",
      "estimatedHours": 2,
      "agentId": "AGT-10",
      "categoryId": "...",
      "category": {
        "id": "...",
        "name": "Red",
        "description": "Problemas de conectividad..."
      },
      "createdAt": "2026-07-20T09:00:00.000Z",
      "updatedAt": "2026-07-20T09:00:00.000Z"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 10
}
```

### Ejemplos curl

```bash
# Listar
curl "http://localhost:3000/api/v1/tickets?page=1&limit=2"

# Crear
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "No enciende el monitor",
    "description": "Monitor de sala de juntas",
    "status": "open",
    "priority": "medium",
    "agentId": "AGT-15",
    "estimatedHours": 1.5
  }'

# ID inexistente → 404
curl http://localhost:3000/api/v1/tickets/00000000-0000-4000-8000-000000000000

# Body inválido → 400
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"a"}'
```

## Manejo de errores Prisma

| Código Prisma | HTTP | Mensaje |
|---------------|------|---------|
| `P2025` | 404 | Ticket no encontrado |
| `P2002` | 409 | Ya existe un registro con ese valor único |
| `P2003` | 400 | La categoría indicada no existe |

Todos pasan por el `errorHandler` de la semana 04.

## Arquitectura

```
src/
├── lib/prisma.ts              # Singleton PrismaClient
├── config/logger.ts           # Winston + Morgan
├── errors/app-error.ts        # AppError
├── middlewares/
│   ├── errorHandler.ts
│   └── notFound.ts
├── schemas/ticket.schema.ts   # Zod
├── repositories/tickets.repository.ts  # Prisma CRUD + errores
├── services/tickets.service.ts
├── controllers/tickets.controller.ts
├── routes/tickets.routes.ts
├── app.ts
└── server.ts

prisma/
├── schema.prisma
├── seed.ts
└── migrations/                # versionadas en el repo
```

## Decisiones de diseño

- **UUID** como PK en todos los modelos (convención del bootcamp).
- **Category** como recurso secundario con relación 1:N y campo `@unique` (`name`) para demostrar `P2002`.
- Tipos de dominio derivados de Prisma Client (no se duplican interfaces).
- Paginación con `skip` / `take` + `count` en paralelo (`Promise.all`).
- `include: { category: true }` para evitar el problema N+1.
- Seed idempotente: categorías con `upsert`, tickets solo si la tabla está vacía.

## Logs del seed

```
🌱 Iniciando seed...
  ✓ Category: Red
  ✓ Category: Hardware
  ✓ Category: Software
  ✓ Category: Cuentas
  ✓ Category: Correo
  ✓ Ticket: Fallo en conexión VPN
  ✓ Ticket: Impresora de red no responde
  ✓ Ticket: Correo no sincroniza en el celular
  ✓ Ticket: Laptop muy lenta al iniciar
  ✓ Ticket: Solicitud de restablecimiento de contraseña
  ✓ Ticket: Error al instalar Adobe Acrobat
✅ Seed completado.
```
