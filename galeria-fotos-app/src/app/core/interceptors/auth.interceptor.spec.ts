import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  let sessionState: { isAuthenticated: boolean; token: string | null };
  let clear: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  const apiUrl = environment.apiUrl.replace(/\/$/, '');

  beforeEach(() => {
    sessionState = { isAuthenticated: false, token: null };
    clear = vi.fn();
    navigate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigate } },
        {
          provide: SessionService,
          useValue: {
            get isAuthenticated(): boolean {
              return sessionState.isAuthenticated;
            },
            get token(): string | null {
              return sessionState.token;
            },
            clear
          }
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('adds Authorization Bearer for API calls with token', () => {
    sessionState = { isAuthenticated: true, token: 'secure-token' };

    httpClient.get(`${apiUrl}/Eventos`).subscribe();

    const req = http.expectOne(`${apiUrl}/Eventos`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer secure-token');
    req.flush({});
  });

  it('does not add Authorization without token', () => {
    httpClient.get(`${apiUrl}/Eventos`).subscribe();

    const req = http.expectOne(`${apiUrl}/Eventos`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add Authorization to non API calls', () => {
    sessionState = { isAuthenticated: true, token: 'secure-token' };

    httpClient.get('/assets/local.json').subscribe();

    const req = http.expectOne('/assets/local.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('clears session and redirects on API 401', () => {
    sessionState = { isAuthenticated: true, token: 'secure-token' };

    httpClient.get(`${apiUrl}/Pedidos`).subscribe({ error: () => undefined });

    const req = http.expectOne(`${apiUrl}/Pedidos`);
    req.flush({ message: 'expired' }, { status: 401, statusText: 'Unauthorized' });

    expect(clear).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { message: 'Sesion expirada. Inicia sesion nuevamente.' }
    });
  });

  it('does not clear session or redirect on API 403', () => {
    sessionState = { isAuthenticated: true, token: 'secure-token' };

    httpClient.get(`${apiUrl}/Admin/dashboard`).subscribe({ error: () => undefined });

    const req = http.expectOne(`${apiUrl}/Admin/dashboard`);
    req.flush({ message: 'forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(clear).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
