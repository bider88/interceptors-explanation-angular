import { Injectable, signal } from '@angular/core';

export interface InterceptedRequestLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number | 'PENDING' | 'CACHED';
  durationMs: number;
  authenticated: boolean;
  headersSent: Record<string, string>;
  interceptorsApplied: string[];
  fromCache?: boolean;
  retryCount?: number;
  responsePreview?: string;
  errorMessage?: string;
  mode?: 'with-interceptor' | 'without-interceptor';
}

@Injectable({ providedIn: 'root' })
export class RequestInspectorService {
  readonly logs = signal<InterceptedRequestLog[]>([]);

  addLog(log: InterceptedRequestLog): void {
    this.logs.update((current) => [log, ...current].slice(0, 25));
  }

  updateLog(id: string, partial: Partial<InterceptedRequestLog>): void {
    this.logs.update((current) =>
      current.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
  }

  clear(): void {
    this.logs.set([]);
  }
}
