import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { redactSensitiveText } from '../utils/sensitive-text';

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

    if (error.status === 409) {
      return this.messageFromBody(error) || 'La operacion no se pudo completar porque hay un conflicto con el estado actual.';
    }

    if (error.status === 429) {
      return 'Demasiados intentos. Proba nuevamente en unos minutos.';
    }

    if (error.status === 500) {
      return 'Error del servidor. Intenta nuevamente mas tarde.';
    }

    if (error.status === 502 || error.status === 503) {
      return 'El servicio externo no esta disponible. Intenta nuevamente mas tarde.';
    }

    return this.messageFromBody(error) || `La API respondio con estado ${error.status}.`;
  }

  private messageFromBody(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return this.safeMessage(error.error);
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

    return validationErrors
      || this.safeMessage(body.message)
      || this.safeMessage(body.error)
      || this.safeMessage(body.detail)
      || this.safeMessage(body.title);
  }

  private normalizeErrorValue(field: string, value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => {
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          const message = this.safeMessage(`${field}: ${String(item)}`);
          return message ? [message] : [];
        }

        return [`${field}: dato invalido.`];
      });
    }

    if (typeof value === 'string') {
      const message = this.safeMessage(`${field}: ${value}`);
      return message ? [message] : [];
    }

    if (value && typeof value === 'object') {
      return [`${field}: dato invalido.`];
    }

    const message = value == null ? '' : this.safeMessage(`${field}: ${String(value)}`);
    return message ? [message] : [];
  }

  private safeMessage(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = redactSensitiveText(value).trim();

    if (!trimmed || trimmed.length > 300 || this.looksUnsafe(trimmed)) {
      return '';
    }

    return trimmed;
  }

  private looksUnsafe(value: string): boolean {
    const normalized = value.toLowerCase();
    return [
      'stacktrace',
      'stack trace',
      'exception',
      ' at ',
      'system.',
      'microsoft.',
      '<html',
      '<body',
      'traceid',
      'storagekey',
      'marcaaguastoragekey',
      'bearer ',
      'password',
      'secret'
    ].some((part) => normalized.includes(part));
  }
}
