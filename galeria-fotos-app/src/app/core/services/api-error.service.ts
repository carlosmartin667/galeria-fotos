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

    if (error.status === 403) {
      return 'No tenes permisos para realizar esta accion.';
    }

    if (error.status === 404) {
      return 'No se encontro el recurso solicitado.';
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

    const body = error.error as {
      title?: string;
      message?: string;
      detail?: string;
      error?: string;
      errors?: Record<string, unknown>;
    };
    const validationErrors = body.errors
      ? Object.entries(body.errors)
        .flatMap(([field, value]) => this.normalizeErrorValue(field, value))
        .filter(Boolean)
        .join(' ')
      : '';

    return validationErrors || body.message || body.detail || body.error || body.title || this.stringifyBody(error.error);
  }

  private normalizeErrorValue(field: string, value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => `${field}: ${String(item)}`);
    }

    if (typeof value === 'string') {
      return [`${field}: ${value}`];
    }

    if (value && typeof value === 'object') {
      return [`${field}: ${JSON.stringify(value)}`];
    }

    return value == null ? [] : [`${field}: ${String(value)}`];
  }

  private stringifyBody(body: unknown): string {
    try {
      return JSON.stringify(body);
    } catch {
      return '';
    }
  }
}
