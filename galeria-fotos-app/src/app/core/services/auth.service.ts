import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.models';
import { ApiHttpService } from './api-http.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiHttpService);
  private readonly session = inject(SessionService);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/Auth/login', payload).pipe(
      map((response) => this.requireToken(response)),
      tap((response) => {
        this.session.setAuthenticated(response);
      })
    );
  }

  register(payload: RegisterRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/Auth/register', payload);
  }

  enterGuestMode(): void {
    this.session.enterGuestMode();
  }

  logout(): void {
    this.session.clear();
  }

  private requireToken(response: LoginResponse): LoginResponse & { token: string } {
    if (!response.token) {
      throw new Error('La API no devolvio un token de acceso.');
    }

    return { ...response, token: response.token };
  }
}
