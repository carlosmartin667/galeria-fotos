import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NotificacionesService } from '../../core/services/notificaciones.service';
import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            get isAuthenticated(): boolean {
              return true;
            },
            get isAdmin(): boolean {
              return false;
            },
            get isUser(): boolean {
              return true;
            },
            get email(): string {
              return 'cliente@example.com';
            },
            get nombre(): string {
              return 'Cliente Demo';
            },
            get displayRole(): string {
              return 'Cliente';
            },
            clear: vi.fn(),
          },
        },
        {
          provide: ThemeService,
          useValue: {
            getTheme: () => 'light',
            toggleTheme: vi.fn(),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            getMisNotificaciones: () => of([]),
            marcarLeida: () => of(undefined),
            marcarTodasLeidas: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
  });

  it('does not render admin navigation links', () => {
    const anchors = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'));
    const hrefs = anchors.map((anchor) => anchor.getAttribute('href') ?? '');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(hrefs.some((href) => href.startsWith('/admin'))).toBe(false);
    expect(text).not.toContain('Bitacora');
    expect(text).not.toContain('Bitácora');
    expect(text).not.toContain('DevTools');
    expect(text).not.toContain('Administracion');
    expect(text).not.toContain('Administración');
  });

  it('does not render the legacy sidebar for Cliente layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-sidebar')).toBeFalsy();
    expect(compiled.querySelector('.app-sidebar')).toBeFalsy();
  });

  it('does not render public site navigation inside Cliente layout', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Portfolio');
    expect(text).not.toContain('Servicios');
    expect(text).not.toContain('Presupuesto');
    expect(text).not.toContain('Testimonios');
    expect(text).not.toContain('Disponibilidad');
    expect(text).not.toContain('FAQ');
    expect(text).not.toContain('Contacto');
  });

  it('renders Cliente top navigation links', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Dashboard');
    expect(text).toContain('Eventos');
    expect(text).toContain('Fotos');
    expect(text).toContain('Carrito');
    expect(text).toContain('Pedidos');
    expect(text).toContain('Descargas');
    expect(text).toContain('Favoritos');
    expect(text).toContain('Historial');
    expect(text).toContain('Notificaciones');
    expect(text).toContain('Perfil');
  });

  it('renders responsive menu control and truncates user identity', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('[aria-label="Abrir menu"]') as HTMLButtonElement;
    const userName = compiled.querySelector('.app-nav-name');

    expect(menuButton).toBeTruthy();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(userName).toBeTruthy();
    expect(userName?.classList.contains('user-email')).toBe(true);
  });

  it('toggles the mobile navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('[aria-label="Abrir menu"]') as HTMLButtonElement;
    const links = compiled.querySelector('.main-navbar-links');

    expect(links?.classList.contains('is-open')).toBe(false);

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(links?.classList.contains('is-open')).toBe(true);

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(links?.classList.contains('is-open')).toBe(false);
  });
});
