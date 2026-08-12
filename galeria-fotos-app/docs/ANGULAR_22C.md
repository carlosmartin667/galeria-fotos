# Angular 22C: mejoras selectivas post-upgrade

## Alcance

Esta fase mantiene Angular 22.1.x y evita cambios de backend, endpoints, contratos, autenticacion, layouts y logica de negocio. Las mejoras se eligieron para ser pequenas, medibles y reversibles.

## Mejoras aplicadas

- `PresupuestoSolicitudComponent` usa `@defer (on viewport)` para la tarjeta secundaria de disponibilidad. El formulario y su contenido principal siguen siendo inmediatos. El bloque incluye `@placeholder`, `@loading` y `@error` accesibles.
- `AdminLayoutComponent` usa una `signal` local para el estado visual de apertura del sidebar mobile. La navegacion, guardas, sesion y roles no cambian.
- `PublicHomeComponent` agrega `takeUntilDestroyed` a su carga inicial; evita que una respuesta pendiente actualice una vista que ya se destruyo.
- Login y registro anuncian errores de API con una region `aria-live`, marcan el formulario ocupado durante el submit y ocultan el spinner de los lectores de pantalla.

## Decisiones evaluadas

- No se incorporo `httpResource`/`resource`: los services actuales centralizan `ApiHttpService`, envelopes y `ApiErrorService`; migrar solo una pantalla agregaria dos patrones de error y SSR sin un beneficio medible en esta fase.
- No se incorporo Signal Forms: los formularios existentes son reactivos y varios son flujos criticos. La API de Signal Forms no aporta una mejora suficiente para justificar el riesgo ahora.
- No se cambio `ChangeDetectionStrategy.Eager` de forma masiva. Se preserva por compatibilidad con formularios, scripts CaterServ, hidratacion y DOM externo. Los componentes compartidos puros ya usan `OnPush` donde es seguro.

## SSR e hidratacion

Se conserva `provideClientHydration(withEventReplay(), withNoIncrementalHydration())`. No se agregaron accesos directos a APIs de navegador ni se modificaron rutas SSR/prerender.

## Proximos pasos sugeridos

1. Medir Web Vitals y chunking con datos de produccion antes de diferir mas contenido.
2. Agregar `takeUntilDestroyed` gradualmente en componentes que mantengan streams de larga vida, priorizando listeners de UI.
3. Evaluar `resource` en una pantalla publica de solo lectura solo cuando haya una estrategia comun de errores y pruebas SSR.
