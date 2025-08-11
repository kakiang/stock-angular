import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

/* 
If user is logged in (isAuthenticated()), allow activation.
If not, create a UrlTree redirecting to /login?returnUrl=/the/original/path. 
Using UrlTree is the recommended way to redirect inside guards.
*/
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // synchronous check (fast). To validate token remotely, return Observable
  if (auth.isAuthenticated()) {
    return true;
  }

  // not authenticated -> redirect to login with returnUrl in query params
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
