import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NotificacionesService } from '../../core/services/notificaciones.service';
import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';
import { AdminLayoutComponent } from './admin-layout.component';

describe('AdminLayoutComponent', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            get isAuthenticated(): boolean {
              return true;
            },
            get isAdmin(): boolean {
              return true;
            },
            get isUser(): boolean {
              return false;
            },
            get email(): string {
              return 'admin@example.com';
            },
            get nombre(): string {
              return 'Admin Demo';
            },
            get displayRole(): string {
              return 'Admin';
            },
            clear: vi.fn()
          }
        },
        {
          provide: ThemeService,
          useValue: {
            getTheme: () => 'light',
            toggleTheme: vi.fn()
          }
        },
        {
          provide: NotificacionesService,
          useValue: {
            getMisNotificaciones: () => of([]),
            marcarLeida: () => of(undefined),
            marcarTodasLeidas: () => of(undefined)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
  });

  it('renders the Tabler-style admin sidebar', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.admin-layout .navbar.navbar-vertical.admin-sidebar')).toBeTruthy();
    expect(compiled.querySelector('.admin-layout .page-wrapper')).toBeTruthy();
  });

  it('renders a dedicated scrollable sidebar navigation container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('.admin-sidebar .admin-sidebar-nav');

    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Navegacion admin');
  });

  it('renders the requested navigation groups', () => {
    const text = pageText();

    expect(text).toContain('Principal');
    expect(text).toContain('Ventas');
    expect(text).toContain('Gestión');
    expect(text).toContain('Sitio público');
    expect(text).toContain('Sistema');
  });

  it('renders Bitácora and DevTools links', () => {
    const text = pageText();

    expect(text).toContain('Bitácora');
    expect(text).toContain('DevTools');
  });

  it('keeps admin navigation links under /admin', () => {
    const navItems = fixture.componentInstance.navGroups.flatMap((group) => group.items);

    expect(navItems.every((item) => item.path.startsWith('/admin/'))).toBe(true);
    expect(navItems.map((item) => item.path)).toEqual(
      expect.arrayContaining([
        '/admin/eventos',
        '/admin/fotos',
        '/admin/pedidos',
        '/admin/clientes',
        '/admin/descargas',
        '/admin/bitacora',
        '/admin/dev-tools',
      ]),
    );
  });

  it('toggles the mobile sidebar state', () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Abrir menu administrativo"]'
    ) as HTMLButtonElement;

    expect(fixture.componentInstance.sidebarOpen).toBe(false);
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarOpen).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.admin-sidebar-open')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('.admin-sidebar.is-open')).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarOpen).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('.admin-sidebar.is-open')).toBeFalsy();
  });

  it('closes the mobile sidebar from the backdrop', () => {
    openSidebar();

    const compiled = fixture.nativeElement as HTMLElement;
    const backdrop = compiled.querySelector('.admin-sidebar-backdrop') as HTMLElement;

    expect(backdrop).toBeTruthy();
    expect(backdrop.getAttribute('aria-label')).toBe('Cerrar menu administrativo');
    backdrop.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarOpen).toBe(false);
  });

  it('closes the mobile sidebar when a navigation link is clicked', () => {
    openSidebar();

    const link = (fixture.nativeElement as HTMLElement).querySelector('.admin-sidebar .nav-link') as HTMLElement;

    expect(link).toBeTruthy();
    link.addEventListener('click', (event) => event.preventDefault(), { capture: true });
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarOpen).toBe(false);
  });

  function pageText(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function openSidebar(): void {
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Abrir menu administrativo"]'
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
  }
});
