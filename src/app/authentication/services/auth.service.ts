import { inject, signal, computed, Signal, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

/**
 * Interface for the Login API request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Interface for the Login API response
 */
export interface LoginResponse {
  token: string;
  username: string;
}

/**
 * Shape of the decoded JWT payload.
 * Adjust fields according to your backend JWT claims.
 */
export interface JwtPayload {
  sub: string;         // username
  roles: string[];     // user roles
  exp: number;         // expiration timestamp (in seconds)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:8080/api/auth';
  // Internal reactive state (private signals)
  private _token = signal<string | null>(null);
  private _roles = signal<string[]>([]);
  private _username = signal<string | null>(null);

  readonly token: Signal<string | null> = this._token.asReadonly();
  readonly roles: Signal<string[]> = this._roles.asReadonly();
  readonly username: Signal<string | null> = this._username.asReadonly();

  /**
   * Computed property for authentication status
   * Relies only on whether a valid, non-expired token exists.
   */
  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    const payload = this.safeDecode(token);
    return payload !== null && !this.isTokenExpired(payload);
  });

  readonly isAdmin = computed(() => this._roles()?.includes('ADMIN'));

  constructor() {
    // Load stored auth data on service initialization
    this.loadFromStorage();

    // Automatically log out if stored token is expired
    const token = this._token();
    if (token) {
      const payload = this.safeDecode(token);
      if (!payload || this.isTokenExpired(payload)) {
        this.logout();
      }
    }
  }

  /**
   * Sends login request to backend and stores the returned token + user data.
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, payload).pipe(
      tap(res => {
        this.setAuth(res.token, res.username);
      })
    );
  }

  /**
   * Clears authentication state and local storage.
   * This is also called automatically on token expiration.
   */
  logout(): void {

    this._token.set(null);
    this._roles.set([]);
    this._username.set(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');    
  }

  /**
   * Checks if the current user has a specific role.
   */
  hasRole(role: string): boolean {
    return this._roles().includes(role);
  }

  /**
   * Sets authentication data in memory (signals) and local storage.
   * Decodes the JWT internally to extract roles and expiration date.
   */
  private setAuth(token: string, username?: string | null): void {
    const payload = this.safeDecode(token);
    if (!payload) {
      console.warn('Invalid JWT received.');
      return;
    }

    // Store in memory
    this._token.set(token);
    this._roles.set(payload.roles || []);
    this._username.set(username ?? payload.sub ?? null);

    // Store in localStorage
    localStorage.setItem('authToken', token);
    if (username ?? payload.sub) {
      localStorage.setItem('authUsername', username ?? payload.sub);
    }
  }

  /**
   * Loads auth state from localStorage into signals.
   * This does NOT validate token freshness — that's handled in constructor.
   */
  loadFromStorage(): void {
    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('authUsername');

    if (storedToken) {
      const payload = this.safeDecode(storedToken);
      if (payload) {
        this._token.set(storedToken);
        this._roles.set(payload.roles || []);
      }
    }

    if (storedUsername) {
      this._username.set(storedUsername);


        console.log("_token:",this._token(),);
        console.log("_username:",this._username(),);
        console.warn("_roles",this._roles);
    }
  }

  /**
   * Safely decodes a JWT without throwing errors.
   */
  private safeDecode(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Checks whether a decoded token is expired.
   */
  private isTokenExpired(payload: JwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }
}
