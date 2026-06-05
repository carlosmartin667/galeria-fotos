import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DevToolsPayloadShape } from '../models/dev-tools.models';
import { DevToolsService } from './dev-tools.service';

type DevToolsMethod = keyof Pick<
  DevToolsService,
  | 'ping'
  | 'currentUser'
  | 'correlationId'
  | 'errorBadRequest'
  | 'errorUnauthorized'
  | 'errorForbidden'
  | 'errorNotFound'
  | 'errorConflict'
  | 'errorExternalDependency'
  | 'errorInternalControlled'
  | 'errorThrow'
  | 'rateLimitProbe'
  | 'payloadNullData'
  | 'payloadMissingFields'
  | 'payloadWrongShape'
  | 'payloadNullItems'
  | 'payloadInvalidDate'
  | 'payloadSensitiveMetadata'
  | 'payloadEmptyList'
  | 'payloadLargeList'
>;

describe('DevToolsService', () => {
  let service: DevToolsService;
  let http: HttpTestingController;
  const apiUrl = environment.apiUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DevToolsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('builds GET requests for diagnostic endpoints', () => {
    const cases: Array<[DevToolsMethod, string]> = [
      ['ping', '/dev-tools/ping'],
      ['currentUser', '/dev-tools/current-user'],
      ['correlationId', '/dev-tools/correlation-id'],
      ['errorBadRequest', '/dev-tools/errors/bad-request'],
      ['errorUnauthorized', '/dev-tools/errors/unauthorized'],
      ['errorForbidden', '/dev-tools/errors/forbidden'],
      ['errorNotFound', '/dev-tools/errors/not-found'],
      ['errorConflict', '/dev-tools/errors/conflict'],
      ['errorExternalDependency', '/dev-tools/errors/external-dependency'],
      ['errorInternalControlled', '/dev-tools/errors/internal-controlled'],
      ['errorThrow', '/dev-tools/errors/throw'],
      ['rateLimitProbe', '/dev-tools/rate-limit/probe'],
      ['payloadNullData', '/dev-tools/payloads/null-data'],
      ['payloadMissingFields', '/dev-tools/payloads/missing-fields'],
      ['payloadWrongShape', '/dev-tools/payloads/wrong-shape'],
      ['payloadNullItems', '/dev-tools/payloads/null-items'],
      ['payloadInvalidDate', '/dev-tools/payloads/invalid-date'],
      ['payloadSensitiveMetadata', '/dev-tools/payloads/sensitive-metadata'],
      ['payloadEmptyList', '/dev-tools/payloads/empty-list'],
      ['payloadLargeList', '/dev-tools/payloads/large-list']
    ];

    cases.forEach(([method, path]) => {
      const request$ = service[method]() as Observable<DevToolsPayloadShape>;
      request$.subscribe((response) => {
        expect(response.correlationId).toBe('trace-test');
      });

      const req = http.expectOne(`${apiUrl}${path}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: { correlationId: 'trace-test' } });
    });
  });

  it('creates an audit test entry without writing browser storage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    service.createAuditTestEntry().subscribe((response) => {
      expect(response.correlationId).toBe('audit-trace');
    });

    const req = http.expectOne(`${apiUrl}/dev-tools/audit/test-entry`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      source: 'frontend-dev-tools',
      message: 'Entrada de prueba generada desde el panel Admin DevTools'
    });
    req.flush({ success: true, data: { correlationId: 'audit-trace' } });

    expect(setItem).not.toHaveBeenCalled();
  });
});
