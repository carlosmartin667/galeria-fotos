# Frontend Demo

## Correr Frontend

```bash
npm install
npm start
```

Abrir `http://localhost:4200`.

## Build

```bash
npm run build
```

En Windows:

```powershell
.\node_modules\.bin\ng.cmd build
```

## Tests

```bash
npm test -- --watch=false
```

En Windows:

```powershell
.\node_modules\.bin\ng.cmd test --watch=false
```

## Rutas Publicas

- `/`
- `/home`
- `/portfolio`
- `/servicios`
- `/promociones`
- `/testimonios`
- `/faq`
- `/contacto`
- `/presupuesto`
- `/disponibilidad`

## Demo Usuario/Cliente

- `/dashboard`
- `/eventos`
- `/fotos/evento`
- `/pedidos`
- `/descargas`
- `/favoritos`
- `/mi-historial`
- `/notificaciones`
- `/clientes/mi-perfil`

## Demo Admin

Las rutas `/admin/*` usan `AdminLayoutComponent`, con sidebar vertical tipo Tabler Bootstrap 5 y estilos scopeados bajo `.admin-layout`. No se instalo `@tabler/core`; el sitio publico sigue usando CaterServ sin CSS global de Tabler.

- `/admin/dashboard`
- `/admin/operaciones`
- `/admin/dev-tools`
- `/admin/bitacora`
- `/admin/eventos`
- `/admin/eventos/nuevo`
- `/admin/fotos`
- `/admin/fotos/evento`
- `/admin/fotos/bulk`
- `/admin/pedidos`
- `/admin/clientes`
- `/admin/descargas`
- `/admin/portfolio`
- `/admin/servicios`
- `/admin/faq`
- `/admin/presupuestos`
- `/admin/agenda`
- `/admin/sesiones-privadas`
- `/admin/notificaciones`
- `/admin/notificaciones/plantillas`
- `/admin/ventas`
- `/admin/reportes/ventas`

Las pantallas operativas compartidas mantienen sus URLs existentes para Usuario/Cliente, pero el AdminLayout usa aliases `/admin/...` para no saltar al layout comun: Eventos, Fotos, Pedidos, Clientes y detalle de Descargas.

## Demo Ventas

- Carrito: `/carrito`.
- Cupones Admin: `/admin/cupones`.
- Promociones publicas: `/promociones`.
- Promociones Admin: `/admin/promociones`.
- Testimonios publicos: `/testimonios`.
- Testimonios Admin: `/admin/testimonios`.
- Carritos abandonados: `/admin/carritos-abandonados`.
- Reportes ventas: `/admin/reportes/ventas`.

## Demo Notificaciones

- Campana en navbar para Usuario/Admin autenticado.
- Mis notificaciones: `/notificaciones`.
- Admin notificaciones: `/admin/notificaciones`.
- Plantillas: `/admin/notificaciones/plantillas`.

## Demo Bitacora

- Ruta: `/admin/bitacora`.
- Solo Admin.
- Filtros: desde, hasta, usuario email, accion, entidad, severidad, correlationId y pageSize.
- Tabla paginada.
- Panel de detalle con metadata sanitizada.

## Demo DevTools

- Ruta: `/admin/dev-tools`.
- Solo Admin.
- Pruebas visuales de errores HTTP, payloads inesperados, correlationId y auditoria.
- En Production el backend puede devolver 404 para bloquear el modulo; la pantalla debe mostrarlo como no disponible.
- Los resultados se muestran sanitizados, sin `json` pipe ni storage del navegador.
- La prueba 401 usa la politica global existente de sesion del frontend.

## Checklist Visual

- Modo claro preserva CaterServ.
- Modo oscuro mantiene dorado y contraste legible.
- Navbar no se satura.
- Sidebar se oculta en mobile menor a 992px.
- Cards, tablas, formularios y badges se leen en ambos temas.
- No aparecen storage keys, tokens ni URLs firmadas completas.
- Las rutas publicas no muestran lenguaje de panel interno como "Hola Invitado".

## Checklist SEO/SSR

- Revisar `title` y `meta[name="description"]` en Home, Portfolio, Servicios, Promociones, Testimonios, FAQ, Contacto, Presupuesto y Disponibilidad.
- Revisar Open Graph: `og:title`, `og:description`, `og:type`, `og:image` y `og:site_name`.
- Usar solo imagenes publicas seguras para metadata; nunca URLs firmadas ni query params sensibles.
- Mantener SSR en rutas publicas registradas en `app.routes.server.ts`.
- No agregar canonical hasta tener dominio final.
- No generar `robots.txt` ni sitemap definitivo sin dominio final; cuando se agreguen, deben incluir solo rutas publicas estables y excluir Admin, rutas privadas e IDs sensibles.

## Estado de Versiones

El proyecto ya corre sobre Angular 21. Al momento de Frontend 7A se detecto:

- Angular runtime `21.2.15`.
- Angular CLI/build/SSR local `21.2.13`.

La alineacion patch queda pendiente hasta poder validar disponibilidad de paquetes sin poner en riesgo el lockfile.
