import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { RequestInspectorService } from '../services/request-inspector.service';
import { BYPASS_AUTH_INTERCEPTOR } from './http-context.tokens';

@Injectable({ providedIn: 'root' })
export class ClientMetadataConfigService {
  readonly appVersion = signal<string>('v2.4.0-web');
  readonly preferredLang = signal<'es-MX' | 'en-US' | 'pt-BR'>('es-MX');
  readonly tenantId = signal<string>('tenant-latam-01');
}

/**
 * CASO DE USO #5: Interceptor de Auditoría, Telemetría (Profiling) y Headers Globales
 * - Inyecta encabezados corporativos estándar (X-Request-ID, X-App-Version, Accept-Language, X-Tenant-ID).
 * - Mide con alta precisión (`performance.now()`) cuánto tarda cada petición desde que sale
 *   hasta que regresa la respuesta o falla, registrándolo en el Inspector en Vivo.
 */
export const loggingAndHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const inspector = inject(RequestInspectorService);
  const metadata = inject(ClientMetadataConfigService);

  const startTime = performance.now();
  const requestId = 'req_' + Math.random().toString(36).substring(2, 9);

  // Clonamos para adjuntar cabeceras globales de trazabilidad y multi-tenant
  const tracedReq = req.clone({
    setHeaders: {
      'X-Request-ID': requestId,
      'X-App-Version': metadata.appVersion(),
      'Accept-Language': metadata.preferredLang(),
      'X-Tenant-ID': metadata.tenantId(),
    },
  });

  // Extraemos los headers que viajarán finalmente hacia el servidor
  const headersSnapshot: Record<string, string> = {};
  tracedReq.headers.keys().forEach((key) => {
    headersSnapshot[key] = tracedReq.headers.get(key) ?? '';
  });

  const hasAuthHeader = tracedReq.headers.has('Authorization');
  const bypassedAuth = req.context.get(BYPASS_AUTH_INTERCEPTOR);

  const appliedList = ['loggingAndHeadersInterceptor', 'loadingInterceptor', 'errorRetryInterceptor'];
  if (!bypassedAuth) {
    appliedList.unshift('authInterceptor');
  }
  if (req.method === 'GET' && req.url.includes('/api/catalog')) {
    appliedList.push('cacheInterceptor');
  }

  inspector.addLog({
    id: requestId,
    timestamp: new Date().toLocaleTimeString(),
    method: tracedReq.method,
    url: tracedReq.urlWithParams,
    status: 'PENDING',
    durationMs: 0,
    authenticated: hasAuthHeader,
    headersSent: headersSnapshot,
    interceptorsApplied: appliedList,
    mode: bypassedAuth ? 'without-interceptor' : 'with-interceptor',
  });

  return next(tracedReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Math.round(performance.now() - startTime);
          const isCached = event.headers.get('X-Cache-Status') === 'HIT';
          inspector.updateLog(requestId, {
            status: isCached ? 'CACHED' : event.status,
            durationMs: isCached ? 0 : elapsed,
            fromCache: isCached,
            responsePreview: JSON.stringify(event.body).slice(0, 160),
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        const elapsed = Math.round(performance.now() - startTime);
        inspector.updateLog(requestId, {
          status: err.status || 500,
          durationMs: elapsed,
          errorMessage: err.error?.message || err.message,
        });
      },
    })
  );
};
