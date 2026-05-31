import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  toMessage(error: unknown): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrio un error inesperado.';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que https://localhost:5200 este levantada y que el certificado local sea valido.';
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const body = error.error as { title?: string; message?: string; errors?: Record<string, string[]> };
      const validationErrors = body.errors
        ? Object.values(body.errors).flat().filter(Boolean).join(' ')
        : '';

      return validationErrors || body.message || body.title || `La API respondio con estado ${error.status}.`;
    }

    return `La API respondio con estado ${error.status}.`;
  }
}
