import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * CASO DE USO #2: Interceptor Global de Errores y Reintentos Automáticos (Retry)
 * - Reintenta automáticamente errores transitorios de red/servidor (503) con backoff.
 * - Centraliza el diagnóstico de errores HTTP (401, 403, 404, 500) y notifica a la UI.
 */
export const errorRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    // Reintenta hasta 2 veces adicionales SOLO si el servidor devuelve 503 (Servicio Inestable)
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 503) {
          notifications.push({
            type: 'warning',
            statusCode: 503,
            title: `Reintento automático #${retryCount}`,
            message: `El endpoint ${req.url} falló temporalmente (503). Reintentando en 400ms...`,
          });
          return timer(400);
        }
        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      let title = 'Error HTTP Inesperado';
      let message = error.error?.message || error.message || 'Fallo en la comunicación.';

      switch (error.status) {
        case 401:
          title = '401 No Autorizado (Interceptor Global)';
          message =
            error.error?.message ||
            'No se envió el header Authorization o el Access Token ha expirado.';
          break;
        case 403:
          title = '403 Acceso Prohibido (Interceptor Global)';
          message = 'Tu token es válido, pero tu rol no tiene permisos para este recurso.';
          break;
        case 500:
          title = '500 Error Interno del Servidor';
          message = 'El backend sufrió una excepción crítica. El equipo de SRE ha sido alertado.';
          break;
      }

      notifications.push({
        type: 'error',
        statusCode: error.status,
        title,
        message,
      });

      return throwError(() => error);
    })
  );
};
