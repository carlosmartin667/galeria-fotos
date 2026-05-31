import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  private readonly http = inject(HttpClient);
  private readonly errors = inject(ApiErrorService);
  private readonly apiUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path)).pipe(catchError((error) => this.handleError(error)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body).pipe(catchError((error) => this.handleError(error)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body).pipe(catchError((error) => this.handleError(error)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path)).pipe(catchError((error) => this.handleError(error)));
  }

  private url(path: string): string {
    return `${this.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => new Error(this.errors.toMessage(error)));
  }
}
