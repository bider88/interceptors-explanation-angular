import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

/**
 * CASO DE USO #6: Interceptor de Normalización / Transformación de Respuestas (Adapter)
 * Muchos backends legacy envuelven sus respuestas en estructuras como:
 * { status_code: 200, payload_data: { user_name: '...', created_at_iso: '...' } }
 * Este interceptor desempaqueta automáticamente `payload_data` y normaliza campos
 * antes de que lleguen al componente.
 */
export const responseTransformInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/legacy/')) {
    return next(req);
  }

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const rawBody = event.body as Record<string, any>;

        // Si el backend envió un envelope { payload_data: ... }, lo desempaquetamos y enriquecemos
        if ('payload_data' in rawBody) {
          const normalizedBody = {
            ...rawBody['payload_data'],
            _normalizedByInterceptor: true,
            _originalEnvelopeVersion: rawBody['legacy_version'] ?? '1.0',
          };

          return event.clone({ body: normalizedBody });
        }
      }
      return event;
    })
  );
};
