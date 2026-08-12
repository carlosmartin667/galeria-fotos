# Angular 22D: dependencias estables

## Versiones revisadas

- Angular runtime 22.1.1 y CLI/build/SSR 22.1.3 ya son los ultimos estables publicados de la linea 22.
- TypeScript permanece en 6.0.3. Angular 22 admite `>=6.0.0 <6.1.0`, por lo que TypeScript 7 queda fuera de compatibilidad.
- RxJS 7.8.2, Express 5.2.1, tslib 2.8.1 y `@types/express` 5.0.6 ya estaban resueltos a sus ultimos estables compatibles.

## Actualizaciones aplicadas

- `@types/node`: linea 20 a linea 24, alineada con Node 24.15.0 de CI y desarrollo.
- `jsdom`: 28 a 30 estable, validado con Vitest y Node 24.
- `prettier`: ultimo parche estable 3.9.6.
- `vitest`: ultimo parche estable 4.1.10.

## Dependencias postergadas

- TypeScript 7.0.2: no compatible con el rango oficial de Angular 22.
- `@types/node` 26.x: se mantiene 24.x para reflejar el runtime de CI y evitar exponer APIs de un major no ejecutado.

No se agregaron dependencias, overrides ni prereleases. Las dependencias CDN y los assets CaterServ no se modificaron.
