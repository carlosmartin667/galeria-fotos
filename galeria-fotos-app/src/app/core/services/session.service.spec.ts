import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts as guest without token', () => {
    const service = TestBed.inject(SessionService);

    expect(service.token).toBeNull();
    expect(service.isAuthenticated).toBe(false);
    expect(service.role).toBe('Invitado');
    expect(service.displayRole).toBe('Modo invitado');
    expect(service.canRead).toBe(true);
    expect(service.canWrite).toBe(false);
  });

  it('persists only the auth token when authenticated', () => {
    const service = TestBed.inject(SessionService);
    const token = jwt({ exp: futureExp(), role: 'Admin', email: 'admin@example.com' });

    service.setAuthenticated({
      token,
      email: 'admin@example.com',
      nombre: 'Admin',
      rol: 'Admin'
    });

    expect(service.isAuthenticated).toBe(true);
    expect(service.role).toBe('Admin');
    expect(service.isAdmin).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe(token);
    expect(localStorage.getItem('guest_mode')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('nombre')).toBeNull();
  });

  it('normalizes Usuario role as Cliente display role', () => {
    const service = TestBed.inject(SessionService);

    service.setAuthenticated({
      token: jwt({ exp: futureExp(), role: 'Usuario' }),
      email: 'cliente@example.com',
      nombre: 'Cliente',
      rol: 'Usuario'
    });

    expect(service.role).toBe('Usuario');
    expect(service.isUser).toBe(true);
    expect(service.displayRole).toBe('Cliente');
  });

  it('clears auth and guest state on logout', () => {
    const service = TestBed.inject(SessionService);

    service.setAuthenticated({ token: jwt({ exp: futureExp(), role: 'Admin' }), rol: 'Admin' });
    service.clear();

    expect(service.token).toBeNull();
    expect(service.isAuthenticated).toBe(false);
    expect(service.role).toBe('Invitado');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('guest_mode')).toBeNull();
  });

  it('keeps guest mode token-free', () => {
    const service = TestBed.inject(SessionService);

    service.enterGuestMode();

    expect(service.token).toBeNull();
    expect(service.role).toBe('Invitado');
    expect(service.guestMode).toBe(true);
    expect(localStorage.getItem('guest_mode')).toBe('true');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('removes expired token during session load', () => {
    localStorage.setItem('auth_token', jwt({ exp: Math.floor(Date.now() / 1000) - 60, role: 'Admin' }));

    const service = TestBed.inject(SessionService);

    expect(service.isAuthenticated).toBe(false);
    expect(service.role).toBe('Invitado');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

function futureExp(): number {
  return Math.floor(Date.now() / 1000) + 3600;
}

function jwt(payload: Record<string, unknown>): string {
  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode(payload),
    'signature'
  ].join('.');
}

function encode(value: Record<string, unknown>): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
