# Frontend Security

## JWT y Sesion

El token JWT vive en `localStorage` bajo la clave `auth_token`, administrado por `SessionService`. El modo invitado usa la clave `guest_mode` y no envia Bearer token.

No se deben guardar en storage:

- URLs firmadas.
- bitacora.
- reportes.
- notas internas.
- payloads financieros.
- respuestas completas con datos privados.

## AuthInterceptor

`AuthInterceptor` agrega `Authorization: Bearer` solo cuando:

- la llamada apunta a `environment.apiUrl`;
- existe token valido;
- no se esta en modo invitado.

Si la API responde `401`, se limpia sesion y se redirige a `/login`. Un `403` debe mostrarse como permisos insuficientes, sin forzar logout.

## Guards y UI por Rol

Las rutas internas usan `authChildGuard` y `data.roles`. La UI tambien oculta opciones segun rol para mejorar experiencia, pero la seguridad real siempre depende del backend.

Reglas:

- Invitado no ve acciones de escritura, descargas, pagos ni favoritos.
- Usuario ve solo su informacion y acciones permitidas.
- Admin ve pantallas administrativas.

## Datos Sensibles

No mostrar a Usuario/Invitado:

- `StorageKey`.
- `MarcaAguaStorageKey`.
- URLs firmadas.
- tokens.
- secretos.
- datos financieros admin.

Tampoco se deben loguear respuestas completas ni errores con payloads sensibles.

## Sanitizacion

`src/app/core/utils/sensitive-text.ts` redacta:

- JWT.
- Bearer tokens.
- URLs.
- query params sensibles.
- claves tecnicas como storage keys, signed URLs, passwords, API keys y datos de pagos.

La Bitacora Admin usa `sanitizeMetadata()` para mostrar metadata resumida y segura. Si la metadata es JSON, se parsea y se redactan claves sensibles antes de renderizarla como texto en `<pre>`, no como HTML activo.

## Manejo de Errores

`ApiErrorService` transforma errores HTTP en mensajes seguros para:

- `0`.
- `400`.
- `401`.
- `403`.
- `404`.
- `409`.
- `429`.
- `500`.
- `502`.
- `503`.

No se deben mostrar stacktraces, cuerpos crudos de error, tokens, storage keys ni URLs firmadas.

## Limite Importante

El frontend acompana la seguridad, pero no la reemplaza. Toda autorizacion real, validacion de permisos y proteccion de datos debe existir en backend.
