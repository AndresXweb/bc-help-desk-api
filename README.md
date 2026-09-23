# bc-help-desk-api — Semana 09: Testing

API REST del dominio **Help Desk** (recurso principal `Ticket`) con autenticación JWT, RBAC, capas de seguridad y **suite completa de tests** (Jest + Supertest + mongodb-memory-server).

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`.

```ts
interface Ticket {
  code: string;            // único, formato TKT-1234
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  agentId?: string;
  active: boolean;
  createdBy: string;       // ID del usuario que lo creó
}
```

## Roles y permisos

| Rol | Puede |
|---|---|
| `user` | Ver todos los tickets, crear tickets, editar **solo los propios** |
| `admin` | Todo lo de `user`, además editar cualquier ticket y **eliminar** tickets |

Ninguna ruta de `Ticket` es pública: todas requieren `authMiddleware`; `DELETE` exige además `requireRole('admin')`.

## Endpoints

| Método | Ruta | Acceso | Status |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Público | 201 / 400 / 409 |
| POST | `/api/v1/auth/login` | Público (rate-limited: 5/15min) | 200 / 401 |
| POST | `/api/v1/auth/refresh` | Cookie refresh | 200 / 401 |
| POST | `/api/v1/auth/logout` | Autenticado | 200 |
| GET | `/api/v1/auth/me` | Autenticado | 200 / 401 |
| GET | `/api/v1/users/dashboard` | Autenticado | 200 |
| GET | `/api/v1/tickets` | Autenticado | 200 |
| GET | `/api/v1/tickets/:id` | Autenticado | 200 / 404 |
| POST | `/api/v1/tickets` | Autenticado | 201 / 400 / 401 / 409 |
| PATCH | `/api/v1/tickets/:id` | Dueño o admin | 200 / 403 / 404 |
| DELETE | `/api/v1/tickets/:id` | **Solo admin** | 200 / 403 / 404 |
| GET | `/api/v1/health` | Público | 200 |

## Cómo correr la API (desarrollo)

```bash
pnpm install
cp .env.example .env
# Genera dos secretos DISTINTOS:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# Pégalos en JWT_ACCESS_SECRET y JWT_REFRESH_SECRET
# Configura MONGODB_URI (Atlas o local)
pnpm dev
```

## Testing (entregable Semana 09)

Suite con **Jest + ts-jest** (unit tests con mocks) y **Supertest + mongodb-memory-server** (integration tests sin base de datos real).

```bash
pnpm install
# .env.test ya incluido (o cópialo desde .env.example y ajusta)
pnpm test              # toda la suite
pnpm test:watch        # modo watch
pnpm test:coverage     # cobertura → coverage/index.html
```

### Archivos de test

| Archivo | Tipo | Qué cubre |
|---|---|---|
| `src/__tests__/auth.service.test.ts` | Unit | `register`, `login`, `getMe`, `refreshTokens`, `logout` — repo mockeado con `jest.mock()` |
| `src/__tests__/ticket.service.test.ts` | Unit | `findAll`, `findById`, `create`, `update`, `remove` — modelo `Ticket` mockeado |
| `src/__tests__/auth.integration.test.ts` | Integration | Auth HTTP: register, login, me, refresh, logout + health |
| `src/__tests__/ticket.integration.test.ts` | Integration | CRUD tickets + 403 DELETE sin admin / 200 con admin |
| `src/__tests__/user.integration.test.ts` | Integration | `GET /users/dashboard` |

### Umbrales de cobertura (`jest.config.ts`)

- statements ≥ 80%
- branches ≥ 70%
- functions ≥ 80%
- lines ≥ 80%

`pnpm test:coverage` debe terminar sin error (umbrales cumplidos).

### Notas de implementación

- `src/app.ts` exporta `{ app }` **sin** `listen()` — Supertest usa la app directamente.
- `src/__tests__/setup.ts` carga `.env.test` y define secrets JWT antes de importar módulos.
- Rate limiters se desactivan con `NODE_ENV=test` para no fallar por 429 en la suite.
- Admins en integration tests: se insertan con el modelo `User` (el register público solo crea `role: 'user'`).
- `moduleNameMapper` en Jest resuelve imports con extensión `.js` hacia archivos `.ts`.
- Unit tests **no** usan Mongo real: dependen de `jest.mock()`.
- Integration tests usan **mongodb-memory-server** (no Atlas).

## Capas de seguridad (heredadas de semanas previas)

1. Helmet
2. Rate limiting (global + auth)
3. CORS con whitelist
4. Sanitización anti-NoSQL
5. Validación Zod
6. RBAC (`authMiddleware` + `requireRole`)
7. Errores sin fuga de stack en producción

## Stack

- Node.js ≥ 22, Express 5, TypeScript
- MongoDB + Mongoose
- Zod, JWT, bcrypt
- Jest, ts-jest, Supertest, mongodb-memory-server
