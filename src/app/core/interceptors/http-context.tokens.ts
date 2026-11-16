import { HttpContextToken } from '@angular/common/http';

/**
 * Permite desactivar el AuthInterceptor en una petición puntual
 * (usado también en el simulador para comparar "Sin Interceptor" vs "Con Interceptor").
 */
export const BYPASS_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

/**
 * Permite ejecutar una petición en segundo plano sin activar el spinner global.
 */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

/**
 * Fuerza que el CacheInterceptor ignore la caché y consulte la red.
 */
export const FORCE_CACHE_REFRESH = new HttpContextToken<boolean>(() => false);
