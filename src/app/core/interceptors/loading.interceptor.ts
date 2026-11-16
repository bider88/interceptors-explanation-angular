import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { SKIP_GLOBAL_LOADER } from './http-context.tokens';

/**
 * CASO DE USO #3: Interceptor de Estado de Carga Global (Loader / Spinner)
 * Incrementa el contador de peticiones activas al iniciar y garantiza su
 * disminución mediante el operador finalize() sin importar si tuvo éxito,
 * falló con error o fue cancelada.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
