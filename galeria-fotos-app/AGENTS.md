# AGENTS.md

## Alcance

Estas notas aplican a todo el proyecto Angular `galeria-fotos-app`.
Antes de modificar archivos, leer y respetar estas reglas.

## Reglas del proyecto

- Este repositorio es solo frontend Angular.
- No crear backend, controllers .NET, entidades C# ni archivos ASP.NET Core.
- La API externa se consume siempre desde `environment.apiUrl`.
- La API local configurada es `http://localhost:5200/api`.
- Todas las llamadas HTTP deben pasar por services de `src/app/core/services`.
- No usar `HttpClient` directamente en componentes.
- Las pantallas nuevas viven en `src/app/features`; el layout compartido vive en `src/app/layout`.
- Conservar la estetica actual del template CaterServ: layout, navbar, sidebar, colores, cards, botones, tablas, formularios y animaciones.
- Conservar los estilos y assets de CaterServ en `public/assets/caterserv`.
- Eliminar solo pantallas demo innecesarias cuando sea seguro que no pertenecen al sistema.

## Autenticacion y sesion

- Mantener el token JWT en `localStorage` mediante `SessionService`.
- Usar la clave `auth_token` para el JWT.
- Usar la clave `guest_mode` para el modo invitado.
- `guest_mode = true` representa acceso anonimo/publico.
- El modo invitado no usa token y no debe enviar `Authorization: Bearer`.
- Usar `AuthInterceptor` para enviar Bearer token solo cuando exista token.
- Si la API responde 401, limpiar sesion y redirigir a `/login`.
- Si la API responde 403, mostrar mensaje de permisos insuficientes.
- El registro no envia rol.
- El registro se muestra visualmente como cuenta de Cliente, pero el backend crea el rol real `Usuario`.
- En la UI, el rol `Usuario` se muestra como `Cliente`; internamente se conserva `Usuario`.

## Roles y permisos

- Roles reales del backend: `Admin`, `Usuario`, `Invitado`.
- `Invitado` es anonimo y solo lectura.
- Invitado puede ver eventos, fotos, comentarios publicos y perfil publico del admin.
- Invitado no puede crear, editar, eliminar, pagar, descargar, comentar ni guardar favoritos.
- `Usuario`/Cliente puede ver eventos y fotos, gestionar sus pedidos, pagar sus pedidos, comentar, guardar favoritos y editar su propio perfil.
- `Admin` puede ver y administrar todo: clientes, eventos, fotos, pedidos, pagos, descargas, favoritos, comentarios y perfil publico.
- Proteger rutas y tambien ocultar/deshabilitar botones segun rol.
- El menu debe adaptarse para Invitado, Cliente y Admin.

## Tema visual

- El proyecto soporta modo claro y modo oscuro.
- El tema global se maneja con `ThemeService`.
- La preferencia se guarda en `localStorage` con la clave `theme_mode`.
- Valores validos de `theme_mode`: `light` y `dark`.
- Si no hay preferencia guardada, usar `prefers-color-scheme` de forma segura con validacion de plataforma.
- Aplicar las clases globales `light-theme` y `dark-theme` en `document.documentElement`.
- No modificar la logica de autenticacion para cambiar tema.
- No tocar `auth_token` ni `guest_mode` al alternar tema.
- Mantener la estetica CaterServ en ambos temas, incluyendo dorado, tipografia, layout, navbar, sidebar, cards, tablas, formularios y botones.
- No eliminar assets ni estilos globales de CaterServ.

## Integracion Pexels demo

- La integracion Pexels en frontend solo consume el backend.
- No poner API Key de Pexels en Angular.
- No guardar API Key de Pexels en el frontend.
- No llamar `api.pexels.com` ni ningun endpoint externo de Pexels desde Angular.
- El endpoint permitido para importar fotos demo es `POST /Admin/demo/pexels/importar-fotos`.
- La pantalla de importacion Pexels es solo para `Admin`.
- `Usuario` e `Invitado` no pueden acceder ni ver opciones de importacion Pexels.
- Usar `environment.apiUrl` y services de `src/app/core/services` para cualquier llamada.
- Mantener la estetica CaterServ y el modo claro/oscuro funcionando.

