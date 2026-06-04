import { Routes } from '@angular/router';

import { authChildGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/public-home.component').then((m) => m.PublicHomeComponent)
      },
      {
        path: 'home',
        loadComponent: () => import('./features/public/home/public-home.component').then((m) => m.PublicHomeComponent)
      },
      {
        path: 'portfolio',
        loadComponent: () => import('./features/public/portfolio-list/portfolio-list.component').then((m) => m.PortfolioListComponent)
      },
      {
        path: 'portfolio/:id',
        loadComponent: () => import('./features/public/portfolio-detail/portfolio-detail.component').then((m) => m.PortfolioDetailComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/public/servicios-list/servicios-list.component').then((m) => m.ServiciosListComponent)
      },
      {
        path: 'servicios/:id',
        loadComponent: () => import('./features/public/servicio-detail/servicio-detail.component').then((m) => m.ServicioDetailComponent)
      },
      {
        path: 'promociones',
        loadComponent: () => import('./features/public/promociones-list/promociones-list.component').then((m) => m.PromocionesListComponent)
      },
      {
        path: 'promociones/:id',
        loadComponent: () => import('./features/public/promocion-detail/promocion-detail.component').then((m) => m.PromocionDetailComponent)
      },
      {
        path: 'testimonios',
        loadComponent: () => import('./features/public/testimonios-public/testimonios-public.component').then((m) => m.TestimoniosPublicComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/public/faq/faq-public.component').then((m) => m.FaqPublicComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/public/contacto/contacto-public.component').then((m) => m.ContactoPublicComponent)
      },
      {
        path: 'presupuesto',
        loadComponent: () => import('./features/public/presupuesto-solicitud/presupuesto-solicitud.component').then((m) => m.PresupuestoSolicitudComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'admin/perfil-publico',
        loadComponent: () => import('./features/admin/perfil-publico/perfil-publico.component').then((m) => m.PerfilPublicoComponent)
      },
      {
        path: 'admin/dashboard',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'admin/operaciones',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/operaciones/operaciones-admin.component').then((m) => m.OperacionesAdminComponent)
      },
      {
        path: 'admin/mi-perfil',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/mi-perfil/mi-perfil-admin.component').then((m) => m.MiPerfilAdminComponent)
      },
      {
        path: 'admin/fotos/bulk',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/fotos-bulk/fotos-bulk.component').then((m) => m.FotosBulkComponent)
      },
      {
        path: 'admin/descargas',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/descargas/admin-descargas.component').then((m) => m.AdminDescargasComponent)
      },
      {
        path: 'admin/portfolio',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/portfolio/portfolio-admin.component').then((m) => m.PortfolioAdminComponent)
      },
      {
        path: 'admin/servicios',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/servicios/servicios-admin.component').then((m) => m.ServiciosAdminComponent)
      },
      {
        path: 'admin/faq',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/faq/faq-admin.component').then((m) => m.FaqAdminComponent)
      },
      {
        path: 'admin/presupuestos',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/presupuestos/presupuestos-admin.component').then((m) => m.PresupuestosAdminComponent)
      },
      {
        path: 'admin/presupuestos/:id',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/presupuestos/presupuesto-detail-admin.component').then((m) => m.PresupuestoDetailAdminComponent)
      },
      {
        path: 'admin/agenda',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/agenda/agenda-admin.component').then((m) => m.AgendaAdminComponent)
      },
      {
        path: 'admin/sesiones-privadas',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/sesiones-privadas/sesiones-privadas-admin.component').then((m) => m.SesionesPrivadasAdminComponent)
      },
      {
        path: 'admin/notificaciones',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/notificaciones/notificaciones-admin/notificaciones-admin.component').then((m) => m.NotificacionesAdminComponent)
      },
      {
        path: 'admin/notificaciones/plantillas',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/notificaciones/plantillas-admin/plantillas-admin.component').then((m) => m.PlantillasAdminComponent)
      },
      {
        path: 'admin/notificaciones/:id',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/notificaciones/notificacion-detail-admin/notificacion-detail-admin.component').then((m) => m.NotificacionDetailAdminComponent)
      },
      {
        path: 'admin/pexels/importar-fotos',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/pexels-import/pexels-import.component').then((m) => m.PexelsImportComponent)
      },
      {
        path: 'admin/ventas',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/ventas/ventas-admin.component').then((m) => m.VentasAdminComponent)
      },
      {
        path: 'admin/cupones',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/cupones/cupones-admin.component').then((m) => m.CuponesAdminComponent)
      },
      {
        path: 'admin/promociones',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/promociones/promociones-admin.component').then((m) => m.PromocionesAdminComponent)
      },
      {
        path: 'admin/testimonios',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/testimonios/testimonios-admin.component').then((m) => m.TestimoniosAdminComponent)
      },
      {
        path: 'admin/carritos-abandonados',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/carritos-abandonados/carritos-abandonados-admin.component').then((m) => m.CarritosAbandonadosAdminComponent)
      },
      {
        path: 'admin/reportes/ventas',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/reportes-ventas/reportes-ventas-admin.component').then((m) => m.ReportesVentasAdminComponent)
      },
      {
        path: 'clientes',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/clientes/clientes-list/clientes-list.component').then((m) => m.ClientesListComponent)
      },
      {
        path: 'clientes/mi-perfil',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/clientes/mi-perfil/mi-perfil-cliente.component').then((m) => m.MiPerfilClienteComponent)
      },
      {
        path: 'clientes/nuevo',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent)
      },
      {
        path: 'clientes/editar/:id',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id/historial',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/clientes/cliente-historial/cliente-historial.component').then((m) => m.ClienteHistorialComponent)
      },
      {
        path: 'mi-historial',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/clientes/cliente-historial/cliente-historial.component').then((m) => m.ClienteHistorialComponent)
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/eventos/eventos-list/eventos-list.component').then((m) => m.EventosListComponent)
      },
      {
        path: 'eventos/nuevo',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent)
      },
      {
        path: 'eventos/editar/:id',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent)
      },
      {
        path: 'eventos/:id',
        loadComponent: () => import('./features/eventos/evento-detail/evento-detail.component').then((m) => m.EventoDetailComponent)
      },
      {
        path: 'fotos/evento',
        loadComponent: () => import('./features/fotos/fotos-list/fotos-list.component').then((m) => m.FotosListComponent)
      },
      {
        path: 'fotos/evento/:eventoId',
        loadComponent: () => import('./features/fotos/fotos-list/fotos-list.component').then((m) => m.FotosListComponent)
      },
      {
        path: 'fotos/metadata',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/fotos/foto-form/foto-form.component').then((m) => m.FotoFormComponent)
      },
      {
        path: 'fotos/metadata/nuevo',
        redirectTo: 'fotos/metadata',
        pathMatch: 'full'
      },
      {
        path: 'fotos/editar/:id',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/fotos/foto-form/foto-form.component').then((m) => m.FotoFormComponent)
      },
      {
        path: 'fotos/:id',
        loadComponent: () => import('./features/fotos/foto-detail/foto-detail.component').then((m) => m.FotoDetailComponent)
      },
      {
        path: 'pedidos',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/pedidos/pedidos-list/pedidos-list.component').then((m) => m.PedidosListComponent)
      },
      {
        path: 'pedidos/nuevo',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/pedidos/pedido-form/pedido-form.component').then((m) => m.PedidoFormComponent)
      },
      {
        path: 'pedidos/:id',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/pedidos/pedido-detail/pedido-detail.component').then((m) => m.PedidoDetailComponent)
      },
      {
        path: 'pagos',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/pagos/pagos.component').then((m) => m.PagosComponent)
      },
      {
        path: 'carrito',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/carrito/carrito.component').then((m) => m.CarritoComponent)
      },
      {
        path: 'descargas',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/descargas/descargas.component').then((m) => m.DescargasComponent)
      },
      {
        path: 'descargas/:id',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/descargas/descarga-detail/descarga-detail.component').then((m) => m.DescargaDetailComponent)
      },
      {
        path: 'notificaciones',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/notificaciones/mis-notificaciones/mis-notificaciones.component').then((m) => m.MisNotificacionesComponent)
      },
      {
        path: 'favoritos',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/favoritos/favoritos-list/favoritos-list.component').then((m) => m.FavoritosListComponent)
      },
      {
        path: 'favoritos/eventos',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/favoritos/favoritos-list/favoritos-list.component').then((m) => m.FavoritosListComponent)
      },
      {
        path: 'favoritos/fotos',
        data: { roles: ['Usuario', 'Admin'] },
        loadComponent: () => import('./features/favoritos/favoritos-list/favoritos-list.component').then((m) => m.FavoritosListComponent)
      }
    ]
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
  }
];
