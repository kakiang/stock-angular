import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  
  
  private auth = inject(AuthService);

  constructor() {
    
  }
  isAuth = computed(() => this.auth.isAuthenticated());
  isAdmin = computed(() => this.auth.isAdmin());
  username = computed(() => this.auth.username());
  
  logout() {
    this.auth.logout();
  }
}
