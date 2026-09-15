# Evidencia de pruebas — Semana 07

Capturas de Thunder Client + terminal, probando el flujo completo de autenticación JWT y el CRUD protegido, contra MongoDB Atlas real.

| Archivo | Qué muestra |
|---|---|
| `RegistroUsuario.PNG` | `POST /api/v1/auth/register` → 201, usuario creado (sin password en la respuesta) |
| `Login.PNG` | `POST /api/v1/auth/login` → 200, cookies `accessToken`/`refreshToken` emitidas |
| `AccesoDenegado.PNG` | `GET /api/v1/tickets` sin sesión (vía `curl`, sin cookies) → **401** |
| `AccesoDespuesDeLoguearse.PNG` | `GET /api/v1/tickets` con sesión → 200 |
| `CreacionTicket.PNG` | `POST /api/v1/tickets` → 201, con `createdBy` asociado al usuario autenticado |
| `RefreshRotacion.PNG` | `POST /api/v1/auth/refresh` → 200, cookies **nuevas** emitidas (rotación) |
| `Logout.PNG` | `POST /api/v1/auth/logout` → 200, cookies limpiadas e invalidadas en DB |
| `RefreshDespuesLogout.PNG` | `POST /api/v1/auth/refresh` **después** del logout → **401**, confirma que el refresh token quedó invalidado de verdad |

Las últimas tres capturas demuestran el ciclo completo de seguridad de la semana: login → rotación de tokens → logout → intento de reutilizar un token ya invalidado (rechazado).
