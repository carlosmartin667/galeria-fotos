import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppRole } from '../models/auth.models';
import { SessionService } from '../services/session.service';

function checkAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const session = inject(SessionService);
  const router = inject(Router);
  const requiresUser = route.data['requiresUser'] === true;
  const roles = route.data['roles'] as AppRole[] | undefined;

  if (!requiresUser && !roles?.length) {
    return true;
  }

  if (!session.isAuthenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: { message: 'Esta seccion requiere iniciar sesion.' }
    });
  }

  if (roles?.length && !roles.includes(session.role)) {
    return router.createUrlTree(['/dashboard'], {
      queryParams: { message: 'No tenes permisos para acceder a esta seccion.' }
    });
  }

  return true;
}

export const authGuard: CanActivateFn = (route) => checkAccess(route);
export const authChildGuard: CanActivateChildFn = (route) => checkAccess(route);
