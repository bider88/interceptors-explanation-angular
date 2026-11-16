import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-response-transform',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-wider">
          <span>Sección 07 • Caso de Uso #6</span>
          <span>•</span>
          <span>Transformación de HttpResponse con RxJS map()</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Desempaquetado y Normalización de Respuestas (Adapter Interceptor)
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          Así como puedes clonar la petición (<code class="text-indigo-300">req.clone()</code>) al salir, también puedes clonar y transformar la respuesta (<code class="text-teal-300">event.clone(&#123; body: nuevoBody &#125;)</code>) cuando regresa del servidor. Esto es ideal para limpiar "envelopes" de APIs legacy, convertir strings ISO a objetos <code class="text-slate-200">Date</code> o estandarizar formatos sin ensuciar tus componentes.
        </p>
      </header>

      <!-- SIMULADOR -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-teal-400">
              Demostración de Transformación en Vuelo
            </span>
            <h2 class="text-xl font-bold text-white mt-0.5">
              De Envelope Legacy Crudo → Objeto Limpio en el Componente
            </h2>
          </div>

          <button
            type="button"
            (click)="fetchLegacyCustomer()"
            class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-teal-600/20"
          >
            🔄 Consultar GET /api/legacy/customer
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div class="font-sans font-bold text-slate-400">
              1. Lo que el Servidor Legacy envió por red (Crudo):
            </div>
            <pre class="text-amber-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">{{ rawServerExample }}</pre>
          </div>

          <div class="rounded-xl bg-slate-950 border border-teal-800/60 p-4 space-y-2">
            <div class="font-sans font-bold text-teal-300">
              2. Lo que recibió tu subscribe() tras pasar por responseTransformInterceptor:
            </div>
            @if (transformedResult()) {
              <pre class="text-emerald-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">{{ transformedResult() }}</pre>
            } @else {
              <div class="text-slate-500 font-sans py-6 text-center">
                Haz clic en "Consultar GET /api/legacy/customer" para ver el cuerpo ya desempaquetado.
              </div>
            }
          </div>
        </div>
      </section>

      <app-http-inspector-panel />

      <!-- EXPLICACIÓN DE CÓDIGO -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-white">
          Código y Explicación Bajo el Capó: <code class="text-teal-400">responseTransformInterceptor</code>
        </h2>

        <app-code-explainer
          filename="src/app/core/interceptors/response-transform.interceptor.ts"
          badge="Mutación inmutable del HttpResponse con event.clone()"
          badgeType="good"
          description="Observa cómo usamos el operador map() de RxJS para interceptar la instancia de HttpResponse y reemplazar su body:"
          [code]="transformCode"
          [explanations]="transformExplanations"
        />
      </section>

      <!-- Navegación -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/auditoria-y-headers"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Auditoría y Headers
        </a>
        <a
          routerLink="/"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Volver al Directorio Principal 🏠
        </a>
      </div>
    </div>
  `,
})
export class ResponseTransformComponent {
  private readonly http = inject(HttpClient);
  readonly transformedResult = signal<string>('');

  readonly rawServerExample = `{
  "legacy_version": "v1.2-soap-bridge",
  "internal_trace": "SRV_LEGACY_991",
  "payload_data": {
    "customerId": "CUST-8841",
    "fullName": "Carlos Mendoza",
    "plan": "Enterprise Anual",
    "active": true
  }
}`;

  fetchLegacyCustomer(): void {
    this.http.get('/api/legacy/customer').subscribe((res) => {
      this.transformedResult.set(JSON.stringify(res, null, 2));
    });
  }

  readonly transformCode = `import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

export const responseTransformInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/legacy/')) {
    return next(req);
  }

  return next(req).pipe(
    map((event) => {
      // 1. Verificamos que el evento sea la respuesta HTTP final
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const rawBody = event.body as Record<string, any>;

        // 2. Si viene envuelto en 'payload_data', extraemos directamente el contenido útil
        if ('payload_data' in rawBody) {
          const cleanBody = {
            ...rawBody['payload_data'],
            _normalizedByInterceptor: true,
          };

          // 3. HttpResponse también es inmutable: usamos event.clone({ body })
          return event.clone({ body: cleanBody });
        }
      }
      return event;
    })
  );
};`;

  readonly transformExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'map((event) => { if (event instanceof HttpResponse) ... })',
      concept: 'Transformación del flujo de entrada con RxJS map()',
      explanation:
        'A diferencia de tap() (que solo observa sin modificar), map() nos permite sustituir el HttpResponse original por un clon con el body ya limpio.',
    },
    {
      lineRef: 'return event.clone({ body: cleanBody });',
      concept: 'Clonación de HttpResponse',
      explanation:
        'Así como HttpRequest tiene req.clone(), HttpResponse ofrece event.clone({ body, headers, status }) para entregar al componente un modelo limpio.',
    },
  ];
}
