import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { Observable, catchError, finalize, of } from 'rxjs';

import { DevToolsAction, DevToolsPayloadShape, DevToolsRunResult } from '../../../core/models/dev-tools.models';
import { DevToolsService } from '../../../core/services/dev-tools.service';
import { sanitizeMetadata } from '../../../core/utils/sensitive-text';

@Component({
  selector: 'app-dev-tools-admin',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dev-tools-admin.component.html',
  styleUrl: './dev-tools-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevToolsAdminComponent {
  private readonly devTools = inject(DevToolsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loadingKey = '';
  lastResult: DevToolsRunResult | null = null;

  readonly infoActions: DevToolsAction[] = [
    { key: 'ping', label: 'Ping', endpoint: 'GET /dev-tools/ping', category: 'info', expectedStatus: 200 },
    { key: 'currentUser', label: 'Usuario actual', endpoint: 'GET /dev-tools/current-user', category: 'info', expectedStatus: 200 },
    { key: 'correlationId', label: 'Correlation ID', endpoint: 'GET /dev-tools/correlation-id', category: 'info', expectedStatus: 200 }
  ];

  readonly errorActions: DevToolsAction[] = [
    { key: 'badRequest', label: '400 Bad Request', endpoint: 'GET /dev-tools/errors/bad-request', category: 'errors', expectedStatus: 400 },
    { key: 'unauthorized', label: '401 Unauthorized', endpoint: 'GET /dev-tools/errors/unauthorized', category: 'errors', expectedStatus: 401, danger: true },
    { key: 'forbidden', label: '403 Forbidden', endpoint: 'GET /dev-tools/errors/forbidden', category: 'errors', expectedStatus: 403 },
    { key: 'notFound', label: '404 Not Found', endpoint: 'GET /dev-tools/errors/not-found', category: 'errors', expectedStatus: 404 },
    { key: 'conflict', label: '409 Conflict', endpoint: 'GET /dev-tools/errors/conflict', category: 'errors', expectedStatus: 409 },
    { key: 'externalDependency', label: '502/503 dependencia', endpoint: 'GET /dev-tools/errors/external-dependency', category: 'errors', expectedStatus: 503 },
    { key: 'internalControlled', label: '500 controlado', endpoint: 'GET /dev-tools/errors/internal-controlled', category: 'errors', expectedStatus: 500 },
    { key: 'throw', label: '500 seguro', endpoint: 'GET /dev-tools/errors/throw', category: 'errors', expectedStatus: 500 },
    { key: 'rateLimit', label: 'Rate limit probe', endpoint: 'GET /dev-tools/rate-limit/probe', category: 'errors', expectedStatus: 429 }
  ];

  readonly payloadActions: DevToolsAction[] = [
    { key: 'nullData', label: 'Data null', endpoint: 'GET /dev-tools/payloads/null-data', category: 'payloads', expectedStatus: 200 },
    { key: 'missingFields', label: 'Missing fields', endpoint: 'GET /dev-tools/payloads/missing-fields', category: 'payloads', expectedStatus: 200 },
    { key: 'wrongShape', label: 'Wrong shape', endpoint: 'GET /dev-tools/payloads/wrong-shape', category: 'payloads', expectedStatus: 200 },
    { key: 'nullItems', label: 'Items null', endpoint: 'GET /dev-tools/payloads/null-items', category: 'payloads', expectedStatus: 200 },
    { key: 'invalidDate', label: 'Invalid date', endpoint: 'GET /dev-tools/payloads/invalid-date', category: 'payloads', expectedStatus: 200 },
    { key: 'sensitiveMetadata', label: 'Sensitive metadata', endpoint: 'GET /dev-tools/payloads/sensitive-metadata', category: 'payloads', expectedStatus: 200 },
    { key: 'emptyList', label: 'Empty list', endpoint: 'GET /dev-tools/payloads/empty-list', category: 'payloads', expectedStatus: 200 },
    { key: 'largeList', label: 'Large list', endpoint: 'GET /dev-tools/payloads/large-list', category: 'payloads', expectedStatus: 200 }
  ];

  readonly auditActions: DevToolsAction[] = [
    { key: 'auditEntry', label: 'Crear entrada test', endpoint: 'POST /dev-tools/audit/test-entry', category: 'audit', expectedStatus: 200 }
  ];

  runAction(action: DevToolsAction): void {
    this.loadingKey = action.key;
    this.lastResult = null;

    this.callAction(action).pipe(
      catchError((error: unknown) => {
        this.lastResult = this.errorResult(action, error);
        return of(null);
      }),
      finalize(() => {
        this.loadingKey = '';
        this.cdr.markForCheck();
      })
    ).subscribe((payload) => {
      if (payload !== null) {
        this.lastResult = this.successResult(action, payload);
      } else if (action.key === 'nullData' && !this.lastResult) {
        this.lastResult = this.successResult(action, null);
      }

      this.cdr.markForCheck();
    });
  }

  trackAction(_index: number, action: DevToolsAction): string {
    return action.key;
  }

  statusClass(result: DevToolsRunResult | null): string {
    if (!result) {
      return 'bg-secondary';
    }

    if (result.status >= 200 && result.status < 300) {
      return 'bg-success';
    }

    if (result.status === 401 || result.status === 403 || result.status === 404) {
      return 'bg-warning text-dark';
    }

    return 'bg-danger';
  }

  private callAction(action: DevToolsAction): Observable<DevToolsPayloadShape> {
    switch (action.key) {
      case 'ping':
        return this.devTools.ping();
      case 'currentUser':
        return this.devTools.currentUser();
      case 'correlationId':
        return this.devTools.correlationId();
      case 'badRequest':
        return this.devTools.errorBadRequest();
      case 'unauthorized':
        return this.devTools.errorUnauthorized();
      case 'forbidden':
        return this.devTools.errorForbidden();
      case 'notFound':
        return this.devTools.errorNotFound();
      case 'conflict':
        return this.devTools.errorConflict();
      case 'externalDependency':
        return this.devTools.errorExternalDependency();
      case 'internalControlled':
        return this.devTools.errorInternalControlled();
      case 'throw':
        return this.devTools.errorThrow();
      case 'rateLimit':
        return this.devTools.rateLimitProbe();
      case 'auditEntry':
        return this.devTools.createAuditTestEntry();
      case 'nullData':
        return this.devTools.payloadNullData();
      case 'missingFields':
        return this.devTools.payloadMissingFields();
      case 'wrongShape':
        return this.devTools.payloadWrongShape();
      case 'nullItems':
        return this.devTools.payloadNullItems();
      case 'invalidDate':
        return this.devTools.payloadInvalidDate();
      case 'sensitiveMetadata':
        return this.devTools.payloadSensitiveMetadata();
      case 'emptyList':
        return this.devTools.payloadEmptyList();
      case 'largeList':
        return this.devTools.payloadLargeList();
      default:
        return of({ message: 'Accion no configurada.' });
    }
  }

  private successResult(action: DevToolsAction, payload: unknown): DevToolsRunResult {
    return {
      action,
      ok: true,
      status: action.expectedStatus,
      message: this.successMessage(action, payload),
      correlationId: this.extractCorrelationId(payload),
      sanitizedPayload: sanitizeMetadata(payload),
      receivedAt: new Date().toISOString()
    };
  }

  private errorResult(action: DevToolsAction, error: unknown): DevToolsRunResult {
    const message = error instanceof Error ? error.message : 'Ocurrio un error inesperado.';
    const status = this.inferStatus(action, message);

    return {
      action,
      ok: false,
      status,
      message: status === 404 && action.category !== 'errors'
        ? 'DevTools no esta disponible en este ambiente o el backend respondio 404.'
        : message,
      sanitizedPayload: sanitizeMetadata({ status, message }),
      receivedAt: new Date().toISOString()
    };
  }

  private successMessage(action: DevToolsAction, payload: unknown): string {
    if (action.key === 'nullData' || payload === null) {
      return 'data null recibido correctamente como prueba.';
    }

    if (action.key === 'nullItems' || this.hasNullItems(payload)) {
      return 'items null recibido como advertencia controlada.';
    }

    if (Array.isArray(payload)) {
      return 'Payload con forma inesperada recibido sin romper la UI.';
    }

    if (action.key === 'sensitiveMetadata') {
      return 'Payload con metadata sensible recibido y redactado para pantalla.';
    }

    if (action.key === 'auditEntry') {
      return 'Entrada de auditoria solicitada correctamente.';
    }

    return 'Endpoint respondio correctamente.';
  }

  private hasNullItems(payload: unknown): boolean {
    return !!payload && typeof payload === 'object' && 'items' in payload && (payload as DevToolsPayloadShape).items === null;
  }

  private inferStatus(action: DevToolsAction, message: string): number {
    if (action.category === 'errors') {
      return action.expectedStatus;
    }

    const normalized = message.toLowerCase();

    if (normalized.includes('no se encontro')) {
      return 404;
    }

    if (normalized.includes('permisos')) {
      return 403;
    }

    if (normalized.includes('sesion')) {
      return 401;
    }

    if (normalized.includes('servidor')) {
      return 500;
    }

    return 0;
  }

  private extractCorrelationId(payload: unknown, depth = 0): string | undefined {
    if (!payload || depth > 3) {
      return undefined;
    }

    if (Array.isArray(payload)) {
      return payload.slice(0, 5).map((item) => this.extractCorrelationId(item, depth + 1)).find(Boolean);
    }

    if (typeof payload !== 'object') {
      return undefined;
    }

    const record = payload as Record<string, unknown>;
    const direct = record['correlationId'] || record['traceId'] || record['requestId'];

    if (typeof direct === 'string' && direct.trim()) {
      return direct;
    }

    return Object.values(record)
      .map((value) => this.extractCorrelationId(value, depth + 1))
      .find(Boolean);
  }
}
