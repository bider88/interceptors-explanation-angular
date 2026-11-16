import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly activeRequests = signal<number>(0);
  readonly isLoading = computed(() => this.activeRequests() > 0);
  readonly totalCompleted = signal<number>(0);

  show(): void {
    this.activeRequests.update((count) => count + 1);
  }

  hide(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
    this.totalCompleted.update((total) => total + 1);
  }
}
