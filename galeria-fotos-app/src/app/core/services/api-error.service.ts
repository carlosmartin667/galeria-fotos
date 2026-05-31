import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  toMessage(error: unknown): string {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return 'La API tardo demasiado en responder. Revisa que el backend este disponible.';
    }

    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrio un error inesperado.';
    }

    if (error.status === 0) {
      return 'API no disponible. Verifica que http://localhost:5200/api este levantada.';
    }

    if (error.status === 400) {
      return this.messageFromBody(error) || 'Datos invalidos. Revisa los campos e intenta nuevamente.';
    }

    if (error.status === 401) {
      return 'Sesion expirada o esta seccion requiere iniciar sesion.';
    }

    if (error.status === 500) {
      return 'Error del servidor. Intenta nuevamente mas tarde.';
    }

    return this.messageFromBody(error) || `La API respondio con estado ${error.status}.`;
  }

  private messageFromBody(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (!error.error || typeof error.error !== 'object') {
      return '';
    }

    const body = error.error as { title?: string; message?: string; errors?: Record<string, string[]> };
    const validationErrors = body.errors ? Object.values(body.errors).flat().filter(Boolean).join(' ') : '';
    return validationErrors || body.message || body.title || '';
  }
}
