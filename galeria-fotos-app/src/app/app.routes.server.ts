import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'clientes/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'eventos/editar/:id',
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
    path: 'pedidos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
