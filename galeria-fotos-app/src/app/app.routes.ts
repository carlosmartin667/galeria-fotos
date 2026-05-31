import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
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
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes-list/clientes-list.component').then((m) => m.ClientesListComponent)
      },
      {
        path: 'clientes/nuevo',
        data: { requiresUser: true },
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent)
      },
      {
        path: 'clientes/editar/:id',
        data: { requiresUser: true },
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent)
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/eventos/eventos-list/eventos-list.component').then((m) => m.EventosListComponent)
      },
      {
        path: 'eventos/nuevo',
        data: { requiresUser: true },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent)
      },
      {
        path: 'eventos/editar/:id',
        data: { requiresUser: true },
        loadComponent: () => import('./features/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent)
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
        path: 'fotos/metadata/nuevo',
        data: { requiresUser: true },
        loadComponent: () => import('./features/fotos/foto-form/foto-form.component').then((m) => m.FotoFormComponent)
      },
      {
        path: 'fotos/editar/:id',
        data: { requiresUser: true },
        loadComponent: () => import('./features/fotos/foto-form/foto-form.component').then((m) => m.FotoFormComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/pedidos/pedidos-list/pedidos-list.component').then((m) => m.PedidosListComponent)
      },
      {
        path: 'pedidos/nuevo',
        data: { requiresUser: true },
        loadComponent: () => import('./features/pedidos/pedido-form/pedido-form.component').then((m) => m.PedidoFormComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/pedidos/pedido-detail/pedido-detail.component').then((m) => m.PedidoDetailComponent)
      },
      {
        path: 'pagos',
        data: { requiresUser: true },
        loadComponent: () => import('./features/pagos/pagos.component').then((m) => m.PagosComponent)
      },
      {
        path: 'descargas',
        data: { requiresUser: true },
        loadComponent: () => import('./features/descargas/descargas.component').then((m) => m.DescargasComponent)
      }
    ]
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
  }
];
