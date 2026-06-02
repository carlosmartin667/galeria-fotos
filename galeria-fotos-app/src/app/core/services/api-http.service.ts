import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiErrorService } from './api-error.service';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  private readonly http = inject(HttpClient);
  private readonly errors = inject(ApiErrorService);
  private readonly apiUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<unknown>(this.url(path), { params: this.params(params) }).pipe(
      timeout(15000),
      map((response) => this.unwrap<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<unknown>(this.url(path), body).pipe(
      timeout(15000),
      map((response) => this.unwrap<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<unknown>(this.url(path), body).pipe(
      timeout(15000),
      map((response) => this.unwrap<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<unknown>(this.url(path), body).pipe(
      timeout(15000),
      map((response) => this.unwrap<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<unknown>(this.url(path)).pipe(
      timeout(15000),
      map((response) => this.unwrap<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  private url(path: string): string {
    return `${this.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private params(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => new Error(this.errors.toMessage(error)));
  }

  private unwrap<T>(response: unknown): T {
    if (!response || typeof response !== 'object') {
      return response as T;
    }

    const body = response as {
      success?: boolean;
      data?: unknown;
      message?: string | null;
      errors?: string[];
    };
    const isApiEnvelope = 'success' in body || ('data' in body && ('errors' in body || 'message' in body));

    if (!isApiEnvelope) {
      return response as T;
    }

    if (body.success === false) {
      const message = body.message || body.errors?.filter(Boolean).join(' ') || 'La API rechazo la operacion.';
      throw new Error(message);
    }

    return body.data as T;
  }
}
