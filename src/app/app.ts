import { Component, computed, inject, Signal, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './authentication/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  currentRoute: Signal<string>;
  isDropdownOpen: boolean = false;

  constructor(public authService: AuthService) {
    this.authService.loadFromStorage();

    const routeSignal = signal(this.router.url);

    this.router.events.subscribe(() => {
      routeSignal.set(this.router.url);
    });

    this.currentRoute = computed(() => routeSignal());
  }

  logout() {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }
}
