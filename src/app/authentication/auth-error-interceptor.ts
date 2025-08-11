import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { inject } from '@angular/core';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err?.status === 401) {
        // server says token invalid/expired
        auth.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url }});
        return EMPTY; // stop further handling if you want
      }
      return throwError(() => err);
    })
  );
};
