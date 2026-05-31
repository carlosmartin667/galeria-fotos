import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { CurrentSession, LoginResponse } from '../models/auth.models';

const TOKEN_KEY = 'authToken';
const GUEST_KEY = 'guestMode';
const USER_KEY = 'currentUser';

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
    return Boolean(this.token);
  }

  get canRead(): boolean {
    return this.isAuthenticated || this.guestMode;
  }

  get canWrite(): boolean {
    return this.isAuthenticated && !this.guestMode;
  }

  setAuthenticated(response: LoginResponse): void {
    const nextSession: CurrentSession = {
      token: response.token,
      guestMode: false,
      nombre: response.nombre ?? response.usuario?.nombre,
      email: response.email ?? response.usuario?.email,
      rol: response.rol ?? response.usuario?.rol
    };

    this.write(TOKEN_KEY, response.token);
    this.write(GUEST_KEY, 'false');
    this.write(USER_KEY, JSON.stringify(nextSession));
    this.session.set(nextSession);
  }

  enterGuestMode(): void {
    const nextSession: CurrentSession = {
      token: null,
      guestMode: true,
      nombre: 'Invitado'
    };

    this.remove(TOKEN_KEY);
    this.write(GUEST_KEY, 'true');
    this.write(USER_KEY, JSON.stringify(nextSession));
    this.session.set(nextSession);
  }

  clear(): void {
    this.remove(TOKEN_KEY);
    this.remove(GUEST_KEY);
    this.remove(USER_KEY);
    this.session.set({ token: null, guestMode: false });
  }

  private loadSession(): CurrentSession {
    const token = this.read(TOKEN_KEY);
    const guestMode = this.read(GUEST_KEY) === 'true';
    const storedUser = this.read(USER_KEY);

    if (!storedUser) {
      return { token, guestMode };
    }

    try {
      return { ...JSON.parse(storedUser), token, guestMode } as CurrentSession;
    } catch {
      return { token, guestMode };
    }
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
