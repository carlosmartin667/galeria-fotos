# Frontend Architecture

## Stack

- Angular 21 con standalone components.
- Angular CLI local `21.2.13`; paquetes Angular runtime instalados `21.2.15`.
- TypeScript 5.9, RxJS 7.8 y SSR con `@angular/ssr`.
- Template visual CaterServ preservado desde `public/assets/caterserv`.

El proyecto ya esta en Angular 21. No se fuerza una alineacion patch de CLI/build/SSR sin validar disponibilidad de paquetes, porque el objetivo es no romper el build ni el lockfile.

## Estructura

- `src/app/core`: models, guards, interceptors, services, utils y piezas transversales.
- `src/app/shared`: componentes reutilizables sin conocimiento de negocio pesado.
- `src/app/features`: pantallas por dominio funcional.
- `src/app/layout`: layouts publico e interno, navbar y sidebar.
- `src/app/pages`: pantallas generales como not-found.

## Rutas y Layouts

`app.routes.ts` usa lazy loading con `loadComponent`. El layout publico sirve Home, Portfolio, Servicios, Promociones, Testimonios, FAQ, Contacto, Presupuesto y Disponibilidad. El layout interno se protege con `authChildGuard` y usa `data.roles` para rutas Admin o Usuario.

Las rutas administrativas principales cuelgan del padre `/admin` y renderizan `AdminLayoutComponent`. Este layout usa una estructura visual basada en Tabler Bootstrap 5, con sidebar vertical, topbar, `page-wrapper`, `page-header`, `page-body` y `container-fluid`, pero todos los estilos quedan scopeados bajo `.admin-layout`. No se instalo `@tabler/core` ni CSS global de Tabler para evitar contaminar `PublicLayoutComponent`, `MainLayoutComponent` o la estetica CaterServ.

`PublicLayoutComponent` y `MainLayoutComponent` conservan CaterServ. El menu administrativo ya no se duplica en navbar/sidebar/footer publicos o de usuario. El sidebar de `AdminLayoutComponent` apunta solo a rutas `/admin/...`. Las pantallas compartidas de gestion tienen aliases admin para conservar el layout Tabler: `/admin/eventos`, `/admin/fotos`, `/admin/pedidos`, `/admin/clientes` y `/admin/descargas/:id`. La ruta historica `/admin/perfil-publico` se conserva como perfil publico compatible con el layout interno existente.

`app.routes.server.ts` declara rutas SSR para pantallas publicas e internas que deben renderizar en servidor. La ruta publica `/disponibilidad` queda incluida. La ruta Admin `/admin/bitacora` tambien queda registrada ahi para mantener consistencia SSR.

## SEO y SSR Publico

`SeoService` centraliza titulo, descripcion, Open Graph y Twitter Card para pantallas publicas. Las paginas publicas usan metadata especifica cuando la API devuelve contenido y fallback seguro cuando no hay datos.

Reglas:

- No usar tokens, StorageKey, MarcaAguaStorageKey, URLs firmadas ni query params sensibles en metadata.
- No guardar metadata SEO en storage del navegador.
- Usar una imagen publica segura como fallback para OG image.
- Mantener metadata dinamica en componentes publicos de detalle cuando depende del contenido cargado.
- No agregar canonical hasta tener dominio final confirmado.
- No publicar robots/sitemap con rutas privadas, Admin o IDs sensibles.

## HTTP y API

Todas las llamadas salen por services en `src/app/core/services`. Los componentes no usan `HttpClient` directo.

`ApiHttpService` centraliza:

- `environment.apiUrl`.
- `get`, `post`, `put`, `patch` y `delete`.
- timeout.
- unwrap de envelopes `{ success, data, message, errors }`.
- conversion de errores mediante `ApiErrorService`.

## Seguridad de Navegacion

`AuthInterceptor` agrega `Authorization: Bearer` solo a llamadas contra `environment.apiUrl` y solo si hay token valido. `authChildGuard` protege rutas segun autenticacion y roles.

La UI es role based:

- Invitado: lectura publica.
- Usuario/Cliente: pedidos, descargas, favoritos, historial propio y notificaciones propias.
- Admin: gestion completa, operaciones, descargas admin, notificaciones admin, reportes y bitacora.

## Componentes Reutilizables

El proyecto ya tiene piezas compartidas:

- `LoadingComponent`.
- `EmptyStateComponent`.
- `ErrorAlertComponent`.
- `PaginationControlsComponent`.
- `ImageLightboxComponent`.
- `NotificationBellComponent`.
- `NotasInternasComponent`.

Los componentes compartidos puros usan `ChangeDetectionStrategy.OnPush` cuando es seguro.

## Reglas de Componentes

La logica de negocio pesada no debe vivir en componentes. Los componentes orquestan UI, formularios, filtros y estados visuales. Los detalles de API, rutas HTTP y normalizacion de respuesta deben vivir en services o utils.

## Bitacora Admin

La bitacora frontend vive en `/admin/bitacora`, es solo Admin y consume:

- `GET /Bitacora`.
- `GET /Bitacora/{id}`.
- `GET /Bitacora/resumen`.

La metadata nunca se muestra cruda: siempre pasa por utilidades de sanitizacion.
