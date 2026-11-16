import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';
import { BYPASS_AUTH_INTERCEPTOR } from './http-context.tokens';

/**
 * CASO DE USO PRINCIPAL: Interceptor de Autenticación (JWT Access Token)
 * Intercepta cada petición HTTP saliente y, si el usuario está autenticado,
 * clona la petición inyectando el encabezado Authorization: Bearer <token>.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);

  // 1. Si la petición indica explícitamente saltar el interceptor (o es una ruta pública)
  if (req.context.get(BYPASS_AUTH_INTERCEPTOR) || req.url.includes('/api/public')) {
    return next(req);
  }

  // 2. Obtenemos el token actual desde nuestro estado reactivo de autenticación
  const token = authState.accessToken();

  // 3. Si NO hay sesión activa, dejamos pasar la petición original sin modificar
  if (!token) {
    return next(req);
  }

  // 4. Como HttpRequest es INMUTABLE, la clonamos agregando el header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Auth-Strategy': 'Angular-Functional-Interceptor',
    },
  });

  // 5. Enviamos la petición clonada al siguiente paso de la cadena
  return next(authReq);
};