## Fase 1A admin, eventos y fotos

- El dashboard administrativo vive en `/admin/dashboard`, es solo `Admin` y consume `GET /Admin/dashboard`.
- Los eventos pueden exponer `estado`, `visibilidad`, `fechaLimiteCompraUtc`, `activo` y `portadaFotoId`; mostrarlos con badges claros en listados y detalles.
- La portada de evento solo puede asignarla `Admin` usando `PUT /Eventos/{eventoId}/portada/{fotoId}` desde `EventosService`.
- En fotos por evento, el boton `Usar como portada` debe mostrarse solo a `Admin` y debe marcar visualmente la portada actual.
- La carga masiva de fotos vive en `/admin/fotos/bulk`, es solo `Admin` y no sube binarios ni toca R2 desde Angular.
- La carga masiva usa services y backend: `POST /Fotos/storage-keys/bulk` para generar keys y `POST /Fotos/metadata/bulk` para crear metadata.
- Las fotos pueden exponer `tieneMarcaAgua`, `procesada` y `fechaActualizacionUtc`; mostrarlas con badges sin romper lightbox, hover ni paginado.
- No exponer `StorageKey` original en pantallas publicas o de cliente cuando no corresponda; limitarlo a flujos administrativos.
- Preservar la estetica CaterServ, modo claro/oscuro, roles existentes y menu dinamico.

## Fase 1B descargas

- Las descargas usan limites de uso, vencimiento, estado activo/inactivo y regeneracion de link desde el backend.
- `Usuario`/Cliente ve sus descargas en `/descargas`; `Admin` gestiona descargas en `/admin/descargas`.
- `Invitado` no puede ver, generar ni regenerar descargas.
- La regeneracion de link requiere usuario autenticado y consume `POST /Descargas/{id}/regenerar`.
- La gestion admin consume `GET /Descargas/admin` y debe ser solo para `Admin`.
- No exponer `StorageKey` original a usuarios no-admin ni en pantallas publicas.
- No guardar URLs firmadas en `localStorage`, sessionStorage ni otro almacenamiento del navegador.
- No loguear URLs firmadas en consola.
- Mostrar URLs firmadas solo como link temporal cuando el backend las devuelve.
- Preservar CaterServ, modo claro/oscuro, roles actuales, pedidos, pagos y fotos privadas.

## Fase 2A web publica comercial

- La web publica usa un `PublicLayoutComponent` separado, sin sidebar y sin hero interno de panel.
- `/` y `/home` son Home publica comercial; `/login` debe mantenerse intacto.
- Home, Contacto, Portfolio, Servicios y FAQ publicos no requieren token.
- Home y Contacto consumen `SitioPublicoService` con `GET /Sitio/home`, `GET /Sitio/contacto` y `GET /Sitio/perfil-fotografa`.
- Portfolio publico consume `GET /Portfolio` y detalle `GET /Portfolio/{id}`.
- Servicios publicos consumen `GET /Servicios` y detalle `GET /Servicios/{id}`.
- FAQ publica consume `GET /Faq`.
- Admin gestiona Portfolio, Servicios y FAQ con endpoints admin y CRUD desde services.
- Rutas admin de Portfolio, Servicios y FAQ son solo `Admin`; `Usuario` e `Invitado` no ven esas opciones.
- `whatsAppUrl` viene calculado por backend; usarlo como link y no integrar WhatsApp API real.
- No guardar datos publicos en `localStorage` innecesariamente ni loguear respuestas completas.
- Preservar CaterServ, modo claro/oscuro, responsive y menu por rol.

## Fase 2B presupuestos y agenda

