# AGENTS.md

## Alcance

Estas notas aplican a todo el proyecto Angular `galeria-fotos-app`.

## Reglas del proyecto

- Este repositorio es solo frontend. No crear backend ni archivos de ASP.NET Core aqui.
- La API externa se consume desde `environment.apiUrl`, configurada en `http://localhost:5200/api`.
- Mantener el token JWT en `localStorage` mediante `SessionService`.
- Las llamadas HTTP deben pasar por los servicios de `src/app/core/services`.
- Las pantallas nuevas viven en `src/app/features`; el layout compartido vive en `src/app/layout`.
- Conservar los estilos y assets de CaterServ en `public/assets/caterserv`.
- Las rutas de alta, edicion, pagos y descargas requieren usuario autenticado; el modo invitado es solo lectura.

## Verificacion recomendada

- Ejecutar `.\node_modules\.bin\ng.cmd build`.
- Ejecutar `.\node_modules\.bin\ng.cmd test --watch=false`.
