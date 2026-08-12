# Angular 22E: modernizacion controlada de codigo

## Alcance

Esta fase moderniza patrones internos compatibles con Angular 22.1, TypeScript 6.0 y Node 24.15 sin cambiar backend, contratos HTTP, autenticacion, roles, layouts ni comportamiento de negocio. Se conserva SSR, hidratacion, CaterServ y jQuery.

## Relevamiento inicial

- Control flow legado: no se encontraron usos de `*ngIf`, `*ngFor`, `[ngSwitch]`, `ngSwitchCase` ni `ngSwitchDefault` en `src/app`.
- Control flow moderno: el proyecto ya usa `@if`, `@for` y `@switch`; no fue necesaria una migracion de templates.
- Suscripciones: se relevaron 157 llamadas a `subscribe`. La mayor parte corresponde a HTTP finito, por lo que no se aplico una conversion mecanica a `takeUntilDestroyed`.
- Deteccion de cambios: se preservaron los componentes `Eager` que interactuan con formularios, hidratacion o scripts externos. Solo se cambiara a `OnPush` en componentes puros validados de forma individual.
- Tipado: el unico `any` de codigo productivo estaba en el puente local de jQuery CaterServ.

## Cambios aplicados

1. `App` usa `takeUntilDestroyed(DestroyRef)` para el stream permanente de eventos del router. Se elimina la suscripcion manual y su `ngOnDestroy`, sin cambiar el refresco de scripts despues de cada navegacion.
2. `TemplateScriptsService` reemplaza el `any` de jQuery por interfaces locales para `counterUp` y `owlCarousel`. Esto conserva exactamente la carga y la inicializacion de scripts CaterServ, sin agregar dependencias de tipos ni acceder a APIs browser durante SSR.

## Patrones preservados intencionalmente

- No se habilita zoneless, Signal Forms ni `httpResource` por su impacto transversal sobre formularios, errores HTTP, SSR y pruebas.
- No se migra masivamente a signals: la autenticacion, sesion, servicios HTTP y flujos de negocio conservan su contrato actual.
- No se elimina `ChangeDetectionStrategy.Eager` de forma global; la hidratacion y el DOM administrado por CaterServ requieren una validacion visual por componente.
- No se tocan rutas, endpoints, payloads, guards, interceptor, token ni modo invitado.

## Verificacion

- Node: `24.15.0`.
- Dependencias: `npm ci` sin vulnerabilidades.
- Build Angular con SSR y prerender: correcto, 12 rutas estaticas prerenderizadas.
- Tests Vitest: 16 archivos y 75 pruebas aprobadas.

## Siguiente paso seguro

Realizar pilotos pequenos y medibles para `OnPush` o estado local con signals en componentes aislados, con prueba de hidratacion y navegacion. No conviene una migracion automatica de suscripciones HTTP ni de deteccion de cambios.
