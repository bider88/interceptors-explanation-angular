import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-error-handling',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider">
          <span>Sección 03 • Caso de Uso #2</span>
          <span>•</span>
          <span>Resiliencia, Retry & CatchError</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Manejo Global de Errores HTTP y Reintentos Automáticos
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          En lugar de escribir bloques repetitivos de <code class="text-rose-300">error: (err) =&gt; ...</code> en cada componente para mostrar alertas de error o reintentar peticiones cuando la red parpadea, un <strong>Interceptor de Errores y Retry</strong> centraliza la resiliencia de toda tu aplicación usando operadores de RxJS en el flujo de regreso.
        </p>
      </header>

      <!-- SIMULADOR INTERACTIVO -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-rose-400">
            Laboratorio de Fallos y Resiliencia en Vivo
          </span>
          <h2 class="text-xl font-bold text-white">
            Simula caídas de red, errores de permisos y recuperación con Auto-Retry
          </h2>
          <p class="text-xs sm:text-sm text-slate-400">
            Haz clic en cualquiera de los escenarios. Observa cómo las notificaciones superiores se disparan desde el interceptor sin que este componente tenga que gestionar las alertas manualmente.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            (click)="triggerFlaky503()"
            [disabled]="running()"
            class="text-left p-4 rounded-xl border border-amber-700/60 bg-amber-950/20 hover:bg-amber-950/40 transition cursor-pointer space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                HTTP 503 → Auto-Retry → 200 OK
              </span>
              <span>🔄</span>
            </div>
            <div class="font-bold text-white text-sm">Probar Microcorte Temporal (503)</div>
            <p class="text-xs text-slate-300">
              El servidor falla los primeros 2 intentos con 503, el interceptor reintenta automáticamente cada 400ms y triunfa en el 3er intento.
            </p>
          </button>

          <button
            type="button"
            (click)="triggerError('/api/simulate/forbidden-403')"
            [disabled]="running()"
            class="text-left p-4 rounded-xl border border-rose-700/60 bg-rose-950/20 hover:bg-rose-950/40 transition cursor-pointer space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                HTTP 403 Forbidden
              </span>
              <span>🚫</span>
            </div>
            <div class="font-bold text-white text-sm">Simular Falta de Permisos (403)</div>
            <p class="text-xs text-slate-300">
              No se reintenta (porque un 403 no se arregla reintentando) y el interceptor emite una notificación explicativa.
            </p>
          </button>

          <button
            type="button"
            (click)="triggerError('/api/simulate/crash-500')"
            [disabled]="running()"
            class="text-left p-4 rounded-xl border border-rose-700/60 bg-rose-950/20 hover:bg-rose-950/40 transition cursor-pointer space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                HTTP 500 Internal Error
              </span>
              <span>💥</span>
            </div>
            <div class="font-bold text-white text-sm">Simular Excepción Crítica (500)</div>
            <p class="text-xs text-slate-300">
              Captura la excepción del backend y formatea un mensaje amigable para el usuario final.
            </p>
          </button>
        </div>

        @if (statusBanner()) {
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200">
            {{ statusBanner() }}
          </div>
        }

        <!-- Bandeja de notificaciones capturadas por el interceptor -->
        @if (notifications.notifications().length > 0) {
          <div class="space-y-2 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Alertas emitidas automáticamente por errorRetryInterceptor:
              </span>
              <button
                type="button"
                (click)="notifications.clearAll()"
                class="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Limpiar alertas
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              @for (item of notifications.notifications(); track item.id) {
                <div
                  class="rounded-xl border p-3 text-xs flex items-start justify-between gap-3"
                  [class]="item.type === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                    : 'bg-rose-950/40 border-rose-700/60 text-rose-200'"
                >
                  <div>
                    <div class="font-bold">{{ item.title }} <span class="font-mono opacity-75">({{ item.timestamp }})</span></div>
                    <div class="text-slate-300 mt-0.5">{{ item.message }}</div>
                  </div>
                  <button
                    type="button"
                    (click)="notifications.dismiss(item.id)"
                    class="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </section>

      <app-http-inspector-panel />

      <!-- EXPLICACIÓN DE CÓDIGO -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-white">
          Código y Explicación Bajo el Capó: <code class="text-rose-400">errorRetryInterceptor</code>
        </h2>

        <app-code-explainer
          filename="src/app/core/interceptors/error-retry.interceptor.ts"
          badge="Resiliencia Centralizada con RxJS"
          badgeType="good"
          description="Observa cómo combinamos retry() selectivo (solo para código 503) con catchError() para catalogar errores HTTP y relanzar el flujo con throwError:"
          [code]="interceptorCode"
          [explanations]="interceptorExplanations"
        />
      </section>

      <!-- Navegación -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/auth-token"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Access Token (Caso Principal)
        </a>
        <a
          routerLink="/loader-global"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Siguiente Caso de Uso (#3): Loader / Spinner Global →
        </a>
      </div>
    </div>
  `,
})
export class ErrorHandlingComponent {
  private readonly http = inject(HttpClient);
  readonly notifications = inject(NotificationService);
  readonly running = signal(false);
  readonly statusBanner = signal<string>('');

  triggerFlaky503(): void {
    this.running.set(true);
    this.statusBanner.set('⏳ Ejecutando petición a /api/simulate/flaky-503... observa los reintentos automáticos.');
    this.http.get('/api/simulate/flaky-503').subscribe({
      next: (res) => {
        this.running.set(false);
        this.statusBanner.set(
          '✅ ÉXITO TRAS REINTENTOS: ' + JSON.stringify(res)
        );
      },
      error: (err: HttpErrorResponse) => {
        this.running.set(false);
        this.statusBanner.set('❌ Falló definitivamente: ' + err.message);
      },
    });
  }

  triggerError(url: string): void {
    this.running.set(true);
    this.statusBanner.set(`⏳ Disparo hacia ${url}...`);
    this.http.get(url).subscribe({
      next: () => {
        this.running.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.running.set(false);
        this.statusBanner.set(
          `⚠️ El interceptor procesó y notificó el código HTTP ${err.status}: ${err.error?.message}`
        );
      },
    });
  }

  readonly interceptorCode = `import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    // 1. Reintento inteligente con retardo (Backoff) solo en errores transitorios 503
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 503) {
          return timer(400); // Espera 400ms y vuelve a suscribirse a next(req)
        }
        // Si es 401, 403 o 404 NO tiene sentido reintentar; cancelamos el retry
        return throwError(() => error);
      },
    }),

    // 2. Captura global si el error persiste o no era reintentable
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notifications.push({ type: 'error', title: 'Sesión inválida', message: 'Por favor vuelve a iniciar sesión.' });
      } else if (error.status === 403) {
        notifications.push({ type: 'error', title: 'Sin permisos', message: 'Tu rol no permite esta acción.' });
      } else if (error.status >= 500) {
        notifications.push({ type: 'error', title: 'Error del Servidor', message: 'Intenta más tarde.' });
      }

      // 3. Re-emitimos el error para que el componente que llamó sepa que la operación no concluyó
      return throwError(() => error);
    })
  );
};`;

  readonly interceptorExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'retry({ count: 2, delay: (error, retryCount) => ... })',
      concept: 'Re-suscripción automática inteligente',
      explanation:
        'Cuando el Observable devuelto por next(req) emite un error, el operador retry intercepta ese error antes de que llegue al componente. Si devolvemos timer(400), RxJS espera 400ms y vuelve a disparar la petición HTTP.',
      underTheHood:
        'Al evaluar if (error.status === 503) evitamos bombardear al servidor cuando el fallo es un 400 Bad Request o 403 Forbidden que jamás cambiaría aunque lo reintentemos.',
    },
    {
      lineRef: 'catchError((error: HttpErrorResponse) => { ... })',
      concept: 'Punto único de traducción de errores y telemetría',
      explanation:
        'Permite traducir códigos técnicos de estado HTTP en notificaciones claras para el usuario o redirigir al Login en caso de 401.',
    },
    {
      lineRef: 'return throwError(() => error);',
      concept: 'Propagación limpia del flujo de error',
      explanation:
        'Después de mostrar el toast global, re-lanzamos el error con throwError para que el componente pueda apagar estados locales si lo necesita.',
    },
  ];
}
