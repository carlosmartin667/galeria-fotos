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

## Endpoints principales

- Admin: `GET /Admin/perfil-publico`, `GET /Admin/mi-perfil`, `PUT /Admin/mi-perfil`.
- Auth: `POST /Auth/register`, `POST /Auth/login`.
- Clientes: `GET/POST /Clientes`, `GET/PUT/DELETE /Clientes/{id}`.
- Eventos: `GET/POST /Eventos`, `GET/PUT/DELETE /Eventos/{id}`.
- Comentarios de eventos: `GET/POST /Eventos/{eventoId}/comentarios`, `PUT/DELETE /Eventos/comentarios/{comentarioId}`.
- Fotos: `GET /Fotos/evento/{eventoId}`, `GET/PUT/DELETE /Fotos/{id}`, `POST /Fotos/storage-key`, `POST /Fotos/metadata`.
- Comentarios de fotos: `GET/POST /Fotos/{fotoId}/comentarios`, `PUT/DELETE /Fotos/comentarios/{comentarioId}`.
- Favoritos: `GET /Favoritos/eventos`, `POST/DELETE /Favoritos/eventos/{eventoId}`, `GET /Favoritos/fotos`, `POST/DELETE /Favoritos/fotos/{fotoId}`.
- Pedidos: `GET/POST /Pedidos`, `GET /Pedidos/{id}`.
- Pagos: `POST /Pagos/checkout-pro/preferencias`.
- Descargas: `POST /Descargas/link`.

## Verificacion recomendada

- Ejecutar `.\node_modules\.bin\ng.cmd build`.
- Si los tests estan configurados, ejecutar `.\node_modules\.bin\ng.cmd test --watch=false`.