- La ruta publica `/presupuesto` permite crear solicitudes de presupuesto sin login usando `POST /Presupuestos/solicitudes`.
- Las solicitudes publicas no se guardan en `localStorage`, sessionStorage ni otro almacenamiento del navegador.
- La UI publica puede mostrar disponibilidad con `GET /Agenda/disponibilidad`, pero nunca debe exponer clientes, ubicaciones privadas ni descripciones internas.
- La disponibilidad publica debe mostrarse como lista simple de fechas ocupadas o badges; no crear integraciones externas de calendario todavia.
- Admin gestiona solicitudes en `/admin/presupuestos` y `/admin/presupuestos/:id` usando endpoints de `Presupuestos`.
- Admin gestiona agenda en `/admin/agenda` usando endpoints de `Agenda`.
- Las rutas admin de presupuestos y agenda son solo `Admin`; `Usuario` e `Invitado` no ven esas opciones.
- No integrar envio de emails todavia.
- No integrar Google Calendar todavia.
- No integrar WhatsApp API real; usar solo links `wa.me` o `whatsAppUrl` provistos por backend.
- Mantener CaterServ, modo claro/oscuro, responsive, roles existentes y menu dinamico.

## Fase 3 gestion operativa

- El panel operativo vive en `/admin/operaciones`, es solo `Admin` y consume `GET /Admin/operaciones/resumen` y `GET /Admin/operaciones/pendientes`.
- El historial completo de clientes vive en `/clientes/{id}/historial` para `Admin`; `Usuario` debe usar `/mi-historial` y solo ver su propio historial.
- Los historiales de cliente no deben exponer `StorageKey`, URLs firmadas, tokens ni secretos.
- El detalle de pedido muestra historial de estados con `GET /Pedidos/{id}/historial-estados`.
- Solo `Admin` puede cambiar estado de pedido usando `PUT /Pedidos/{id}/estado`.
- Las notas internas son solo `Admin`, usan endpoints `NotasInternas` y nunca deben mostrarse a `Usuario` o `Invitado`.
- No guardar notas internas ni historiales en `localStorage`, sessionStorage ni otro almacenamiento del navegador.
- No loguear respuestas completas con datos privados.
- La gestion admin de sesiones privadas vive en `/admin/sesiones-privadas` y solo `Admin` puede cambiar estado usando `PUT /SesionesPrivadas/{id}/estado`.
- No exponer `StorageKey` ni URLs firmadas desde sesiones privadas, descargas, historiales o notas internas.
- Preservar CaterServ, modo claro/oscuro, roles actuales, menu dinamico y vistas publicas existentes.

## Fase 4 notificaciones

- La campana de notificaciones debe mostrarse solo a usuarios autenticados `Usuario` o `Admin`; `Invitado` no ve notificaciones.
- Las notificaciones propias viven en `/notificaciones` y consumen endpoints `Notificaciones` desde `NotificacionesService`.
- La gestion admin de notificaciones vive en `/admin/notificaciones` y es solo `Admin`.
- El detalle admin vive en `/admin/notificaciones/{id}` y debe ocultar o redactar tokens, secretos, URLs firmadas y datos sensibles si aparecieran.
- Las plantillas de notificacion viven en `/admin/notificaciones/plantillas`, solo `Admin`; declarar esta ruta antes de `/admin/notificaciones/:id`.
- No guardar notificaciones, plantillas ni estados de lectura en `localStorage`, sessionStorage ni otro almacenamiento del navegador.
- No loguear respuestas completas ni payloads con datos privados.
- No exponer `StorageKey`, tokens, secretos ni URLs firmadas en pantallas de usuario o admin.
- No renderizar `cuerpoHtml` de plantillas como HTML activo inseguro; editarlo en textarea y mostrar previews como texto seguro.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales y menu dinamico.

## Fase 5 ventas avanzadas

