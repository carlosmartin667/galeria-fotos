import { Route } from '@angular/router';

import { routes } from './app.routes';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

describe('app admin routes', () => {
  it('keeps /admin/bitacora under AdminLayout with Admin role', async () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const bitacoraRoute = adminRoute?.children?.find((route) => route.path === 'bitacora');
    const loadedLayout = await adminRoute?.loadComponent?.();

    expect(loadedLayout).toBe(AdminLayoutComponent);
    expect(adminRoute?.data?.['roles']).toEqual(['Admin']);
    expect(bitacoraRoute?.data?.['roles']).toEqual(['Admin']);
  });

  it('keeps core admin pages under AdminLayout with Admin role', async () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const loadedLayout = await adminRoute?.loadComponent?.();
    const adminChildren = adminRoute?.children ?? [];

    expect(loadedLayout).toBe(AdminLayoutComponent);
    for (const path of ['dashboard', 'bitacora', 'dev-tools', 'ventas']) {
      const child = adminChildren.find((route) => route.path === path);
      expect(child, path).toBeTruthy();
      expect(child?.data?.['roles'], path).toEqual(['Admin']);
    }
  });

  it('declares notification templates before admin notification detail', () => {
    const adminChildren = routes.find((route) => route.path === 'admin')?.children ?? [];
    const plantillasIndex = routeIndex(adminChildren, 'notificaciones/plantillas');
    const detailIndex = routeIndex(adminChildren, 'notificaciones/:id');

    expect(plantillasIndex).toBeGreaterThanOrEqual(0);
    expect(detailIndex).toBeGreaterThanOrEqual(0);
    expect(plantillasIndex).toBeLessThan(detailIndex);
  });

  it('keeps shared management screens available under AdminLayout', () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const adminChildren = adminRoute?.children ?? [];
    const expectedAdminAliases = [
      'eventos',
      'eventos/nuevo',
      'eventos/editar/:id',
      'eventos/:id',
      'fotos',
      'fotos/evento',
      'fotos/evento/:eventoId',
      'fotos/metadata',
      'fotos/editar/:id',
      'fotos/:id',
      'pedidos',
      'pedidos/nuevo',
      'pedidos/:id',
      'clientes',
      'clientes/nuevo',
      'clientes/editar/:id',
      'clientes/:id/historial',
      'descargas/:id',
    ];

    for (const path of expectedAdminAliases) {
      const child = adminChildren.find((route) => route.path === path);
      expect(child, path).toBeTruthy();
      expect(child?.data?.['roles'], path).toEqual(['Admin']);
    }
  });

  it('redirects legacy admin management routes away from MainLayout', () => {
    const mainChildren = mainLayoutChildren();
    const redirects = new Map(
      [
        'clientes',
        'clientes/nuevo',
        'clientes/editar/:id',
        'clientes/:id/historial',
        'eventos/nuevo',
        'eventos/editar/:id',
        'fotos/metadata',
        'fotos/metadata/nuevo',
        'fotos/editar/:id',
      ].map((path) => [path, mainChildren.find((route) => route.path === path)?.redirectTo]),
    );

    for (const [path, redirectTo] of redirects) {
      expect(redirectTo, path).toBeTruthy();
      expect(String(redirectTo), path).toMatch(/^\/admin\//);
    }
  });

  it('does not keep Admin role routes under MainLayout', () => {
    const mainChildren = mainLayoutChildren();
    const adminRoleRoutes = mainChildren.filter((route) => {
      const roles = route.data?.['roles'];
      return Array.isArray(roles) && roles.includes('Admin');
    });

    expect(adminRoleRoutes.map((route) => route.path)).toEqual([]);
  });

  function routeIndex(items: Route[], path: string): number {
    return items.findIndex((route) => route.path === path);
  }

  function mainLayoutChildren(): Route[] {
    return routes.find((route) => route.path === '' && route.canActivateChild)?.children ?? [];
  }
});
