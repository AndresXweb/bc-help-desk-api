# bc-help-desk-api — Semana 06

API REST con **Express 5 + TypeScript + MongoDB + Mongoose** para gestión de tickets de soporte técnico.

Arquitectura en **4 capas**, validación con **Zod**, errores con **AppError**, logging con **Winston + Morgan**.

---

## Dominio

**Soporte técnico / Help Desk**

- Principal: `Ticket` (referencia `category: ObjectId`)
- Secundaria: `Category` (CRUD propio, sin refs)

```
Category (1) ──────────────────────── (N) Ticket
   │                                      │
   ├── _id (ObjectId)                     ├── _id (ObjectId)
   ├── name (unique)                      ├── code (unique)  ← TKT-1001
   ├── description?                       ├── title
   ├── createdAt                          ├── description
   └── updatedAt                          ├── status (open | in_progress | closed)
                                          ├── priority (low | medium | high)
                                          ├── estimatedHours
                                          ├── agentId?
                                          ├── category (ObjectId → Category)
                                          ├── createdAt
                                          └── updatedAt
```

Relación por **referencia** (`ObjectId` + `ref: 'Category'`). Los GET de tickets usan `.populate('category')`.

---

## Requisitos previos

- Node.js ≥ 22
- pnpm
- Docker Desktop **o** cuenta de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)

---

## Cómo correr

### Opción A — Docker (oficial del bootcamp)

```bash
docker compose up -d
pnpm install
cp .env.example .env
pnpm seed
pnpm dev
```

`.env` local:

```env
MONGODB_URI=mongodb://bootcamp:bootcamp123@localhost:27017/bootcamp_dev?authSource=admin
PORT=3000
NODE_ENV=development
```

### Opción B — MongoDB Atlas (si Docker no arranca)

1. Crea un cluster gratis en Atlas.
2. Network Access → Allow Access from Anywhere (`0.0.0.0/0`) para desarrollo.
3. Database Access → usuario/password.
4. Connect → Drivers → copia la URI.

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/bootcamp_dev?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

```bash
pnpm install
cp .env.example .env   # pega la URI de Atlas
pnpm seed
pnpm dev
```

Nunca hardcodear `MONGODB_URI` en el código.

Otros comandos:

```bash
pnpm build
pnpm start
```

---

## Endpoints

### Tickets (principal + populate)

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/tickets` | Listado paginado + `populate` | 200 |
| GET | `/api/v1/tickets/:id` | Detalle + `populate` | 200 / 400 / 404 |
| POST | `/api/v1/tickets` | Crear (Zod + ObjectId de category) | 201 / 400 / 409 |
| PUT | `/api/v1/tickets/:id` | Actualizar parcial | 200 / 400 / 404 / 409 |
| DELETE | `/api/v1/tickets/:id` | Eliminar | 204 / 400 / 404 |

### Categories (secundaria, CRUD completo)

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/categories` | Listar todas | 200 |
| GET | `/api/v1/categories/:id` | Detalle | 200 / 400 / 404 |
| POST | `/api/v1/categories` | Crear | 201 / 400 / 409 |
| PUT | `/api/v1/categories/:id` | Actualizar | 200 / 400 / 404 / 409 |
| DELETE | `/api/v1/categories/:id` | Eliminar | 204 / 400 / 404 |

### Health

`GET /health` → `{ "status": "ok", "week": "06", "project": "mongodb-mongoose", "domain": "help-desk" }`

### Paginación (tickets)

`GET /api/v1/tickets?page=1&limit=2`

```json
{
  "data": [
    {
      "_id": "68b4c1a2e8f1a2b3c4d5e6f7",
      "code": "TKT-1006",
      "title": "Error al instalar Adobe Acrobat",
      "status": "in_progress",
      "priority": "medium",
      "category": {
        "_id": "68b4c1a2e8f1a2b3c4d5e6f0",
        "name": "Software",
        "description": "Aplicaciones, sistemas operativos, licencias"
      }
    }
  ],
  "total": 6,
  "page": 1,
  "totalPages": 3
}
```

Nota: el contrato de esta semana es `{ data, total, page, totalPages }` (ya no `limit` en el JSON).

