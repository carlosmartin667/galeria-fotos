import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRole } from '../../core/models/auth.models';
import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';
import { PublicLayoutComponent } from './public-layout.component';

describe('PublicLayoutComponent', () => {
  let fixture: ComponentFixture<PublicLayoutComponent>;
  let state: { role: AppRole; authenticated: boolean };

  beforeEach(async () => {
    state = { role: 'Invitado', authenticated: false };

    await TestBed.configureTestingModule({
      imports: [PublicLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            get isAuthenticated(): boolean {
              return state.authenticated;
            },
            get isUser(): boolean {
              return state.role === 'Usuario';
            },
            get isAdmin(): boolean {
              return state.role === 'Admin';
            },
            get displayRole(): string {
              return state.role === 'Usuario' ? 'Cliente' : state.role === 'Admin' ? 'Admin' : 'Modo invitado';
            }
          }
        },
        {
          provide: ThemeService,
          useValue: {
            getTheme: () => 'light',
            toggleTheme: vi.fn()
          }
        }
      ]
    }).compileComponents();
  });

  it('shows public navigation and hides private/admin links for guests', () => {
    fixture = createWithRole('Invitado', false);

    const text = pageText();
    const hrefs = pageHrefs();

    expect(text).toContain('Portfolio');
    expect(text).toContain('Servicios');
    expect(text).toContain('Presupuesto');
    expect(text).toContain('Disponibilidad');
    expect(text).toContain('Entrar');
    expect(text).toContain('Registro');
    expect(text).not.toContain('Dashboard admin');
    expect(text).not.toContain('Bitacora');
    expect(hrefs).not.toContain('/eventos');
    expect(hrefs).not.toContain('/fotos/evento');
    expect(text).not.toContain('Pedidos');
    expect(text).not.toContain('Descargas');
    expect(text).not.toContain('Favoritos');
    expect(text).not.toContain('Historial');
    expect(text).not.toContain('Notificaciones');
  });

  it('keeps private user links out of the public layout for Usuario', () => {
    fixture = createWithRole('Usuario', true);

    const text = pageText();
    const directPublicHrefs = directPublicNavHrefs();

    expect(text).toContain('Mi cuenta');
    expect(text).toContain('Panel');
    expect(directPublicHrefs).not.toContain('/eventos');
    expect(directPublicHrefs).not.toContain('/fotos/evento');
    expect(directPublicHrefs).not.toContain('/pedidos');
    expect(directPublicHrefs).not.toContain('/descargas');
    expect(directPublicHrefs).not.toContain('/mi-historial');
    expect(directPublicHrefs).not.toContain('/notificaciones');
    expect(text).not.toContain('Dashboard admin');
    expect(text).not.toContain('Bitacora');
    expect(text).not.toContain('Resumen ventas');
  });

  it('links Usuario panel to the cliente dashboard', () => {
    fixture = createWithRole('Usuario', true);

    const panel = (fixture.nativeElement as HTMLElement).querySelector('.public-panel-button');

    expect(panel?.getAttribute('href')).toBe('/dashboard');
  });

  it('keeps admin links out of the public layout for Admin', () => {
    fixture = createWithRole('Admin', true);

    const text = pageText();
    const hrefs = pageHrefs();

    expect(text).toContain('Panel');
    expect(hrefs).toContain('/admin/dashboard');
    expect(text).not.toContain('Dashboard admin');
    expect(text).not.toContain('Operaciones');
    expect(text).not.toContain('Bitacora');
    expect(text).not.toContain('Resumen ventas');
  });

  it('toggles the mobile public navigation', () => {
    fixture = createWithRole('Invitado', false);

    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('[aria-label="Abrir menu"]') as HTMLButtonElement;
    const links = compiled.querySelector('.public-nav-links');

    expect(menuButton).toBeTruthy();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(links?.classList.contains('is-open')).toBe(false);

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(links?.classList.contains('is-open')).toBe(true);
  });

  function createWithRole(role: AppRole, authenticated: boolean): ComponentFixture<PublicLayoutComponent> {
    state = { role, authenticated };
    const componentFixture = TestBed.createComponent(PublicLayoutComponent);
    componentFixture.detectChanges();
    return componentFixture;
  }

  function pageText(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function pageHrefs(): string[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map(
      (anchor) => anchor.getAttribute('href') ?? ''
    );
  }

  function directPublicNavHrefs(): string[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.public-nav-links > a')).map(
      (anchor) => anchor.getAttribute('href') ?? ''
    );
  }
});
