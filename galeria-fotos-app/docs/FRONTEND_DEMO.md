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

- `/admin/dashboard`
- `/admin/operaciones`
- `/admin/bitacora`
- `/clientes`
- `/pedidos`
- `/admin/descargas`
- `/admin/notificaciones`
- `/admin/notificaciones/plantillas`
- `/admin/ventas`
- `/admin/reportes/ventas`

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
