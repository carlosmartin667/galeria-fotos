import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { SessionService } from '../services/session.service';

function checkAccess(requiresUser = false): boolean | UrlTree {
  const session = inject(SessionService);
  const router = inject(Router);

  if (requiresUser && session.guestMode) {
    return router.createUrlTree(['/login'], {
      queryParams: { message: 'Esta seccion requiere iniciar sesion.' }
    });
  }

  if (requiresUser && !session.isAuthenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: { message: 'Esta seccion requiere iniciar sesion.' }
    });
  }

  if (session.canRead) {
    return true;
  }

  return router.createUrlTree(['/login']);
}

export const authGuard: CanActivateFn = (route) => {
  return checkAccess(route.data['requiresUser'] === true);
};

export const authChildGuard: CanActivateChildFn = (route) => {
  return checkAccess(route.data['requiresUser'] === true);
};
