import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { AppRole, CurrentSession, LoginResponse } from '../models/auth.models';

const TOKEN_KEY = 'auth_token';
const GUEST_KEY = 'guest_mode';

type JwtPayload = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly session = signal<CurrentSession>(this.loadSession());

  get token(): string | null {
    return this.session().token;
  }

  get guestMode(): boolean {
    return this.session().guestMode;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token) && !this.isTokenExpired(this.token);
  }

  get isGuest(): boolean {
    return !this.isAuthenticated;
  }

  get canRead(): boolean {
    return true;
  }

  get canWrite(): boolean {
    return this.isAuthenticated && !this.guestMode;
  }

  get isAdmin(): boolean {
    return this.role === 'Admin';
  }

  get isUser(): boolean {
    return this.role === 'Usuario';
  }

  get role(): AppRole {
    if (!this.isAuthenticated) {
      return 'Invitado';
    }

    return this.normalizeRole(this.session().rol) ?? 'Usuario';
  }

  get displayRole(): string {
    if (this.role === 'Usuario') {
      return 'Cliente';
    }

    if (this.role === 'Admin') {
      return 'Admin';
    }

    return 'Modo invitado';
  }

  get userId(): string | undefined {
    return this.session().userId;
  }

  get email(): string | undefined {
    return this.session().email;
  }

  get nombre(): string | undefined {
    return this.session().nombre;
  }

  setAuthenticated(response: LoginResponse & { token: string }): void {
    const tokenPayload = this.decodeToken(response.token);
    const nextSession: CurrentSession = {
      token: response.token,
      guestMode: false,
      userId: response.userId ?? response.id ?? response.usuario?.id ?? this.claim(tokenPayload, [
        'userId',
        'id',
        'sub',
        'nameid',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ]),
      nombre: response.nombre ?? response.usuario?.nombre ?? this.claim(tokenPayload, [
        'nombre',
        'name',
        'unique_name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ]),
      email: response.email ?? response.usuario?.email ?? this.claim(tokenPayload, [
        'email',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ]),
      rol: this.normalizeRole(response.rol ?? response.usuario?.rol ?? this.claimValues(tokenPayload, [
        'rol',
        'role',
        'roles',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
      ]))
    };

    this.write(TOKEN_KEY, response.token);
    this.remove(GUEST_KEY);
    this.session.set(nextSession);
  }

  enterGuestMode(): void {
    this.remove(TOKEN_KEY);
    this.write(GUEST_KEY, 'true');
    this.session.set({
      token: null,
      guestMode: true,
      nombre: 'Invitado',
      rol: 'Invitado'
    });
  }

  clear(): void {
    this.remove(TOKEN_KEY);
    this.remove(GUEST_KEY);
    this.session.set({ token: null, guestMode: false, rol: 'Invitado' });
  }

  private loadSession(): CurrentSession {
    const token = this.read(TOKEN_KEY);
    const guestMode = this.read(GUEST_KEY) === 'true';

    if (!token) {
      return {
        token: null,
        guestMode,
        nombre: guestMode ? 'Invitado' : undefined,
        rol: 'Invitado'
      };
    }

    if (this.isTokenExpired(token)) {
      this.remove(TOKEN_KEY);
      return { token: null, guestMode, rol: 'Invitado' };
    }

    const payload = this.decodeToken(token);

    return {
      token,
      guestMode: false,
      userId: this.claim(payload, [
        'userId',
        'id',
        'sub',
        'nameid',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ]),
      nombre: this.claim(payload, [
        'nombre',
        'name',
        'unique_name',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ]),
      email: this.claim(payload, [
        'email',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ]),
      rol: this.normalizeRole(this.claimValues(payload, [
        'rol',
        'role',
        'roles',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
      ]))
    };
  }

  private isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }

    const exp = this.decodeToken(token)['exp'];

    if (typeof exp !== 'number') {
      return false;
    }

    return exp * 1000 <= Date.now();
  }

  private decodeToken(token: string): JwtPayload {
    const [, payload] = token.split('.');

    if (!payload) {
      return {};
    }

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const json = atob(padded);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return {};
    }
  }

  private claim(payload: JwtPayload, names: string[]): string | undefined {
    return this.claimValues(payload, names)[0];
  }

  private claimValues(payload: JwtPayload, names: string[]): string[] {
    for (const name of names) {
      const entry = Object.entries(payload).find(([key]) => key.toLowerCase() === name.toLowerCase());

      if (!entry) {
        continue;
      }

      const value = entry[1];

      if (Array.isArray(value) && value.length > 0) {
        return value.map((item) => String(item)).filter(Boolean);
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return [String(value)];
      }
    }

    return [];
  }

  private normalizeRole(value?: unknown): AppRole | undefined {
    const values = Array.isArray(value) ? value : [value];
    const normalizedRoles: AppRole[] = [];

    for (const item of values) {
      if (item === null || item === undefined) {
        continue;
      }

      const parts = String(item)
        .split(/[,\s;|]+/)
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);

      for (const role of parts) {
        if (role === 'admin' || role === 'administrador' || role === 'administrator') {
          normalizedRoles.push('Admin');
        }

        if (role === 'usuario' || role === 'cliente' || role === 'user') {
          normalizedRoles.push('Usuario');
        }

        if (role === 'invitado' || role === 'guest') {
          normalizedRoles.push('Invitado');
        }
      }
    }

    return normalizedRoles.includes('Admin')
      ? 'Admin'
      : normalizedRoles.includes('Usuario')
        ? 'Usuario'
        : normalizedRoles[0];
  }

  private read(key: string): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) : null;
  }

  private write(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }
}