- El carrito de compras vive en `/carrito`, es solo para `Usuario`/Cliente y `Admin`; `Invitado` no ve ni modifica carrito.
- No guardar carrito, reportes, descuentos, cupones aplicados ni datos financieros en `localStorage`, sessionStorage ni otro almacenamiento del navegador.
- El frontend no calcula descuentos finales; debe mostrar `subtotal`, `descuentoTotal` y `totalFinal` devueltos por el backend.
- La validacion y aplicacion de cupones siempre consume backend: `POST /Cupones/validar`, `POST /Carrito/cupon` y `DELETE /Carrito/cupon`.
- La gestion de cupones vive en `/admin/cupones`, es solo `Admin` y no debe mostrarse a `Usuario` ni `Invitado`.
- Las promociones publicas viven en `/promociones` y `/promociones/{id}`; la gestion admin vive en `/admin/promociones`.
- Los testimonios publicos viven en `/testimonios` y no deben mostrar emails de clientes; la gestion admin vive en `/admin/testimonios`.
- Los carritos abandonados viven en `/admin/carritos-abandonados`, solo `Admin`; no exponerlos a usuarios no-admin.
- Reportes y resumen comercial viven en `/admin/reportes/ventas` y `/admin/ventas`, solo `Admin`; no mostrar datos financieros a `Usuario` ni `Invitado`.
- No loguear respuestas completas con datos privados, ventas, descuentos, carritos abandonados, emails o informacion financiera.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales, menu dinamico y vistas publicas existentes.

## Fase 6B calidad, seguridad y performance

- Preferir lazy loading con `loadComponent` para layouts y pantallas pesadas sin cambiar rutas publicas ni contratos.
- Mantener mensajes de error seguros y claros para `401`, `403`, `409`, `429`, `500`, `502` y `503`; solo `401` debe limpiar sesion y redirigir desde el interceptor.
- No mostrar `JSON.stringify` de cuerpos de error completos al usuario.
- No mostrar stacktraces, tokens, URLs firmadas, secretos, StorageKey ni MarcaAguaStorageKey en errores visibles.
- No usar `console.log`, `console.error` ni otros logs con datos privados, financieros, tokens, URLs firmadas o payloads sensibles.
- No renderizar StorageKey, MarcaAguaStorageKey ni URLs firmadas completas en UI; si Admin necesita una referencia tecnica, mostrarla redactada o truncada.
- Usar utilidades de sanitizacion para textos dinamicos de notificaciones, historiales, descargas, importaciones y pantallas tecnicas.
- Usar `loading="lazy"` en imagenes de listados, cards y grillas que no sean hero principal.
- Usar `trackBy` en listas grandes o repetidas cuando el cambio sea simple y seguro.
- No subir budgets como primera solucion; priorizar lazy loading, limpieza de imports y reduccion de carga inicial.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales, menu dinamico y vistas existentes.

## Fase 7A calidad tecnica frontend, CI, tests y bitacora

- El frontend usa Angular 21 con standalone components, lazy loading y SSR configurado.
- Mantener documentacion frontend en `docs`: arquitectura, seguridad, testing y demo.
- Mantener CI frontend en `.github/workflows/frontend-ci.yml` usando `npm ci`, build y tests sin secretos ni deploy.
- La Bitacora Admin vive en `/admin/bitacora`, es solo `Admin` y consume `GET /Bitacora`, `GET /Bitacora/{id}` y `GET /Bitacora/resumen`.
- La metadata de bitacora siempre debe pasar por sanitizacion antes de renderizarse.
- No renderizar `MetadataJson` como HTML activo; mostrarlo como texto seguro.
- No mostrar tokens, passwords, StorageKey, MarcaAguaStorageKey, URLs firmadas, secretos ni datos financieros en bitacora.
- No guardar bitacora, reportes ni metadata tecnica en `localStorage`, sessionStorage ni otro storage del navegador.
- No usar `console.log` ni `console.error` con metadata de bitacora, payloads privados o datos sensibles.
- Agregar tests nuevos para services, guards, interceptores o sanitizadores cuando se agregue comportamiento transversal.
- Usar mejoras modernas de Angular de forma gradual y justificada: `OnPush`, `trackBy`, lazy loading y `takeUntilDestroyed` cuando aporten valor.
- No migrar masivamente a signals ni a `@if`/`@for` sin una fase dedicada.
- No usar Signal Forms mientras siga siendo experimental para el proyecto.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales, menu dinamico y vistas existentes.

## Fase 7B tests criticos, modernizacion gradual y accesibilidad

