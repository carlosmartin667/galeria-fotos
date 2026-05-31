import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import { AuthResponse, LoginRequestDto, RegisterRequestDto } from './models';

const AUTH_TOKEN_KEY = 'galeria_fotos_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiHttpService);
  private readonly platformId = inject(PLATFORM_ID);

  get token(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  register(payload: RegisterRequestDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/Auth/register', payload).pipe(tap((response) => this.saveToken(response)));
  }

  login(payload: LoginRequestDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/Auth/login', payload).pipe(tap((response) => this.saveToken(response)));
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  private saveToken(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = response.token ?? response.accessToken ?? response.jwt;

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  }
}
