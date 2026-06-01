import { Routes } from '@angular/router';

import { authChildGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

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
    component: PublicLayoutComponent,
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
    component: MainLayoutComponent,
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
        path: 'admin/pexels/importar-fotos',
        data: { roles: ['Admin'] },
        loadComponent: () => import('./features/admin/pexels-import/pexels-import.component').then((m) => m.PexelsImportComponent)
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