- Agregar tests criticos y mantenibles para `SessionService`, guards, interceptores, services tecnicos y sanitizadores cuando el cambio toque esas areas.
- Los tests no deben depender de HTML grande ni de backend corriendo.
- Preferir `takeUntilDestroyed` en componentes tocados con suscripciones manuales; no refactorizar componentes complejos solo por estilo.
- Aplicar `ChangeDetectionStrategy.OnPush` solo en componentes puros o componentes tocados donde no rompa formularios ni flujos existentes.
- Usar control flow moderno `@if`/`@for` de forma gradual en componentes tocados; no hacer migraciones masivas de templates.
- No migrar masivamente a signals; usar signals solo para estado local simple cuando aporte claridad.
- No activar zoneless ni usar Signal Forms en esta fase.
- Mantener accesibilidad basica: `aria-label` en botones icon-only, labels claros en formularios, foco visible, tablas con encabezados y dropdowns con estado accesible.
- No exponer StorageKey, MarcaAguaStorageKey, URLs firmadas, tokens, secretos, metadata cruda ni datos financieros en UI o tests.
- No agregar `console.log` ni `console.error` con datos sensibles.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales, menu dinamico y vistas existentes.

## Fase 7C SEO, SSR y demo publica

- Las pantallas publicas deben configurar titulo, descripcion y Open Graph/Twitter Card mediante `SeoService` o una abstraccion equivalente.
- No incluir tokens, StorageKey, MarcaAguaStorageKey, URLs firmadas, query params sensibles ni datos privados en metadata SEO, titulos, descripcion u OG image.
- Las imagenes OG deben usar assets publicos o URLs publicas seguras; si hay duda, usar fallback publico de CaterServ.
- Mantener rutas SSR publicas en `app.routes.server.ts`; no agregar rutas admin o privadas a robots/sitemap publicos.
- La ruta publica `/disponibilidad` puede mostrar disponibilidad simple desde `GET /Agenda/disponibilidad`, sin clientes, ubicaciones privadas ni descripciones internas.
- No agregar canonical, `robots.txt` ni sitemap definitivo sin dominio final confirmado; si se agregan, deben incluir solo rutas publicas estables.
- Las rutas publicas no deben mostrar lenguaje de panel interno como "Hola Invitado" ni opciones privadas/admin.
- Los formularios publicos y de auth deben usar labels claros, `aria-invalid` y `aria-describedby` en errores cuando sea viable.
- Migrar a `@if`/`@for` solo de forma gradual y en templates simples o tocados; no hacer migraciones masivas.
- Preservar CaterServ, modo claro/oscuro, responsive, roles actuales, menu dinamico y vistas existentes.

## Endpoints principales

