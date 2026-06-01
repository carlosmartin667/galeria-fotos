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

## Endpoints principales

- Admin: `GET /Admin/dashboard`, `GET /Admin/perfil-publico`, `GET /Admin/mi-perfil`, `PUT /Admin/mi-perfil`.
- Admin demo Pexels: `POST /Admin/demo/pexels/importar-fotos`.
- Auth: `POST /Auth/register`, `POST /Auth/login`.
- Clientes: `GET/POST /Clientes`, `GET/PUT/DELETE /Clientes/{id}`.
- Eventos: `GET/POST /Eventos`, `GET/PUT/DELETE /Eventos/{id}`, `PUT /Eventos/{eventoId}/portada/{fotoId}`.
- Comentarios de eventos: `GET/POST /Eventos/{eventoId}/comentarios`, `PUT/DELETE /Eventos/comentarios/{comentarioId}`.
- Fotos: `GET /Fotos/evento/{eventoId}`, `GET/PUT/DELETE /Fotos/{id}`, `POST /Fotos/storage-key`, `POST /Fotos/storage-keys/bulk`, `POST /Fotos/metadata`, `POST /Fotos/metadata/bulk`.
- Comentarios de fotos: `GET/POST /Fotos/{fotoId}/comentarios`, `PUT/DELETE /Fotos/comentarios/{comentarioId}`.
- Favoritos: `GET /Favoritos/eventos`, `POST/DELETE /Favoritos/eventos/{eventoId}`, `GET /Favoritos/fotos`, `POST/DELETE /Favoritos/fotos/{fotoId}`.
- Pedidos: `GET/POST /Pedidos`, `GET /Pedidos/{id}`.
- Pagos: `POST /Pagos/checkout-pro/preferencias`.
- Descargas: `GET /Descargas/mis-descargas`, `GET /Descargas/{id}`, `POST /Descargas/link`, `POST /Descargas/{id}/regenerar`, `GET /Descargas/admin`.

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
