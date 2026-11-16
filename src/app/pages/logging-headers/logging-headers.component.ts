import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientMetadataConfigService } from '../../core/interceptors/logging-headers.interceptor';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-logging-headers',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
          <span>Sección 06 • Caso de Uso #5</span>
          <span>•</span>
          <span>Observabilidad, Multi-Tenant & Profiling</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Auditoría, Medición de Latencia y Headers Corporativos Globales
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          En arquitecturas de microservicios necesitas enviar en cada petición un identificador único de trazabilidad (<code class="text-purple-300">X-Request-ID</code>), el idioma activo (<code class="text-purple-300">Accept-Language</code>), el identificador de organización (<code class="text-purple-300">X-Tenant-ID</code>) y medir exactamente cuántos milisegundos tarda cada endpoint usando <code class="text-indigo-300">performance.now()</code>.
        </p>
      </header>

      <!-- SIMULADOR DE METADATOS Y TELEMETRÍA -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Selector de idioma -->
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Idioma (<code class="text-purple-300">Accept-Language</code>)
            </label>
            <div class="flex gap-2">
              @for (lang of languages; track lang) {
                <button
                  type="button"
                  (click)="metadataConfig.preferredLang.set(lang)"
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border"
                  [class]="metadataConfig.preferredLang() === lang
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'"
                >
                  {{ lang }}
                </button>
              }
            </div>
          </div>

          <!-- Selector de Tenant -->
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Organización (<code class="text-purple-300">X-Tenant-ID</code>)
            </label>
            <div class="flex flex-wrap gap-2">
              @for (tenant of tenants; track tenant) {
                <button
                  type="button"
                  (click)="metadataConfig.tenantId.set(tenant)"
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border"
                  [class]="metadataConfig.tenantId() === tenant
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'"
                >
                  {{ tenant }}
                </button>
              }
            </div>
          </div>

          <!-- Botón de disparo -->
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between">
            <div class="text-xs text-slate-400">
              Prueba cómo el servidor recibe los headers inyectados:
            </div>
            <button
              type="button"
              (click)="sendTelemetryEcho()"
              class="mt-2 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-purple-600/25"
            >
              📡 Enviar Petición a /api/telemetry/echo
            </button>
          </div>
        </div>

        @if (echoResponse()) {
          <div class="rounded-xl bg-slate-950 border border-purple-800/50 p-4 space-y-2 text-xs">
            <div class="font-bold text-purple-300">
              Respuesta del Servidor confirmando los Headers recibidos:
            </div>
            <pre class="font-mono text-slate-200 overflow-x-auto bg-slate-900 p-3 rounded-lg">{{ echoResponse() }}</pre>
          </div>
        }
      </section>

      <app-http-inspector-panel />

      <!-- EXPLICACIÓN DE CÓDIGO -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-white">
          Código y Explicación Bajo el Capó: <code class="text-purple-400">loggingAndHeadersInterceptor</code>
        </h2>

        <app-code-explainer
          filename="src/app/core/interceptors/logging-headers.interceptor.ts"
          badge="Correlation ID + Profiling con performance.now()"
          badgeType="good"
          description="Cada llamada genera su propio alcance léxico (closure) con startTime y requestId, permitiendo medir tiempos exactos incluso cuando hay 10 peticiones simultáneas:"
          [code]="telemetryCode"
          [explanations]="telemetryExplanations"
        />
      </section>

      <!-- Navegación -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/cache-http"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Caché HTTP
        </a>
        <a
          routerLink="/transformacion-respuestas"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Siguiente Caso de Uso (#6): Transformación de Respuestas →
        </a>
      </div>
    </div>
  `,
})
export class LoggingHeadersComponent {
  private readonly http = inject(HttpClient);
  readonly metadataConfig = inject(ClientMetadataConfigService);

  readonly languages: ('es-MX' | 'en-US' | 'pt-BR')[] = ['es-MX', 'en-US', 'pt-BR'];
  readonly tenants: string[] = ['tenant-latam-01', 'tenant-eu-99'];
  readonly echoResponse = signal<string>('');

  sendTelemetryEcho(): void {
    this.http.get('/api/telemetry/echo').subscribe((res) => {
      this.echoResponse.set(JSON.stringify(res, null, 2));
    });
  }

  readonly telemetryCode = `import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { ClientMetadataConfigService } from './client-metadata.service';

export const loggingAndHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const metadata = inject(ClientMetadataConfigService);

  // 1. Capturamos el timestamp de alta resolución en el closure de ESTA petición
  const startTime = performance.now();
  const requestId = 'req_' + crypto.randomUUID().slice(0, 8);

  // 2. Clonamos la petición adjuntando cabeceras de trazabilidad e internacionalización
  const tracedReq = req.clone({
    setHeaders: {
      'X-Request-ID': requestId,
      'X-App-Version': metadata.appVersion(),
      'Accept-Language': metadata.preferredLang(),
      'X-Tenant-ID': metadata.tenantId(),
    },
  });

  // 3. Al regresar la respuesta, calculamos la diferencia exacta de tiempo
  return next(tracedReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const durationMs = Math.round(performance.now() - startTime);
          console.info(\`[\${requestId}] \${req.method} \${req.url} -> \${event.status} (\${durationMs}ms)\`);
        }
      },
      error: (err) => {
        const durationMs = Math.round(performance.now() - startTime);
        console.error(\`[\${requestId}] FALLÓ \${req.url} tras \${durationMs}ms\`, err.status);
      },
    })
  );
};`;

  readonly telemetryExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'const startTime = performance.now();',
      concept: 'Aislamiento por Closure en cada petición',
      explanation:
        'Como HttpInterceptorFn es una función que se invoca de nuevo por cada petición HTTP, la constante startTime y requestId viven en la memoria privada (closure) de esa petición específica sin mezclarse con otras llamadas paralelas.',
    },
    {
      lineRef: "'X-Request-ID': requestId",
      concept: 'Correlation ID para logs distribuidos (Datadog / OpenTelemetry)',
      explanation:
        'Si un usuario reporta un fallo, el soporte técnico puede buscar ese mismo X-Request-ID tanto en el navegador como en los logs del backend para reconstruir la traza completa.',
    },
  ];
}