- Admin: `GET /Admin/dashboard`, `GET /Admin/operaciones/resumen`, `GET /Admin/operaciones/pendientes`, `GET /Admin/perfil-publico`, `GET /Admin/mi-perfil`, `PUT /Admin/mi-perfil`.
- Admin ventas: `GET /Admin/ventas/resumen`.
- Admin demo Pexels: `POST /Admin/demo/pexels/importar-fotos`.
- Auth: `POST /Auth/register`, `POST /Auth/login`.
- Bitacora: `GET /Bitacora`, `GET /Bitacora/{id}`, `GET /Bitacora/resumen`.
- Clientes: `GET/POST /Clientes`, `GET/PUT/DELETE /Clientes/{id}`, `GET /Clientes/{clienteId}/historial`, `GET /Clientes/mi-historial`.
- Eventos: `GET/POST /Eventos`, `GET/PUT/DELETE /Eventos/{id}`, `PUT /Eventos/{eventoId}/portada/{fotoId}`.
- Comentarios de eventos: `GET/POST /Eventos/{eventoId}/comentarios`, `PUT/DELETE /Eventos/comentarios/{comentarioId}`.
- Fotos: `GET /Fotos/evento/{eventoId}`, `GET/PUT/DELETE /Fotos/{id}`, `POST /Fotos/storage-key`, `POST /Fotos/storage-keys/bulk`, `POST /Fotos/metadata`, `POST /Fotos/metadata/bulk`.
- Comentarios de fotos: `GET/POST /Fotos/{fotoId}/comentarios`, `PUT/DELETE /Fotos/comentarios/{comentarioId}`.
- Favoritos: `GET /Favoritos/eventos`, `POST/DELETE /Favoritos/eventos/{eventoId}`, `GET /Favoritos/fotos`, `POST/DELETE /Favoritos/fotos/{fotoId}`.
- Pedidos: `GET/POST /Pedidos`, `GET /Pedidos/{id}`, `PUT /Pedidos/{id}/estado`, `GET /Pedidos/{id}/historial-estados`.
- Pagos: `POST /Pagos/checkout-pro/preferencias`.
- Descargas: `GET /Descargas/mis-descargas`, `GET /Descargas/{id}`, `POST /Descargas/link`, `POST /Descargas/{id}/regenerar`, `GET /Descargas/admin`.
- Carrito: `GET /Carrito`, `POST /Carrito/items/foto-evento/{fotoId}`, `POST /Carrito/items/paquete-evento/{paqueteId}`, `POST /Carrito/items/foto-privada/{fotoPrivadaId}`, `DELETE /Carrito/items/{itemId}`, `DELETE /Carrito/vaciar`, `POST /Carrito/cupon`, `DELETE /Carrito/cupon`, `POST /Carrito/crear-pedido`.
- Cupones: `POST /Cupones/validar`, `GET /Cupones/admin`, `GET /Cupones/admin/{id}`, `POST /Cupones`, `PUT /Cupones/{id}`, `DELETE /Cupones/{id}`, `POST /Cupones/{id}/activar`, `POST /Cupones/{id}/desactivar`, `GET /Cupones/{id}/usos`.
- Promociones: `GET /Promociones`, `GET /Promociones/{id}`, `GET /Promociones/admin`, `POST /Promociones`, `PUT /Promociones/{id}`, `DELETE /Promociones/{id}`, `POST /Promociones/{id}/activar`, `POST /Promociones/{id}/desactivar`.
- Testimonios: `GET /Testimonios`, `GET /Testimonios/destacados`, `POST /Testimonios`, `GET /Testimonios/admin`, `GET /Testimonios/admin/{id}`, `PUT /Testimonios/{id}`, `DELETE /Testimonios/{id}`, `POST /Testimonios/{id}/publicar`, `POST /Testimonios/{id}/ocultar`.
- Carritos abandonados: `GET /CarritosAbandonados`, `GET /CarritosAbandonados/resumen`, `POST /CarritosAbandonados/detectar`, `POST /CarritosAbandonados/{id}/notificar`.
- Reportes: `GET /Reportes/ventas/resumen`.
- Sitio publico: `GET /Sitio/home`, `GET /Sitio/contacto`, `GET /Sitio/perfil-fotografa`.
- Portfolio: `GET /Portfolio`, `GET /Portfolio/{id}`, `GET /Portfolio/admin`, `POST /Portfolio`, `PUT /Portfolio/{id}`, `DELETE /Portfolio/{id}`.
- Servicios: `GET /Servicios`, `GET /Servicios/{id}`, `GET /Servicios/admin`, `POST /Servicios`, `PUT /Servicios/{id}`, `DELETE /Servicios/{id}`.
- FAQ: `GET /Faq`, `GET /Faq/{id}`, `GET /Faq/admin`, `POST /Faq`, `PUT /Faq/{id}`, `DELETE /Faq/{id}`.
- Presupuestos: `POST /Presupuestos/solicitudes`, `GET /Presupuestos/solicitudes`, `GET /Presupuestos/solicitudes/{id}`, `PUT /Presupuestos/solicitudes/{id}`, `PUT /Presupuestos/solicitudes/{id}/estado`, `DELETE /Presupuestos/solicitudes/{id}`.
- Agenda: `GET /Agenda`, `GET /Agenda/{id}`, `POST /Agenda`, `PUT /Agenda/{id}`, `DELETE /Agenda/{id}`, `GET /Agenda/disponibilidad`.
- Notas internas: `GET /NotasInternas/{entidadTipo}/{entidadId}`, `POST /NotasInternas/{entidadTipo}/{entidadId}`, `PUT /NotasInternas/{id}`, `DELETE /NotasInternas/{id}`.
- Sesiones privadas: `GET /SesionesPrivadas`, `GET /SesionesPrivadas/{id}`, `PUT /SesionesPrivadas/{id}/estado`.
- Notificaciones: `GET /Notificaciones/mis-notificaciones`, `PATCH /Notificaciones/{id}/leer`, `PATCH /Notificaciones/marcar-todas-leidas`, `GET /Notificaciones/admin`, `GET /Notificaciones/admin/{id}`, `POST /Notificaciones/admin/{id}/reenviar`, `PATCH /Notificaciones/admin/{id}/cancelar`.
- Plantillas de notificacion: `GET /Notificaciones/plantillas`, `POST /Notificaciones/plantillas`, `PUT /Notificaciones/plantillas/{id}`, `PATCH /Notificaciones/plantillas/{id}/activar`, `PATCH /Notificaciones/plantillas/{id}/desactivar`.

