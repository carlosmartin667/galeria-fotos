import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const session = inject(SessionService);
  const token = session.isAuthenticated ? session.token : null;
  const isBrowser = isPlatformBrowser(platformId);
  const isApiCall = request.url.startsWith(environment.apiUrl.replace(/\/$/, ''));
  const authRequest = isApiCall && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (isBrowser && isApiCall && error instanceof HttpErrorResponse && error.status === 401) {
        const message = session.isAuthenticated
          ? 'Sesion expirada. Inicia sesion nuevamente.'
          : 'Esta seccion requiere iniciar sesion.';
        const returnUrl = router.url && router.url !== '/login' && !router.url.startsWith('/login?')
          ? router.url
          : undefined;

        session.clear();
        void router.navigate(['/login'], {
          queryParams: {
            message,
            ...(returnUrl ? { returnUrl } : {})
          }
        });
      }

      return throwError(() => error);
    })
  );
};
