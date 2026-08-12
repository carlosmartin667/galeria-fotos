import { Component, DestroyRef, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NotificationBellComponent],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  readonly session = inject(SessionService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  sidebarOpen = false;
  readonly displayName = computed(() => this.session.nombre || this.session.email || 'Admin');

  readonly navGroups: AdminNavGroup[] = [
    {
      label: 'Principal',
      items: [
        { label: 'Dashboard Admin', path: '/admin/dashboard', icon: 'bi-speedometer2' },
        { label: 'Operaciones', path: '/admin/operaciones', icon: 'bi-kanban' },
      ],
    },
    {
      label: 'Ventas',
      items: [
        { label: 'Resumen ventas', path: '/admin/ventas', icon: 'bi-graph-up-arrow' },
        { label: 'Reportes ventas', path: '/admin/reportes/ventas', icon: 'bi-bar-chart-line' },
        { label: 'Cupones', path: '/admin/cupones', icon: 'bi-ticket-perforated' },
        { label: 'Promociones', path: '/admin/promociones', icon: 'bi-tags' },
        { label: 'Testimonios', path: '/admin/testimonios', icon: 'bi-chat-quote' },
        { label: 'Carritos abandonados', path: '/admin/carritos-abandonados', icon: 'bi-cart-x' },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { label: 'Eventos', path: '/admin/eventos', icon: 'bi-calendar-event' },
        { label: 'Fotos', path: '/admin/fotos', icon: 'bi-image' },
        { label: 'Fotos bulk', path: '/admin/fotos/bulk', icon: 'bi-images' },
        { label: 'Pedidos', path: '/admin/pedidos', icon: 'bi-receipt' },
        { label: 'Descargas', path: '/admin/descargas', icon: 'bi-download' },
        { label: 'Clientes', path: '/admin/clientes', icon: 'bi-people' },
        { label: 'Sesiones privadas', path: '/admin/sesiones-privadas', icon: 'bi-lock' },
        { label: 'Agenda', path: '/admin/agenda', icon: 'bi-calendar-week' },
        { label: 'Presupuestos', path: '/admin/presupuestos', icon: 'bi-file-earmark-text' },
      ],
    },
    {
      label: 'Sitio público',
      items: [
        { label: 'Portfolio', path: '/admin/portfolio', icon: 'bi-grid' },
        { label: 'Servicios', path: '/admin/servicios', icon: 'bi-camera' },
        { label: 'FAQ', path: '/admin/faq', icon: 'bi-question-circle' },
        { label: 'Perfil fotógrafa', path: '/admin/mi-perfil', icon: 'bi-person-badge' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { label: 'Notificaciones', path: '/admin/notificaciones', icon: 'bi-bell' },
        {
          label: 'Plantillas',
          path: '/admin/notificaciones/plantillas',
          icon: 'bi-envelope-paper',
        },
        { label: 'Bitácora', path: '/admin/bitacora', icon: 'bi-shield-check' },
        { label: 'DevTools', path: '/admin/dev-tools', icon: 'bi-tools' },
      ],
    },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeSidebar());
  }

  currentTitle(): string {
    const url = this.router.url.split('?')[0];
    return (
      this.navGroups
        .flatMap((group) => group.items)
        .sort((a, b) => b.path.length - a.path.length)
        .find((item) => url === item.path || url.startsWith(`${item.path}/`))?.label ??
      'Administracion'
    );
  }

  isActive(path: string): boolean {
    const url = this.router.url.split('?')[0].replace(/\/$/, '');
    if (path === '/admin/notificaciones') {
      if (url.startsWith('/admin/notificaciones/plantillas')) {
        return false;
      }
      return url === path || /^\/admin\/notificaciones\/[^/]+$/.test(url);
    }

    if (path === '/admin/fotos' && url.startsWith('/admin/fotos/bulk')) {
      return false;
    }

    return url === path || url.startsWith(`${path}/`);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  trackGroup(_index: number, group: AdminNavGroup): string {
    return group.label;
  }

  trackItem(_index: number, item: AdminNavItem): string {
    return item.path;
  }
}
