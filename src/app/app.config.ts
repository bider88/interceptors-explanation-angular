import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingAndHeadersInterceptor } from './core/interceptors/logging-headers.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorRetryInterceptor } from './core/interceptors/error-retry.interceptor';
import { responseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { mockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      })
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingAndHeadersInterceptor,
        loadingInterceptor,
        cacheInterceptor,
        errorRetryInterceptor,
        responseTransformInterceptor,
        mockBackendInterceptor,
      ])
    ),
  ],
};
