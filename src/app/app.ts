import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStateService } from './core/services/auth-state.service';
import { LoadingService } from './core/services/loading.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly authState = inject(AuthStateService);
  readonly loadingService = inject(LoadingService);
  readonly notifications = inject(NotificationService);

  readonly navItems = [
    { path: '/', label: '🏠 Directorio', exact: true },
    { path: '/fundamentos', label: '01. Fundamentos', exact: false },
    { path: '/auth-token', label: '02. Access Token (Principal)', exact: false },
    { path: '/errores-y-reintentos', label: '03. Errores & Retry', exact: false },
    { path: '/loader-global', label: '04. Loader Global', exact: false },
    { path: '/cache-http', label: '05. Caché HTTP', exact: false },
    { path: '/auditoria-y-headers', label: '06. Auditoría & Headers', exact: false },
    { path: '/transformacion-respuestas', label: '07. Transformación', exact: false },
  ];
}
