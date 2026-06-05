import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AppRole } from '../models/auth.models';
import { SessionService } from '../services/session.service';
import { authChildGuard } from './auth.guard';

describe('authChildGuard', () => {
  let state: { isAuthenticated: boolean; role: AppRole };
  let router: Router;

  beforeEach(() => {
    state = { isAuthenticated: false, role: 'Invitado' };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            get isAuthenticated(): boolean {
              return state.isAuthenticated;
            },
            get role(): AppRole {
              return state.role;
            }
          }
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('allows public routes without role requirements', () => {
    const result = runGuard({});

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to login for private routes', () => {
    const result = runGuard({ roles: ['Admin'] });

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
  });

  it('allows Admin users on Admin routes', () => {
    state = { isAuthenticated: true, role: 'Admin' };

    const result = runGuard({ roles: ['Admin'] });

    expect(result).toBe(true);
  });

  it('blocks Usuario from Admin routes without treating it as expired login', () => {
    state = { isAuthenticated: true, role: 'Usuario' };

    const result = runGuard({ roles: ['Admin'] });

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toContain('/dashboard');
    expect(router.serializeUrl(result as UrlTree)).not.toContain('/login');
  });

  it('blocks Invitado from authenticated routes', () => {
    const result = runGuard({ requiresUser: true });

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
  });
});

function runGuard(data: Record<string, unknown>): boolean | UrlTree {
  const route = { data } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authChildGuard(route, {} as RouterStateSnapshot)) as boolean | UrlTree;
}
