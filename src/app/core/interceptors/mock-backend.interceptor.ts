import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { delay, mergeMap, of, throwError, timer } from 'rxjs';

let flakyServiceCounter = 0;

/**
 * Simulador de Backend (Último eslabón de la cadena de interceptores).
 * Permite probar todos los casos de uso en vivo desde el navegador sin depender
 * de un servidor externo, validando realmente los headers que inyectaron los
 * interceptores previos.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const authHeader = req.headers.get('Authorization');
  const requestId = req.headers.get('X-Request-ID') || 'sin-id';
  const lang = req.headers.get('Accept-Language') || 'es-MX';
  const tenant = req.headers.get('X-Tenant-ID') || 'default';

  // Función auxiliar para responder con latencia realista
  const respondOk = (body: unknown, delayMs = 450) =>
    of(
      new HttpResponse({
        status: 200,
        body,
        headers: req.headers,
      })
    ).pipe(delay(delayMs));

  const respondError = (status: number, message: string, delayMs = 400) =>
    timer(delayMs).pipe(
      mergeMap(() =>
        throwError(
          () =>
            new HttpErrorResponse({
              status,
              statusText: message,
              url: req.url,
              error: {
                status,
                message,
                requestId,
                timestamp: new Date().toISOString(),
              },
            })
        )
      )
    );

  // 1. Endpoints protegidos que requieren Access Token válido (/api/profile, /api/orders, /api/billing)
  if (
    req.url.startsWith('/api/profile') ||
    req.url.startsWith('/api/orders') ||
    req.url.startsWith('/api/billing')
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return respondError(
        401,
        'Acceso denegado: La petición llegó al servidor SIN el encabezado "Authorization: Bearer <token>".'
      );
    }

    if (authHeader.includes('EXPIRED_TOKEN_PAYLOAD')) {
      return respondError(
        401,
        'Token expirado (401): El servidor detectó que el JWT enviado ya venció.'
      );
    }

    if (req.url.startsWith('/api/profile')) {
      return respondOk({
        endpoint: '/api/profile',
        authenticatedWith: authHeader.substring(0, 32) + '...',
        user: {
          id: 'usr_98234',
          name: 'Ana García',
          role: 'Arquitecta Frontend Senior',
          permissions: ['read:orders', 'write:billing', 'admin:panel'],
        },
        serverReceivedHeaders: {
          Authorization: authHeader.substring(0, 38) + '...',
          'X-Request-ID': requestId,
          'Accept-Language': lang,
        },
      });
    }

    if (req.url.startsWith('/api/orders')) {
      return respondOk({
        endpoint: '/api/orders',
        orders: [
          { id: 'ORD-2026-01', item: 'Licencia Enterprise Angular', total: '$299 USD', status: 'Pagado' },
          { id: 'ORD-2026-02', item: 'Workshop Arquitectura RxJS', total: '$149 USD', status: 'Activo' },
        ],
        verifiedToken: true,
      });
    }

    if (req.url.startsWith('/api/billing')) {
      return respondOk({
        endpoint: '/api/billing',
        nextInvoiceDate: '2026-12-01',
        paymentMethod: 'Visa terminada en 4242',
        status: 'Al corriente',
      });
    }
  }

  // 2. Endpoint Público (no requiere token)
  if (req.url.startsWith('/api/public/status')) {
    return respondOk(
      {
        service: 'API Pública de Estado',
        status: 'Operacional',
        authHeaderPresent: !!authHeader,
        note: 'Las rutas públicas funcionan con o sin token.',
      },
      300
    );
  }

  // 3. Endpoints para probar el Interceptor de Errores y Reintentos (Retry)
  if (req.url.startsWith('/api/simulate/flaky-503')) {
    flakyServiceCounter += 1;
    // Falla las primeras 2 veces con 503 y responde 200 OK en el intento #3
    if (flakyServiceCounter % 3 !== 0) {
      return respondError(
        503,
        `Fallo temporal de base de datos (Intento #${flakyServiceCounter % 3}).`,
        300
      );
    }
    return respondOk(
      {
        status: 'Recuperado con éxito tras reintentos automáticos del Interceptor',
        attemptSucceeded: 3,
        requestId,
      },
      300
    );
  }

  if (req.url.startsWith('/api/simulate/forbidden-403')) {
    return respondError(403, 'No tienes el rol SUPER_ADMIN para eliminar registros de producción.');
  }

  if (req.url.startsWith('/api/simulate/crash-500')) {
    return respondError(500, 'NullPointerException en el microservicio de pagos.');
  }

  // 4. Endpoint para probar el Interceptor de Carga Lenta (Loader Global)
  if (req.url.startsWith('/api/reports/heavy')) {
    const duration = req.url.includes('fast') ? 700 : 1600;
    return respondOk(
      {
        report: 'Reporte Financiero Anual Consolidado',
        rowsProcessed: 148_500,
        processingTimeMs: duration,
        requestId,
      },
      duration
    );
  }

  // 5. Endpoint para probar el Interceptor de Caché (/api/catalog/products)
  if (req.url.startsWith('/api/catalog/products')) {
    return respondOk(
      {
        source: 'Red / Base de Datos (Latencia 750ms)',
        generatedAt: new Date().toLocaleTimeString(),
        products: [
          { id: 1, name: 'Teclado Mecánico Split', price: 185 },
          { id: 2, name: 'Monitor Ultrawide 34"', price: 640 },
          { id: 3, name: 'Silla Ergonómica Pro', price: 420 },
        ],
      },
      750
    );
  }

  // 6. Endpoint de eco de cabeceras (Auditoría / Telemetría)
  if (req.url.startsWith('/api/telemetry/echo')) {
    return respondOk(
      {
        message: 'El servidor recibió tus encabezados inyectados automáticamente',
        receivedHeaders: {
          'X-Request-ID': requestId,
          'X-App-Version': req.headers.get('X-App-Version'),
          'Accept-Language': lang,
          'X-Tenant-ID': tenant,
          Authorization: authHeader ? 'Bearer [PRESENTE]' : '[NO ENVIADO]',
        },
        serverTime: new Date().toLocaleTimeString(),
      },
      380
    );
  }

  // 7. Endpoint Legacy con Envelope complejo para probar el Interceptor de Transformación
  if (req.url.startsWith('/api/legacy/customer')) {
    return respondOk(
      {
        legacy_version: 'v1.2-soap-bridge',
        internal_trace: 'SRV_LEGACY_991',
        payload_data: {
          customerId: 'CUST-8841',
          fullName: 'Carlos Mendoza',
          plan: 'Enterprise Anual',
          active: true,
        },
      },
      420
    );
  }

  return respondOk({ message: 'Respuesta simulada OK', url: req.url });
};
