import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { FORCE_CACHE_REFRESH } from './http-context.tokens';

export interface CacheEntry {
  url: string;
  response: HttpResponse<unknown>;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

@Injectable({ providedIn: 'root' })
export class HttpCacheStoreService {
  private readonly cache = new Map<string, CacheEntry>();
  readonly entriesSignal = signal<CacheEntry[]>([]);
  readonly ttlMs = 30_000; // 30 segundos de vida útil por defecto

  get(url: string): HttpResponse<unknown> | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      this.syncSignal();
      return null;
    }

    entry.hits += 1;
    this.syncSignal();
    return entry.response;
  }

  put(url: string, response: HttpResponse<unknown>): void {
    const now = Date.now();
    this.cache.set(url, {
      url,
      response,
      createdAt: now,
      expiresAt: now + this.ttlMs,
      hits: 0,
    });
    this.syncSignal();
  }

  clear(): void {
    this.cache.clear();
    this.syncSignal();
  }

  private syncSignal(): void {
    this.entriesSignal.set(Array.from(this.cache.values()));
  }
}

/**
 * CASO DE USO #4: Interceptor de Caché HTTP en Memoria
 * Cortocircuita peticiones GET repetitivas devolviendo `of(cachedResponse)`
 * de forma instantánea (0ms de red) cuando existe una copia fresca en caché.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo cacheamos peticiones GET destinadas a endpoints cacheables
  if (req.method !== 'GET' || !req.url.includes('/api/catalog')) {
    return next(req);
  }

  const cacheStore = inject(HttpCacheStoreService);
  const forceRefresh = req.context.get(FORCE_CACHE_REFRESH);

  if (!forceRefresh) {
    const cachedResponse = cacheStore.get(req.urlWithParams);
    if (cachedResponse) {
      // Devolvemos un clon con un header indicador para que la UI sepa que vino de caché
      return of(
        cachedResponse.clone({
          headers: cachedResponse.headers.set('X-Cache-Status', 'HIT'),
        })
      );
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cacheStore.put(req.urlWithParams, event);
      }
    })
  );
};
