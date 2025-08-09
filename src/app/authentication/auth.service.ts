import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // the guard will read isAuthenticated or _token() 
  // the login page will call login() 
  // other components can use hasRole()
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:8080/api/auth';

  // signals
  private _token = signal<string | null>(null);
  private _roles = signal<string[]>([]);
  private _username = signal<string | null>(null);
  private _isAuthenticated = signal(false);

  // public readonly signals
  readonly token: Signal<string | null> = this._token;
  readonly roles: Signal<string[]> = this._roles;
  readonly username: Signal<string | null> = this._username;

  // convenience computed
  readonly isAuthenticated = computed(() => !!this._token());

  constructor() {
    // optionally call load here or from AppComponent on startup
    this.loadFromStorage();
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, payload).pipe(
      tap(res => {
        // store in signals + localStorage
        this.setAuth(res.token, res.roles, res.username);
      })
    );
  }

  setAuth(token: string, roles: string[], username?: string | null) {
    this._token.set(token);
    this._roles.set(roles ?? []);
    this._username.set(username ?? null);

    localStorage.setItem('authToken', token);
    localStorage.setItem('authRoles', JSON.stringify(roles ?? []));
    if (username) localStorage.setItem('authUsername', username);
  }

  logout() {
    this._token.set(null);
    this._roles.set([]);
    this._username.set(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRoles');
    localStorage.removeItem('authUsername');
  }

  loadFromStorage() {
    const t = localStorage.getItem('authToken');
    const r = localStorage.getItem('authRoles');
    const u = localStorage.getItem('authUsername');

    if (t) this._token.set(t);
    if (r) {
      try { this._roles.set(JSON.parse(r)); } catch { this._roles.set([]); }
    }
    if (u) this._username.set(u);
  }

  // helper for templates or components
  hasRole(role: string) {
    return this._roles().includes(role);
  }
}
