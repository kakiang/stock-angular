import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiMessageService {
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  setSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  setError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }

  clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
