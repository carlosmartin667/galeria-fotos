import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  const service = new ApiErrorService();

  it('maps conflict, rate limit and external dependency errors', () => {
    expect(service.toMessage(httpError(409))).toContain('conflicto');
    expect(service.toMessage(httpError(429))).toContain('Demasiados intentos');
    expect(service.toMessage(httpError(503))).toContain('servicio externo');
  });

  it('does not expose raw bodies or stack traces', () => {
    const message = service.toMessage(httpError(400, {
      detail: 'System.Exception: fallo en at Service.Method() stacktrace token=abc',
      raw: { storageKey: 'private-key' }
    }));

    expect(message).toBe('Datos invalidos. Revisa los campos e intenta nuevamente.');
    expect(message).not.toContain('storageKey');
    expect(message).not.toContain('System.Exception');
  });

  it('keeps safe validation messages', () => {
    const message = service.toMessage(httpError(400, {
      errors: {
        nombre: ['El nombre es requerido.'],
        metadata: [{ token: 'abc' }]
      }
    }));

    expect(message).toContain('nombre: El nombre es requerido.');
    expect(message).toContain('metadata: dato invalido.');
    expect(message).not.toContain('token');
  });
});

function httpError(status: number, error?: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error });
}
