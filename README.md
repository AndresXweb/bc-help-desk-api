# bc-help-desk-api — Semana 08

API REST con **autorización RBAC** (roles `user`/`admin`) y **capas de seguridad completas** (Helmet, CORS con whitelist, rate limiting diferenciado, sanitización anti-NoSQL-injection), protegiendo el CRUD del recurso principal del dominio **Help Desk**.

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

**Decisión de diseño**: ninguna ruta de `Ticket` es pública — es un sistema interno de soporte técnico, no un catálogo público. Todas requieren sesión activa (`authMiddleware`); solo `DELETE` exige además `requireRole('admin')`.

## Endpoints

| Método | Ruta | Acceso | Status |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Público | 201 / 400 / 409 |
| POST | `/api/v1/auth/login` | Público (rate-limited: 5/15min) | 200 / 401 |
| POST | `/api/v1/auth/refresh` | Requiere cookie refresh | 200 / 401 |
| POST | `/api/v1/auth/logout` | Autenticado | 200 |
| GET | `/api/v1/users/dashboard` | Autenticado | 200 |
| GET | `/api/v1/tickets` | Autenticado | 200 |
| GET | `/api/v1/tickets/:id` | Autenticado | 200 / 404 |
| POST | `/api/v1/tickets` | Autenticado | 201 / 400 / 401 / 409 |
| PATCH | `/api/v1/tickets/:id` | Autenticado + dueño o admin | 200 / 403 / 404 |
| DELETE | `/api/v1/tickets/:id` | **Solo admin** | 200 / 403 / 404 |

## Capas de seguridad aplicadas

1. **Helmet** — cabeceras HTTP de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, CSP, etc.) en todas las respuestas.
2. **Rate limiting**:
   - Global: 100 requests / 15 min en toda la API
   - `/api/v1/auth`: 5 requests / 15 min (protección contra fuerza bruta en login)
3. **CORS con whitelist** — solo `http://localhost:5173` y `http://localhost:3001` reciben `Access-Control-Allow-Origin`; cualquier otro origen es rechazado (nunca `*`).
4. **`express-mongo-sanitize`** — limpia operadores de MongoDB (`$gt`, `$ne`, etc.) del body/query antes de llegar a las rutas, previniendo NoSQL injection.
5. **Validación Zod con regex anti-XSS** — `title`/`description` rechazan caracteres `<` `>` para evitar que se guarde HTML/scripts.
6. **RBAC** — `authMiddleware` + `requireRole('admin')` en rutas administrativas.
7. **Errores sin fuga de información** — el `errorHandler` no expone `stack` en producción (`NODE_ENV=production`).

## Cómo correr

```bash
pnpm install
cp .env.example .env
# Genera dos secretos DISTINTOS:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# Pega uno en JWT_ACCESS_SECRET y otro en JWT_REFRESH_SECRET
# Pon tu MONGODB_URI de Atlas (sin SRV si tu red bloquea DNS SRV)
pnpm dev
```

## Flujo de prueba sugerido

1. `POST /auth/register` (user1) → 201
2. `POST /auth/register` (user2, luego cambiar su `role` a `admin` directo en MongoDB Atlas → Browse Collections, para tener un admin de prueba)
3. `POST /auth/login` con user1 → 200, cookies
4. `POST /tickets` con user1 → 201 (queda con `createdBy = user1`)
5. `PATCH` ese ticket con **user1** → 200 (es el dueño)
6. Login con user2 (admin), `PATCH` el mismo ticket → 200 (es admin)
7. Registrar un tercer usuario (`user3`), login, intentar `PATCH` el ticket de user1 → **403**
8. `DELETE` el ticket con user1 (no admin) → **403**
9. `DELETE` el ticket con user2 (admin) → 200
10. 6 intentos seguidos de `POST /auth/login` con contraseña incorrecta → el 6to debe dar **429**
11. Revisar los headers de cualquier respuesta → debe verse `X-Content-Type-Options: nosniff` (Helmet) y `RateLimit-Remaining` (rate limit)

## Decisiones de diseño

- **`code` único** en `Ticket` para poder demostrar `11000` → 409, igual que en semanas anteriores.
- **Corregí el mismo bug del `tsconfig.json`** encontrado en la semana 7 (`declaration: true` exige anotar explícitamente el tipo `Router`/`Express`) — se agregaron las anotaciones en `app.ts`, `auth.routes.ts`, `user.routes.ts` y `ticket.routes.ts`.
- El service lanza `Error('FORBIDDEN')` cuando un usuario intenta editar un ticket ajeno; el controller lo traduce a `AppError(403, ...)` — mismo patrón que ya traía el starter comentado, solo se activó.
