import { Injectable, computed, signal } from '@angular/core';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer';
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  readonly isAuthenticated = signal<boolean>(true);
  readonly simulateExpiredToken = signal<boolean>(false);

  readonly currentUser = computed<DemoUser | null>(() =>
    this.isAuthenticated()
      ? {
          id: 'usr_98234',
          name: 'Ana García',
          email: 'ana.garcia@empresa.dev',
          role: 'admin',
        }
      : null
  );

  readonly accessToken = computed<string | null>(() => {
    if (!this.isAuthenticated()) {
      return null;
    }
    if (this.simulateExpiredToken()) {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.EXPIRED_TOKEN_PAYLOAD.sig_expired';
    }
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTgyMzQiLCJuYW1lIjoiQW5hIEdhcmNpYSIsInJvbGUiOiJhZG1pbiJ9.valid_sig_2026';
  });

  login(): void {
    this.isAuthenticated.set(true);
    this.simulateExpiredToken.set(false);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.simulateExpiredToken.set(false);
  }

  toggleAuth(): void {
    this.isAuthenticated.update((v) => !v);
    if (!this.isAuthenticated()) {
      this.simulateExpiredToken.set(false);
    }
  }

  toggleExpiredToken(): void {
    if (!this.isAuthenticated()) {
      this.isAuthenticated.set(true);
    }
    this.simulateExpiredToken.update((v) => !v);
  }
}
