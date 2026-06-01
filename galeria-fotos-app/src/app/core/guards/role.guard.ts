import { CanActivateFn } from '@angular/router';

import { authGuard } from './auth.guard';

export const roleGuard: CanActivateFn = (route, state) => authGuard(route, state);
