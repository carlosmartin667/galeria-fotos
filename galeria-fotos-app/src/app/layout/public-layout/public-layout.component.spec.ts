import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppRole } from '../../core/models/auth.models';
import { NotificacionesService } from '../../core/services/notificaciones.service';
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
        },
        {
          provide: NotificacionesService,
          useValue: {
            getMisNotificaciones: () => of([])
          }
        }
      ]
    }).compileComponents();
  });

  it('shows public navigation and hides private/admin links for guests', () => {
    fixture = createWithRole('Invitado', false);

    const text = pageText();

    expect(text).toContain('Portfolio');
    expect(text).toContain('Servicios');
    expect(text).toContain('Presupuesto');
    expect(text).toContain('Disponibilidad');
    expect(text).not.toContain('Dashboard admin');
    expect(text).not.toContain('Bitacora');
    expect(text).not.toContain('Mis descargas');
  });

  it('shows user links without admin links for Usuario', () => {
    fixture = createWithRole('Usuario', true);

    const text = pageText();

    expect(text).toContain('Pedidos');
    expect(text).toContain('Mis descargas');
    expect(text).toContain('Mi historial');
    expect(text).not.toContain('Dashboard admin');
    expect(text).not.toContain('Bitacora');
    expect(text).not.toContain('Resumen ventas');
  });

  it('shows admin footer links only for Admin', () => {
    fixture = createWithRole('Admin', true);

    const text = pageText();

    expect(text).toContain('Dashboard admin');
    expect(text).toContain('Operaciones');
    expect(text).toContain('Bitacora');
    expect(text).toContain('Resumen ventas');
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
});
