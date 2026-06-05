import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DevToolsPayloadShape } from '../../../core/models/dev-tools.models';
import { DevToolsService } from '../../../core/services/dev-tools.service';
import { DevToolsAdminComponent } from './dev-tools-admin.component';

class DevToolsServiceStub {
  ping = vi.fn(() => of({ ok: true }));
  currentUser = vi.fn(() => of({ email: 'admin@example.com' }));
  correlationId = vi.fn(() => of({ correlationId: 'trace-123' }));
  errorBadRequest = vi.fn(() => throwError(() => new Error('Datos invalidos.')));
  errorUnauthorized = vi.fn(() => throwError(() => new Error('Sesion expirada o esta seccion requiere iniciar sesion.')));
  errorForbidden = vi.fn(() => throwError(() => new Error('No tenes permisos para realizar esta accion.')));
  errorNotFound = vi.fn(() => throwError(() => new Error('No se encontro el recurso solicitado.')));
  errorConflict = vi.fn(() => throwError(() => new Error('La operacion no se pudo completar porque hay un conflicto con el estado actual.')));
  errorExternalDependency = vi.fn(() => throwError(() => new Error('El servicio externo no esta disponible. Intenta nuevamente mas tarde.')));
  errorInternalControlled = vi.fn(() => throwError(() => new Error('Error del servidor. Intenta nuevamente mas tarde.')));
  errorThrow = vi.fn(() => throwError(() => new Error('Error del servidor. Intenta nuevamente mas tarde.')));
  rateLimitProbe = vi.fn(() => throwError(() => new Error('Demasiados intentos. Proba nuevamente en unos minutos.')));
  createAuditTestEntry = vi.fn(() => of({ correlationId: 'audit-1' }));
  payloadNullData = vi.fn(() => of(null as unknown as DevToolsPayloadShape));
  payloadMissingFields = vi.fn(() => of({ nombre: 'Demo' }));
  payloadWrongShape = vi.fn(() => of([{ unexpected: true }] as unknown as DevToolsPayloadShape));
  payloadNullItems = vi.fn(() => of({ items: null }));
  payloadInvalidDate = vi.fn(() => of({ fecha: 'not-a-date' }));
  payloadSensitiveMetadata = vi.fn(() => of({
    metadata: {
      token: 'abc123',
      password: 'super-secret',
      storageKey: 'private/original/photo.jpg',
      visible: 'valor publico'
    }
  }));
  payloadEmptyList = vi.fn(() => of({ items: [] }));
  payloadLargeList = vi.fn(() => of({ items: Array.from({ length: 25 }, (_, index) => ({ id: index })) }));
}

describe('DevToolsAdminComponent', () => {
  let fixture: ComponentFixture<DevToolsAdminComponent>;
  let service: DevToolsServiceStub;

  beforeEach(async () => {
    service = new DevToolsServiceStub();

    await TestBed.configureTestingModule({
      imports: [DevToolsAdminComponent],
      providers: [
        { provide: DevToolsService, useValue: service }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DevToolsAdminComponent);
    fixture.detectChanges();
  });

  it('renders the main diagnostic buttons', () => {
    const text = pageText();

    expect(text).toContain('Ping');
    expect(text).toContain('400 Bad Request');
    expect(text).toContain('Sensitive metadata');
    expect(text).toContain('Crear entrada test');
  });

  it('sanitizes sensitive metadata before rendering it', () => {
    clickButton('Sensitive metadata');

    const text = pageText();

    expect(text).toContain('Dato tecnico oculto');
    expect(text).toContain('valor publico');
    expect(text).not.toContain('abc123');
    expect(text).not.toContain('super-secret');
    expect(text).not.toContain('private/original/photo.jpg');
  });

  it('shows a clear unavailable message when an endpoint returns 404', () => {
    service.ping.mockReturnValue(throwError(() => new Error('No se encontro el recurso solicitado.')));

    clickButton('Ping');

    const text = pageText();

    expect(text).toContain('HTTP 404');
    expect(text).toContain('DevTools no esta disponible');
  });

  it('shows a safe message for controlled 500 errors', () => {
    clickButton('500 seguro');

    const text = pageText();

    expect(text).toContain('HTTP 500');
    expect(text).toContain('Error del servidor. Intenta nuevamente mas tarde.');
  });

  function clickButton(label: string): void {
    const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes(label)) as HTMLButtonElement | undefined;

    expect(button).toBeTruthy();
    button?.click();
    fixture.detectChanges();
  }

  function pageText(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }
});
