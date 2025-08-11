import { Component, computed, inject, Signal, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthStateService } from './authentication/services/auth-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  authService = inject(AuthStateService);
  currentRoute: Signal<string>;

  constructor() {
    const routeSignal = signal(this.router.url);

    this.router.events.subscribe(() => {
      routeSignal.set(this.router.url);
    });

    this.currentRoute = computed(() => routeSignal());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
