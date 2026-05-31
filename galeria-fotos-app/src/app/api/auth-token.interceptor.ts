import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';

import { environment } from '../../environments/environment';

const AUTH_TOKEN_KEY = 'galeria_fotos_auth_token';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId) || !request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