## Listados paginados

- Para listados principales, preferir endpoints paginados cuando existan.
- Endpoints paginados actuales: `GET /Eventos/paginado`, `GET /Fotos/evento/{eventoId}/paginado`, `GET /Pedidos/paginado`, `GET /Favoritos/eventos/paginado`, `GET /Favoritos/fotos/paginado`.
- Usar query params backend solo para paginado: `Page`, `PageSize` y `All`.
- Valores permitidos de `PageSize`: `5`, `10`, `20` y `40`.
- La opcion visual `Todos` debe enviar `All=true`.
- Cuando se selecciona un `PageSize`, enviar `All=false` y reiniciar a `Page=1`.
- No inventar query params backend para busquedas o filtros si la API no los define.
- Las busquedas y filtros de UI se aplican localmente sobre los items cargados en la pagina actual.
- El paginado visual debe usar controles avanzados: `<<`, `<`, numeros, `>` y `>>`.
- Mostrar como maximo 5 botones numericos visibles y marcar la pagina actual con el dorado CaterServ.
- Deshabilitar botones de paginado cuando no corresponda avanzar o retroceder.
- Si `All=true`, mantener el selector visible y deshabilitar u ocultar la navegacion de paginas.

## Galerias e imagenes

- Las grillas de fotos deben tener hover con overlay suave, icono de lupa, zoom leve, bordes redondeados y transiciones compatibles con modo claro/oscuro.
- Las fotos clickeables deben abrir un modal/lightbox reusable con imagen grande, fondo oscuro y cierre por boton, Escape o click fuera cuando sea posible.
- Las cards de eventos deben mostrar la primera foto disponible del evento.
- Para obtener portada de eventos desde el frontend, usar `GET /Fotos/evento/{eventoId}/paginado` mediante `FotosService` con `Page=1`, `PageSize=5` y `All=false`.
- Cachear la portada por `eventoId` en el componente para evitar llamadas repetidas o loops.
- Si un evento no tiene foto, mostrar placeholder visual sin romper acciones ni permisos.

## Layout responsive

- En mobile menor a `992px`, ocultar completamente el sidebar y no reservar espacio para el.
- El contenido principal debe ocupar todo el ancho disponible en mobile.
- La navbar debe mantener opciones principales visibles y agrupar opciones admin/operativas en dropdown para evitar saturacion.
- Truncar emails o nombres largos con ellipsis en navbar.
- Mantener contenedores principales amplios en desktop, aproximadamente `1280px` a `1400px`, y padding compacto en mobile.
- Las pantallas principales deben usar `container-fluid` o un layout equivalente amplio con max-width aproximado de `1440px`.
- Preservar la estetica CaterServ, incluyendo animaciones suaves, sombras, hover, dorado, modo claro/oscuro y responsive.

## Verificacion recomendada

- Ejecutar `.\node_modules\.bin\ng.cmd build`.
- Si los tests estan configurados, ejecutar `.\node_modules\.bin\ng.cmd test --watch=false`.
