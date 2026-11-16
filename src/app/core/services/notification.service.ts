import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  statusCode?: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([]);

  push(notification: Omit<AppNotification, 'id' | 'timestamp'>): void {
    const item: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    this.notifications.update((list) => [item, ...list].slice(0, 6));
  }

  dismiss(id: string): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll(): void {
    this.notifications.set([]);
  }
}
