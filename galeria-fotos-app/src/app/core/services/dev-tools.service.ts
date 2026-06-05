import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DevToolsPayloadShape } from '../models/dev-tools.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class DevToolsService {
  private readonly api = inject(ApiHttpService);
  private readonly basePath = 'dev-tools';

  ping(): Observable<DevToolsPayloadShape> {
    return this.get('ping');
  }

  currentUser(): Observable<DevToolsPayloadShape> {
    return this.get('current-user');
  }

  correlationId(): Observable<DevToolsPayloadShape> {
    return this.get('correlation-id');
  }

  errorBadRequest(): Observable<DevToolsPayloadShape> {
    return this.get('errors/bad-request');
  }

  errorUnauthorized(): Observable<DevToolsPayloadShape> {
    return this.get('errors/unauthorized');
  }

  errorForbidden(): Observable<DevToolsPayloadShape> {
    return this.get('errors/forbidden');
  }

  errorNotFound(): Observable<DevToolsPayloadShape> {
    return this.get('errors/not-found');
  }

  errorConflict(): Observable<DevToolsPayloadShape> {
    return this.get('errors/conflict');
  }

  errorExternalDependency(): Observable<DevToolsPayloadShape> {
    return this.get('errors/external-dependency');
  }

  errorInternalControlled(): Observable<DevToolsPayloadShape> {
    return this.get('errors/internal-controlled');
  }

  errorThrow(): Observable<DevToolsPayloadShape> {
    return this.get('errors/throw');
  }

  rateLimitProbe(): Observable<DevToolsPayloadShape> {
    return this.get('rate-limit/probe');
  }

  createAuditTestEntry(): Observable<DevToolsPayloadShape> {
    return this.api.post<DevToolsPayloadShape>(`${this.basePath}/audit/test-entry`, {
      source: 'frontend-dev-tools',
      message: 'Entrada de prueba generada desde el panel Admin DevTools'
    });
  }

  payloadNullData(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/null-data');
  }

  payloadMissingFields(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/missing-fields');
  }

  payloadWrongShape(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/wrong-shape');
  }

  payloadNullItems(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/null-items');
  }

  payloadInvalidDate(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/invalid-date');
  }

  payloadSensitiveMetadata(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/sensitive-metadata');
  }

  payloadEmptyList(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/empty-list');
  }

  payloadLargeList(): Observable<DevToolsPayloadShape> {
    return this.get('payloads/large-list');
  }

  private get(path: string): Observable<DevToolsPayloadShape> {
    return this.api.get<DevToolsPayloadShape>(`${this.basePath}/${path}`);
  }
}
