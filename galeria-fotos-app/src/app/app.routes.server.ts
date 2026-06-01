import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'home',
    renderMode: RenderMode.Server
  },
  {
    path: 'portfolio',
    renderMode: RenderMode.Server
  },
  {
    path: 'portfolio/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'servicios',
    renderMode: RenderMode.Server
  },
  {
    path: 'servicios/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'faq',
    renderMode: RenderMode.Server
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Server
  },
  {
    path: 'clientes/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'clientes/mi-perfil',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/mi-perfil',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/descargas',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/portfolio',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/servicios',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/faq',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/pexels/importar-fotos',
    renderMode: RenderMode.Server
  },
  {
    path: 'eventos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'eventos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'fotos/evento/:eventoId',
    renderMode: RenderMode.Server
  },
  {
    path: 'fotos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'fotos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'pedidos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'descargas',
    renderMode: RenderMode.Server
  },
  {
    path: 'descargas/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
