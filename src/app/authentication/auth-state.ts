import { InjectionToken, inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AUTH_STATE = new InjectionToken('AUTH_STATE', {
  providedIn: 'root',
  factory: () => inject(AuthService).isAuthenticated
});