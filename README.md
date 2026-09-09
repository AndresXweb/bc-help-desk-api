# bc-help-desk-api — Semana 07

API REST con **autenticación JWT completa** (bcrypt + access/refresh tokens en cookies HttpOnly), protegiendo el CRUD del recurso principal del dominio **Help Desk**.

## Dominio asignado

**Soporte técnico / Help Desk** — recurso principal `Ticket`, protegido por autenticación. Cada ticket registra qué usuario lo creó (`createdBy`).

```ts
interface Ticket {
  code: string;            // único, formato TKT-1234
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  agentId?: string;
  createdBy: ObjectId;     // referencia al usuario autenticado
}
```

## Autenticación

| Endpoint | Descripción | Protegida |
|---|---|---|
| `POST /api/v1/auth/register` | Registro — password hasheada con bcrypt (10 salt rounds) | No |
| `POST /api/v1/auth/login` | Login — emite `accessToken` (15 min) y `refreshToken` (7 días) en cookies `httpOnly` | No |
| `GET /api/v1/auth/me` | Perfil del usuario autenticado | Sí |
| `POST /api/v1/auth/refresh` | Renueva tokens con **rotación** (invalida el refresh anterior) | Requiere cookie `refreshToken` |
| `POST /api/v1/auth/logout` | Limpia cookies e invalida el refresh token en DB | Sí |

Seguridad aplicada: secretos JWT distintos para access/refresh, hash del refresh token almacenado en DB (nunca el token en claro), mismo mensaje de error para email/contraseña incorrectos (previene user enumeration), cookies `httpOnly` + `sameSite: lax` + `secure` en producción.

## Recurso — Tickets (todas las rutas requieren estar autenticado)

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/api/v1/tickets` | Listar todos los tickets | 200 / 401 |
| GET | `/api/v1/tickets/:id` | Obtener un ticket | 200 / 401 / 404 |
| POST | `/api/v1/tickets` | Crear ticket (queda asociado al usuario autenticado) | 201 / 400 / 401 / 409 |
| PATCH | `/api/v1/tickets/:id` | Actualizar parcialmente | 200 / 400 / 401 / 404 |
| DELETE | `/api/v1/tickets/:id` | Eliminar | 204 / 401 / 404 |

## Cómo correr

```bash
pnpm install
cp .env.example .env
# Genera dos secretos DISTINTOS y pégalos en .env:
openssl rand -base64 64   # → JWT_ACCESS_SECRET
openssl rand -base64 64   # → JWT_REFRESH_SECRET
docker compose up -d       # o tu URI de MongoDB Atlas en .env
pnpm dev
```

## Flujo de prueba sugerido (Thunder Client / Postman)

1. `POST /auth/register` → 201
2. `POST /auth/login` → 200, cookies `accessToken`/`refreshToken` en la respuesta
3. `GET /api/v1/tickets` sin cookies → **401**
4. `POST /api/v1/tickets` con cookie → 201
5. `GET` / `PATCH` / `DELETE` sobre ese ticket → 200/200/204
6. `POST /auth/refresh` → 200, cookies nuevas (rotación)
7. `POST /auth/logout` → 200, cookies limpiadas
8. `POST /auth/refresh` de nuevo (con el token ya invalidado) → **401**

## Decisiones de diseño

- **`createdBy`** en `Ticket` referencia al usuario autenticado (`req.user.sub`) — sigue el patrón que muestra la especificación (`addedBy`/`registeredBy`) para dejar registro de quién creó cada recurso.
- **`code` único** en `Ticket` (formato `TKT-1234`) para poder demostrar el manejo de duplicados (`11000` → 409), igual que en semanas anteriores.
- **Corregí un bug del `errorHandler.ts` del starter**: no manejaba `ZodError`, así que un body inválido en `register`/`login`/`tickets` respondía 500 en vez de 400. Se agregó ese caso explícitamente.
- **Corregí otro bug del `tsconfig.json` del starter**: con `"declaration": true`, TypeScript exige anotar explícitamente el tipo de `app` y de cada `router` exportado (si no, ni el propio `app.ts` dado compila). Se agregaron las anotaciones `Express`/`Router` en `app.ts`, `auth.routes.ts` y `tickets.routes.ts`.
