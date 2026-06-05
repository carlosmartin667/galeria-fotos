import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AppRole } from '../models/auth.models';
import { SessionService } from '../services/session.service';

function checkAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
  const session = inject(SessionService);
  const router = inject(Router);
  const routeTree = route.pathFromRoot?.length ? route.pathFromRoot : [route];
  const requiresUser = routeTree.some((snapshot) => snapshot.data['requiresUser'] === true);
  const roleRequirements = routeTree
    .map((snapshot) => snapshot.data['roles'] as AppRole[] | undefined)
    .filter((roles): roles is AppRole[] => Array.isArray(roles) && roles.length > 0);

  if (!requiresUser && roleRequirements.length === 0) {
    return true;
  }

  if (!session.isAuthenticated) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        message: 'Esta seccion requiere iniciar sesion.',
        ...returnUrlParam(state.url)
      }
    });
  }

  if (roleRequirements.length > 0 && !roleRequirements.every((roles) => roles.includes(session.role))) {
    return router.createUrlTree(['/dashboard'], {
      queryParams: { message: 'No tenes permisos para acceder a esta seccion.' }
    });
  }

  return true;
}

function returnUrlParam(url: string): { returnUrl?: string } {
  if (!url || url === '/login' || url.startsWith('/login?')) {
    return {};
  }

  return { returnUrl: url };
}

export const authGuard: CanActivateFn = (route, state) => checkAccess(route, state);
export const authChildGuard: CanActivateChildFn = (route, state) => checkAccess(route, state);