---

## Ejemplos curl

Primero lista categorías para copiar un `_id`:

```bash
curl http://localhost:3000/api/v1/categories
```

```bash
# Listar tickets (populate)
curl "http://localhost:3000/api/v1/tickets?page=1&limit=2"

# Crear ticket — reemplaza CATEGORY_ID
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TKT-2001",
    "title": "No enciende el monitor",
    "description": "Monitor de sala de juntas",
    "status": "open",
    "priority": "medium",
    "agentId": "AGT-15",
    "estimatedHours": 1.5,
    "category": "CATEGORY_ID"
  }'

# 409 — code duplicado
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TKT-1001",
    "title": "Duplicado",
    "description": "Mismo code del seed",
    "status": "open",
    "priority": "low",
    "category": "CATEGORY_ID"
  }'

# 400 — ObjectId inválido (CastError / Zod)
curl http://localhost:3000/api/v1/tickets/abc123

# 404 — ObjectId válido que no existe
curl http://localhost:3000/api/v1/tickets/000000000000000000000000
```

---

## Errores Mongo / Mongoose

| Caso | HTTP | Mensaje |
|------|------|---------|
| Código `11000` (unique: `code` o `name`) | 409 | El campo ya está registrado |
| `CastError` (id mal formado) | 400 | ID inválido |
| `findById` / update / delete → `null` | 404 | Recurso no encontrado |
| `category` ObjectId que no existe | 400 | La categoría indicada no existe |

Todos pasan por el `errorHandler` (ZodError → 400, AppError → su status, genérico → 500).

---

## Arquitectura

```
src/
├── lib/mongoose.ts                    # connectDB() — una sola vez
├── config/logger.ts
├── errors/app-error.ts
├── middlewares/errorHandler.ts / notFound.ts
├── models/
│   ├── category.model.ts              # unique name, timestamps, validadores
│   └── ticket.model.ts                # unique code, enum, ref Category
├── schemas/                           # Zod (ObjectId = /^[0-9a-fA-F]{24}$/)
├── repositories/                      # Model + lean() + populate + 11000/CastError
├── services/                          # 404 si null
├── controllers/ / routes/
├── app.ts
├── server.ts                          # connectDB() ANTES de listen()
└── seed.ts
```

---

## Seed

```bash
pnpm seed
```

Inserta **5 categorías** y **6 tickets**. Borra colecciones y vuelve a cargar (idempotente vía `deleteMany`).

```
🌱 Iniciando seed...
  ✓ Category: Red
  ✓ Category: Hardware
  ✓ Category: Software
  ✓ Category: Cuentas
  ✓ Category: Correo
  ✓ Ticket: TKT-1001 — Fallo en conexión VPN
  ✓ Ticket: TKT-1002 — Impresora de red no responde
  ✓ Ticket: TKT-1003 — Correo no sincroniza en el celular
  ✓ Ticket: TKT-1004 — Laptop muy lenta al iniciar
  ✓ Ticket: TKT-1005 — Solicitud de restablecimiento de contraseña
  ✓ Ticket: TKT-1006 — Error al instalar Adobe Acrobat
✅ Seed completado.
```

---

## Decisiones de diseño

- `_id` de MongoDB (`ObjectId`), no UUID de Prisma.
- `Ticket.category` es referencia, no embed: una categoría se comparte entre muchos tickets.
- `.lean()` en lecturas (objetos planos, sin overhead de Document).
- `.populate('category')` en `findAll` y `findById` de tickets (evita N+1).
- Paginación: `countDocuments()` + `skip` / `limit` → `{ data, total, page, totalPages }`.
- Validadores en **Schema de Mongoose** y en **Zod** (doble capa).
- `mongoose.connect` solo en `connectDB()`, llamado desde `server.ts` y `seed.ts`.

---

## Stack

| Tecnología | Versión |
|------------|---------|
| Node.js | ≥ 22 |
| Express | 5.1.0 |
| TypeScript | 5.8.3 |
| Mongoose | 9.4.1 |
| MongoDB | 7 (Docker) / Atlas |
| Zod | 4.3.6 |
| Winston / Morgan | 3.19.0 / 1.10.1 |
