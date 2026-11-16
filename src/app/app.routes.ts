import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FundamentalsComponent } from './pages/fundamentals/fundamentals.component';
import { AuthTokenComponent } from './pages/auth-token/auth-token.component';
import { ErrorHandlingComponent } from './pages/error-handling/error-handling.component';
import { LoadingStateComponent } from './pages/loading-state/loading-state.component';
import { CachingComponent } from './pages/caching/caching.component';
import { LoggingHeadersComponent } from './pages/logging-headers/logging-headers.component';
import { ResponseTransformComponent } from './pages/response-transform/response-transform.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Directorio | Interceptores en Angular' },
  { path: 'fundamentos', component: FundamentalsComponent, title: '01. Fundamentos | Interceptores en Angular' },
  { path: 'auth-token', component: AuthTokenComponent, title: '02. Access Token (Sin vs Con) | Interceptores' },
  { path: 'errores-y-reintentos', component: ErrorHandlingComponent, title: '03. Errores y Retry | Interceptores' },
  { path: 'loader-global', component: LoadingStateComponent, title: '04. Loader Global | Interceptores' },
  { path: 'cache-http', component: CachingComponent, title: '05. Caché HTTP | Interceptores' },
  { path: 'auditoria-y-headers', component: LoggingHeadersComponent, title: '06. Auditoría y Headers | Interceptores' },
  { path: 'transformacion-respuestas', component: ResponseTransformComponent, title: '07. Transformación Respuestas | Interceptores' },
  { path: '**', redirectTo: '' },
];
