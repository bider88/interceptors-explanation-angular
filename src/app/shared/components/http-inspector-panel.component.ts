import { Component, inject, signal } from '@angular/core';
import {
  InterceptedRequestLog,
  RequestInspectorService,
} from '../../core/services/request-inspector.service';

@Component({
  selector: 'app-http-inspector-panel',
  standalone: true,
  template: `
    <section class="rounded-2xl border border-slate-800 bg-slate-900/95 shadow-xl overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 class="text-sm font-bold text-white tracking-wide">
            Inspector de Tráfico HTTP e Interceptores en Vivo
          </h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {{ inspector.logs().length }} peticiones registradas
          </span>
        </div>

        <div class="flex items-center gap-2">
          @if (inspector.logs().length > 0) {
            <button
              type="button"
              (click)="inspector.clear(); selectedLog.set(null)"
              class="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              Limpiar historial
            </button>
          }
        </div>
      </div>

      @if (inspector.logs().length === 0) {
        <div class="p-6 text-center text-sm text-slate-400">
          Todavía no has disparado ninguna petición HTTP. Usa los botones interactivos de esta sección para ver cómo los interceptores transforman las peticiones en tiempo real.
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          <!-- Lista de peticiones -->
          <div class="lg:col-span-7 max-h-80 overflow-y-auto divide-y divide-slate-800/70">
            @for (item of inspector.logs(); track item.id) {
              <button
                type="button"
                (click)="selectedLog.set(item)"
                class="w-full text-left px-4 py-3 hover:bg-slate-800/50 transition flex items-center justify-between gap-3 cursor-pointer"
                [class.bg-indigo-950/30]="selectedLog()?.id === item.id"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {{ item.method }}
                    </span>
                    <span class="text-xs sm:text-sm font-mono text-slate-200 truncate">
                      {{ item.url }}
                    </span>
                    @if (item.mode === 'without-interceptor') {
                      <span class="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Sin AuthInterceptor
                      </span>
                    }
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>🕒 {{ item.timestamp }}</span>
                    <span>•</span>
                    <span>ID: <code class="text-slate-300">{{ item.id }}</code></span>
                    <span>•</span>
                    <span [class]="item.authenticated ? 'text-emerald-400' : 'text-rose-400'">
                      {{ item.authenticated ? '🔒 Con Bearer Token' : '🔓 Sin Token' }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-xs font-mono text-slate-400">
                    {{ item.durationMs }}ms
                  </span>
                  <span
                    class="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
                    [class]="getStatusBadgeClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </button>
            }
          </div>

          <!-- Detalle de headers e interceptores de la petición seleccionada (o la más reciente) -->
          @let active = selectedLog() || inspector.logs()[0];
          @if (active) {
            <div class="lg:col-span-5 p-4 bg-slate-950/60 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-300 uppercase tracking-wider">
                  Detalle de Petición ({{ active.id }})
                </span>
                <span class="font-mono text-slate-400">{{ active.durationMs }} ms</span>
              </div>

              <div>
                <p class="text-slate-400 mb-1 font-medium">Cadena de Interceptores ejecutada:</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (interceptorName of active.interceptorsApplied; track interceptorName) {
                    <span class="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-mono text-[11px]">
                      {{ interceptorName }}
                    </span>
                  }
                </div>
              </div>

              <div>
                <p class="text-slate-400 mb-1 font-medium">Headers HTTP enviados al servidor:</p>
                <div class="rounded-lg bg-slate-900 border border-slate-800 p-2.5 font-mono space-y-1 max-h-36 overflow-y-auto">
                  @for (entry of getHeaderEntries(active.headersSent); track entry[0]) {
                    <div class="break-all">
                      <span class="text-sky-400">{{ entry[0] }}:</span>
                      <span class="text-slate-200 ml-1">{{ entry[1] }}</span>
                    </div>
                  }
                </div>
              </div>

              @if (active.errorMessage) {
                <div class="rounded-lg bg-rose-950/60 border border-rose-800/80 p-2.5 text-rose-200">
                  <span class="font-bold">Respuesta de Error:</span> {{ active.errorMessage }}
                </div>
              } @else if (active.responsePreview) {
                <div>
                  <p class="text-slate-400 mb-1 font-medium">Vista previa del Body recibido:</p>
                  <div class="rounded-lg bg-slate-900 border border-slate-800 p-2 font-mono text-emerald-300 break-all">
                    {{ active.responsePreview }}
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class HttpInspectorPanelComponent {
  readonly inspector = inject(RequestInspectorService);
  readonly selectedLog = signal<InterceptedRequestLog | null>(null);

  getHeaderEntries(headers: Record<string, string>): [string, string][] {
    return Object.entries(headers);
  }

  getStatusBadgeClass(status: number | 'PENDING' | 'CACHED'): string {
    if (status === 'PENDING') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    if (status === 'CACHED') return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
    if (status >= 200 && status < 300)
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
  }
}
