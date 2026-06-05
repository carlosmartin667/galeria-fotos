import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { BitacoraService } from './bitacora.service';

describe('BitacoraService', () => {
  let service: BitacoraService;
  let http: HttpTestingController;
  const apiUrl = environment.apiUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(BitacoraService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads paginated bitacora with allowed query params', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    service.getBitacora({
      desde: '2026-06-01T00:00:00.000Z',
      hasta: '2026-06-04T23:59:59.000Z',
      usuarioEmail: 'admin@example.com',
      accion: 'LOGIN',
      entidadTipo: 'Pedido',
      entidadId: '30000000-0000-0000-0000-000000000101',
      severidad: 'Info',
      correlationId: 'trace-123',
      page: 2,
      pageSize: 20
    }).subscribe((response) => {
      expect(response.page).toBe(2);
      expect(response.pageSize).toBe(20);
      expect(response.totalItems).toBe(1);
      expect(response.items[0].accion).toBe('LOGIN');
    });

    const req = http.expectOne((request) =>
      request.url === `${apiUrl}/Bitacora`
      && request.params.get('Desde') === '2026-06-01T00:00:00.000Z'
      && request.params.get('Hasta') === '2026-06-04T23:59:59.000Z'
      && request.params.get('UsuarioEmail') === 'admin@example.com'
      && request.params.get('Accion') === 'LOGIN'
      && request.params.get('EntidadTipo') === 'Pedido'
      && request.params.get('EntidadId') === '30000000-0000-0000-0000-000000000101'
      && request.params.get('Severidad') === 'Info'
      && request.params.get('CorrelationId') === 'trace-123'
      && request.params.get('Page') === '2'
      && request.params.get('PageSize') === '20'
    );

    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        items: [{ id: '1', accion: 'LOGIN' }],
        page: 2,
        pageSize: 20,
        totalItems: 1,
        totalPages: 2,
        hasPreviousPage: true,
        hasNextPage: false
      }
    });
    expect(setItem).not.toHaveBeenCalled();
  });

  it('loads detail and summary endpoints', () => {
    service.getDetalle('abc').subscribe((item) => {
      expect(item.id).toBe('abc');
    });

    const detail = http.expectOne(`${apiUrl}/Bitacora/abc`);
    expect(detail.request.method).toBe('GET');
    detail.flush({ success: true, data: { id: 'abc', accion: 'UPDATE' } });

    service.getResumen().subscribe((summary) => {
      expect(summary.total).toBe(3);
    });

    const resumen = http.expectOne(`${apiUrl}/Bitacora/resumen`);
    expect(resumen.request.method).toBe('GET');
    resumen.flush({ success: true, data: { total: 3 } });
  });
});
