import { HttpClient, HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SKIP_GLOBAL_LOADER } from '../../core/interceptors/http-context.tokens';
import { LoadingService } from '../../core/services/loading.service';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
          <span>Sección 04 • Caso de Uso #3</span>
          <span>•</span>
          <span>UX Reactiva con Signals y finalize()</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Loader / Spinner Global Automático con Contador Concurrente
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          Olvídate de declarar <code class="text-amber-300">this.isLoading = true</code> antes de cada llamada y <code class="text-amber-300">this.isLoading = false</code> tanto en el <code class="text-slate-200">next</code> como en el <code class="text-slate-200">error</code>. Con un <strong>Loading Interceptor</strong> y el operador <code class="text-indigo-300">finalize()</code>, la barra de progreso global se gestiona sola e incluso soporta múltiples peticiones en paralelo.
        </p>
      </header>

      <!-- MONITOR DEL ESTADO DE CARGA EN TIEMPO REAL -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">Estado Global (<code class="text-indigo-300">isLoading()</code>)</div>
              <div
                class="text-lg font-extrabold mt-1"
                [class]="loadingService.isLoading() ? 'text-amber-400' : 'text-emerald-400'"
              >
                {{ loadingService.isLoading() ? '⏳ CARGANDO EN RED...' : '✓ INACTIVO (IDLE)' }}
              </div>
            </div>
            @if (loadingService.isLoading()) {
              <div class="w-8 h-8 rounded-full border-3 border-amber-400 border-t-transparent animate-spin"></div>
            }
          </div>

          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div class="text-xs text-slate-400">Peticiones en vuelo (<code class="text-indigo-300">activeRequests()</code>)</div>
            <div class="text-2xl font-mono font-extrabold text-white mt-1">
              {{ loadingService.activeRequests() }}
            </div>
          </div>

          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div class="text-xs text-slate-400">Total completadas (<code class="text-indigo-300">finalize()</code>)</div>
            <div class="text-2xl font-mono font-extrabold text-indigo-400 mt-1">
              {{ loadingService.totalCompleted() }}
            </div>
          </div>
        </div>

        <!-- Controles de prueba -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            (click)="runSingleHeavyRequest()"
            class="p-4 rounded-xl border border-amber-700/60 bg-amber-950/20 hover:bg-amber-950/40 text-left transition cursor-pointer space-y-1"
          >
            <div class="font-bold text-white text-sm">1️⃣ Disparar 1 Petición Pesada (1.6s)</div>
            <p class="text-xs text-slate-300">
              Observa cómo el contador sube a 1 y el spinner global permanece activo hasta que finaliza.
            </p>
          </button>

          <button
            type="button"
            (click)="runParallelRequests()"
            class="p-4 rounded-xl border border-indigo-700/60 bg-indigo-950/20 hover:bg-indigo-950/40 text-left transition cursor-pointer space-y-1"
          >
            <div class="font-bold text-white text-sm">🚀 Disparar 3 Peticiones en Paralelo</div>
            <p class="text-xs text-slate-300">
              El contador sube a 3 y va bajando (3 → 2 → 1 → 0). El spinner no se apaga hasta que termina la última.
            </p>
          </button>

          <button
            type="button"
            (click)="runSilentRequest()"
            class="p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-left transition cursor-pointer space-y-1"
          >
            <div class="font-bold text-white text-sm">🤫 Petición Silenciosa (SKIP_GLOBAL_LOADER)</div>
            <p class="text-xs text-slate-300">
              Usa <code class="text-indigo-300">HttpContextToken</code> para consultar el servidor en segundo plano sin encender el spinner.
            </p>
          </button>
        </div>

        @if (lastMessage()) {
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs font-mono text-emerald-300">
            {{ lastMessage() }}
          </div>
        }
      </section>

      <app-http-inspector-panel />

      <!-- EXPLICACIÓN DE CÓDIGO -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-white">
          Código y Explicación Bajo el Capó: <code class="text-amber-400">loadingInterceptor</code>
        </h2>

        <app-code-explainer
          filename="src/app/core/interceptors/loading.interceptor.ts"
          badge="Garantía de limpieza con finalize()"
          badgeType="good"
          description="El secreto de un buen Loading Interceptor es combinar un contador entero en lugar de un simple booleano y usar finalize() de RxJS:"
          [code]="loadingCode"
          [explanations]="loadingExplanations"
        />
      </section>

      <!-- Navegación -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/errores-y-reintentos"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Errores y Reintentos
        </a>
        <a
          routerLink="/cache-http"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Siguiente Caso de Uso (#4): Caché HTTP en Memoria →
        </a>
      </div>
    </div>
  `,
})
export class LoadingStateComponent {
  private readonly http = inject(HttpClient);
  readonly loadingService = inject(LoadingService);
  readonly lastMessage = signal<string>('');

  runSingleHeavyRequest(): void {
    this.lastMessage.set('Ejecutando reporte pesado (1600ms)... mira el contador arriba.');
    this.http.get('/api/reports/heavy').subscribe((res) => {
      this.lastMessage.set('✅ Reporte completado: ' + JSON.stringify(res));
    });
  }

  runParallelRequests(): void {
    this.lastMessage.set('Disparando 3 peticiones simultáneas con distinta duración...');
    this.http.get('/api/reports/heavy?fast=1').subscribe();
    this.http.get('/api/profile').subscribe();
    this.http.get('/api/reports/heavy').subscribe(() => {
      this.lastMessage.set(
        '✅ Las 3 peticiones paralelas terminaron y el contador volvió exactamente a 0.'
      );
    });
  }

  runSilentRequest(): void {
    this.lastMessage.set('Disparando petición silenciosa con SKIP_GLOBAL_LOADER = true...');
    const context = new HttpContext().set(SKIP_GLOBAL_LOADER, true);
    this.http.get('/api/public/status', { context }).subscribe((res) => {
      this.lastMessage.set(
        '🤫 Respuesta recibida en segundo plano sin encender el spinner global: ' +
          JSON.stringify(res)
      );
    });
  }

  readonly loadingCode = `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { SKIP_GLOBAL_LOADER } from './http-context.tokens';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Permitimos omitir el loader global en peticiones de autocompletado o polling
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);

  // 2. Incrementamos el contador de peticiones activas (+1)
  loadingService.show();

  return next(req).pipe(
    // 3. finalize() se ejecuta SIEMPRE: en éxito (200), en error (401/500) o si el usuario cambia de página y cancela la suscripción
    finalize(() => {
      loadingService.hide(); // Decrementa el contador (-1)
    })
  );
};`;

  readonly loadingExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'loadingService.show() // activeRequests.update(c => c + 1)',
      concept: '¿Por qué un contador (+1 / -1) en vez de un booleano?',
      explanation:
        'Si lanzas la Petición A (dura 500ms) y la Petición B (dura 2000ms) al mismo tiempo, y usaras un simple booleano, cuando A termine a los 500ms pondría isLoading = false apagando el spinner mientras B sigue cargando. Con un contador, isLoading es computed(() => activeRequests() > 0).',
    },
    {
      lineRef: 'finalize(() => loadingService.hide())',
      concept: 'Inmunidad ante errores y cancelaciones (Unsubscribe)',
      explanation:
        'Si usas tap() para ocultar el spinner y un componente destruye la suscripción antes de que responda el servidor (por ejemplo con takeUntilDestroyed), tap() nunca se ejecuta y el spinner quedaría pegado para siempre. finalize() garantiza ejecutarse incluso al cancelar.',
    },
  ];
}
