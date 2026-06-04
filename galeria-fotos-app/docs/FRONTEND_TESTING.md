# Frontend Testing

## Comandos

```bash
npm test -- --watch=false
```

En Windows tambien puede ejecutarse:

```powershell
.\node_modules\.bin\ng.cmd test --watch=false
```

## Stack Actual

El proyecto usa el builder de testing de Angular con Vitest. `tsconfig.spec.json` habilita `vitest/globals`.

## Tests Existentes

- `src/app/app.spec.ts`: shell principal con router outlet.
- `src/app/core/services/api-error.service.spec.ts`: mensajes seguros de error.
- `src/app/core/utils/sensitive-text.spec.ts`: redaccion de datos sensibles.
- `src/app/shared/components/pagination-controls/pagination-controls.component.spec.ts`: paginador avanzado.

## Tests Agregados en Frontend 7A

- `BitacoraService`: verifica endpoints `/Bitacora`, `/Bitacora/{id}` y `/Bitacora/resumen` usando `HttpTestingController`.
- `sensitive-text`: cubre `sanitizeMetadata()` para evitar tokens, storage keys y URLs firmadas en metadata de bitacora.

## Que Probar en Services

- Que cada service use el path correcto.
- Que pase query params permitidos.
- Que normalice respuestas array o paginadas.
- Que no transforme datos sensibles en logs o storage.

## Que Probar en Guards e Interceptor

- Invitado redirige a login en rutas privadas.
- Usuario no accede a rutas Admin.
- Admin accede a rutas Admin.
- `AuthInterceptor` agrega Bearer solo contra `environment.apiUrl`.
- `401` limpia sesion; `403` no debe limpiar token.

## Que Probar en Componentes

Evitar tests fragiles sobre HTML grande. Priorizar:

- estados loading/error/empty;
- acciones principales;
- filtros y paginado;
- sanitizacion visible;
- visibilidad por rol.

## Proximos Tests Recomendados

- `SessionService`.
- `authChildGuard`.
- `authInterceptor`.
- `NotificationBellComponent`.
- `CarritoService`.
- `CuponesService`.
- pantallas Admin criticas con mocks simples.
