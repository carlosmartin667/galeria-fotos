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
    path: 'promociones',
    renderMode: RenderMode.Server
  },
  {
    path: 'promociones/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'testimonios',
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
    path: 'presupuesto',
    renderMode: RenderMode.Server
  },
  {
    path: 'disponibilidad',
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
    path: 'admin',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/perfil-publico',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/mi-perfil',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/operaciones',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/dev-tools',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/bitacora',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/descargas',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/descargas/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/eventos',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/eventos/nuevo',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/eventos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/eventos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/evento',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/evento/:eventoId',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/metadata',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/metadata/nuevo',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/fotos/bulk',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/pedidos',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/pedidos/nuevo',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/pedidos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/clientes',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/clientes/nuevo',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/clientes/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/clientes/:id/historial',
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
    path: 'admin/presupuestos',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/presupuestos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/agenda',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/sesiones-privadas',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/notificaciones',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/notificaciones/plantillas',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/notificaciones/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/pexels/importar-fotos',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/ventas',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/cupones',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/promociones',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/testimonios',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/carritos-abandonados',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/reportes/ventas',
    renderMode: RenderMode.Server
  },
  {
    path: 'clientes/:id/historial',
    renderMode: RenderMode.Server
  },
  {
    path: 'mi-historial',
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
    path: 'carrito',
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
    path: 'notificaciones',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
