import { HttpClient, HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpCacheStoreService } from '../../core/interceptors/cache.interceptor';
import { FORCE_CACHE_REFRESH } from '../../core/interceptors/http-context.tokens';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-caching',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <span>Sección 05 • Caso de Uso #4</span>
          <span>•</span>
          <span>Cortocircuito de Red con RxJS of()</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Caché HTTP en Memoria: Respuestas en 0ms sin tocar el Servidor
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          Un interceptor no está obligado a llamar a <code class="text-cyan-300">next(req)</code>. Si detecta que una petición <code class="text-indigo-300">GET</code> ya fue consultada recientemente, puede <strong>cortocircuitar la tubería</strong> y devolver directamente <code class="text-emerald-300">of(cachedResponse)</code> ahorrando ancho de banda y logrando tiempos de respuesta de <strong>0 milisegundos</strong>.
        </p>
      </header>

      <!-- SIMULADOR DE CACHÉ EN VIVO -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Simulador de Catálogo Cacheado (TTL 30s)
            </span>
            <h2 class="text-xl font-bold text-white mt-0.5">
              Compara la 1ª petición (Red: ~750ms) vs la 2ª petición (Caché: 0ms)
            </h2>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              (click)="fetchCatalog(false)"
              class="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-cyan-600/20"
            >
              ⚡ Consultar GET /api/catalog/products
            </button>

            <button
              type="button"
              (click)="fetchCatalog(true)"
              class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
            >
              🔄 Forzar Red (FORCE_CACHE_REFRESH)
            </button>

            <button
              type="button"
              (click)="cacheStore.clear(); lastResponse.set(null)"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              🗑️ Vaciar Caché
            </button>
          </div>
        </div>

        <!-- Estado actual del almacén de caché -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Entradas almacenadas en HttpCacheStoreService:
            </div>
            @if (cacheStore.entriesSignal().length === 0) {
              <p class="text-xs text-slate-500 py-3">
                La memoria caché está vacía. La próxima llamada irá a la red (750ms).
              </p>
            } @else {
              @for (entry of cacheStore.entriesSignal(); track entry.url) {
                <div class="rounded-lg bg-slate-900 border border-cyan-800/50 p-3 text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-cyan-300">{{ entry.url }}</span>
                    <span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                      Cache Hits: {{ entry.hits }}
                    </span>
                  </div>
                  <div class="text-slate-400">
                    Guardado hace unos segundos • TTL activo (30s)
                  </div>
                </div>
              }
            }
          </div>

          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resultado de la última consulta:
            </div>
            @if (!lastResponse()) {
              <p class="text-xs text-slate-500 py-3">
                Presiona "Consultar GET /api/catalog/products" dos veces seguidas para notar la diferencia instantánea.
              </p>
            } @else {
              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span
                    class="font-bold px-2.5 py-1 rounded"
                    [class]="lastResponse()!.fromCache
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'"
                  >
                    {{ lastResponse()!.fromCache ? '⚡ SERVIDO DESDE CACHÉ (0ms)' : '🌐 DESCARGADO DE RED (~750ms)' }}
                  </span>
                </div>
                <pre class="font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto">{{ lastResponse()!.data }}</pre>
              </div>
            }
          </div>
        </div>
      </section>

      <app-http-inspector-panel />

      <!-- EXPLICACIÓN DE CÓDIGO -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-white">
          Código y Explicación Bajo el Capó: <code class="text-cyan-400">cacheInterceptor</code>
        </h2>

        <app-code-explainer
          filename="src/app/core/interceptors/cache.interceptor.ts"
          badge="Cortocircuito con of() + Almacenamiento con tap()"
          badgeType="good"
          description="Observa cómo el interceptor devuelve of(cachedResponse) sin ejecutar next(req) cuando encuentra una respuesta vigente en el Map:"
          [code]="cacheCode"
          [explanations]="cacheExplanations"
        />
      </section>

      <!-- Navegación -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/loader-global"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Loader Global
        </a>
        <a
          routerLink="/auditoria-y-headers"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Siguiente Caso de Uso (#5): Auditoría, Tiempos y Headers Globales →
        </a>
      </div>
    </div>
  `,
})
export class CachingComponent {
  private readonly http = inject(HttpClient);
  readonly cacheStore = inject(HttpCacheStoreService);

  readonly lastResponse = signal<{
    fromCache: boolean;
    data: string;
  } | null>(null);

  fetchCatalog(forceRefresh: boolean): void {
    const hadCacheBefore =
      !forceRefresh &&
      this.cacheStore.entriesSignal().some((e) => e.url.includes('/api/catalog/products'));

    const context = new HttpContext().set(FORCE_CACHE_REFRESH, forceRefresh);

    this.http.get('/api/catalog/products', { context }).subscribe((body) => {
      this.lastResponse.set({
        fromCache: hadCacheBefore,
        data: JSON.stringify(body, null, 2),
      });
    });
  }

  readonly cacheCode = `import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { HttpCacheStoreService } from './cache-store.service';
import { FORCE_CACHE_REFRESH } from './http-context.tokens';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Regla de oro: SOLO se cachean peticiones idempotentes GET
  if (req.method !== 'GET' || !req.url.includes('/api/catalog')) {
    return next(req);
  }

  const cacheStore = inject(HttpCacheStoreService);
  const forceRefresh = req.context.get(FORCE_CACHE_REFRESH);

  // 2. Si no se pidió forzar recarga y existe en caché vigente: CORTOCIRCUITO
  if (!forceRefresh) {
    const cachedResponse = cacheStore.get(req.urlWithParams);
    if (cachedResponse) {
      // No llamamos a next(req): devolvemos un Observable inmediato con of()
      return of(cachedResponse.clone());
    }
  }

  // 3. Si no estaba en caché, dejamos salir la petición y guardamos la respuesta al volver
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cacheStore.put(req.urlWithParams, event);
      }
    })
  );
};`;

  readonly cacheExplanations: CodeLineExplanation[] = [
    {
      lineRef: "if (req.method !== 'GET') return next(req);",
      concept: 'Seguridad de mutaciones (POST / PUT / DELETE)',
      explanation:
        'Las peticiones que modifican datos en el servidor nunca deben ser cacheadas. Filtramos estrictamente por método GET.',
    },
    {
      lineRef: 'return of(cachedResponse.clone());',
      concept: 'Cortocircuito del pipeline HTTP',
      explanation:
        'El operador of() de RxJS crea un Observable que emite inmediatamente el HttpResponse guardado en memoria y se completa en el mismo ciclo de reloj (0ms), sin generar tráfico de red.',
    },
    {
      lineRef: 'if (event instanceof HttpResponse) { cacheStore.put(...); }',
      concept: 'Captura de la respuesta en el viaje de vuelta',
      explanation:
        'Cuando la primera petición regresa del servidor con código 200, tap() guarda el objeto HttpResponse completo en un Map indexado por req.urlWithParams.',
    },
  ];
}
