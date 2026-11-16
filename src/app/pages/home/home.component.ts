import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';

interface DirectorySectionCard {
  number: string;
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  highlights: string[];
  accentClass: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent],
  template: `
    <div class="space-y-12">
      <!-- HERO EXPLICATIVO -->
      <section class="relative rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div class="max-w-4xl space-y-5">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <span>⚡ Guía Interactiva + Laboratorio en Vivo</span>
            <span>•</span>
            <span>Angular HttpInterceptorFn</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            ¿Qué son los <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Interceptores en Angular</span> y cómo funcionan por debajo?
          </h1>

          <p class="text-base sm:text-lg text-slate-300 leading-relaxed">
            Un <strong>Interceptor HTTP</strong> en Angular es un <em>middleware</em> (o caseta de peaje) que se sitúa automáticamente entre tu aplicación (<code class="text-indigo-300">HttpClient</code>) y el servidor backend. Permite <strong>inspeccionar, clonar, transformar o cortocircuitar</strong> cualquier petición antes de que salga a la red, así como procesar globalmente las respuestas o errores cuando regresan.
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <a
              routerLink="/auth-token"
              class="px-5 py-3 rounded-4xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              Ir al Caso Principal: Access Token (Sin vs Con Interceptor) →
            </a>
            <a
              routerLink="/fundamentos"
              class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              Explorar Arquitectura Interna primero
            </a>
          </div>
        </div>
      </section>

      <!-- DIAGRAMA VISUAL DEL FLUJO DE UN INTERCEPTOR -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div class="space-y-1">
          <h2 class="text-xl sm:text-2xl font-bold text-white">
            El Modelo Mental: Flujo de Ida (Request) y Vuelta (Response)
          </h2>
          <p class="text-sm text-slate-400">
            Cada vez que ejecutas <code class="text-indigo-300">this.http.get('/api/datos')</code>, la petición atraviesa la tubería de interceptores en orden de registro.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <div class="text-xs font-mono text-slate-400 mb-1">1. Origen</div>
            <div class="font-bold text-white text-sm">Componente / Servicio</div>
            <div class="text-xs text-indigo-300 font-mono mt-1">http.get('/api/orders')</div>
          </div>

          <div class="rounded-xl bg-indigo-950/40 border border-indigo-700/50 p-4">
            <div class="text-xs font-mono text-indigo-300 mb-1">2. Ida (Pre-procesamiento)</div>
            <div class="font-bold text-white text-sm">Auth & Headers Interceptor</div>
            <div class="text-xs text-slate-300 mt-1">Clona <code class="text-indigo-300">req</code> e inyecta <code class="text-emerald-300">Bearer Token</code></div>
          </div>

          <div class="rounded-xl bg-cyan-950/40 border border-cyan-700/50 p-4">
            <div class="text-xs font-mono text-cyan-300 mb-1">3. Control de Flujo</div>
            <div class="font-bold text-white text-sm">Cache & Loader Interceptor</div>
            <div class="text-xs text-slate-300 mt-1">Activa Spinner o responde desde Caché</div>
          </div>

          <div class="rounded-xl bg-amber-950/40 border border-amber-700/50 p-4">
            <div class="text-xs font-mono text-amber-300 mb-1">4. Vuelta (RxJS Pipe)</div>
            <div class="font-bold text-white text-sm">Error & Retry Interceptor</div>
            <div class="text-xs text-slate-300 mt-1">Reintenta fallos 503 y captura 401/500</div>
          </div>

          <div class="rounded-xl bg-emerald-950/40 border border-emerald-700/50 p-4">
            <div class="text-xs font-mono text-emerald-300 mb-1">5. Destino</div>
            <div class="font-bold text-white text-sm">Servidor Backend</div>
            <div class="text-xs text-slate-300 mt-1">Recibe headers validados y responde JSON</div>
          </div>
        </div>
      </section>

      <!-- DIRECTORIO DE SECCIONES (NAVEGACIÓN PRINCIPAL) -->
      <section class="space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Directorio Interactivo de Módulos
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Explora cada sección y caso de uso práctico
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-slate-400">
            Haz clic en cualquier tarjeta para abrir su simulador interactivo y su explicación de código línea por línea.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (sec of directorySections; track sec.route) {
            <a
              [routerLink]="sec.route"
              class="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-indigo-500/60 p-6 transition-all flex flex-col justify-between shadow-lg"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                    {{ sec.number }}
                  </span>
                  <span
                    class="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    [class]="sec.accentClass"
                  >
                    {{ sec.badge }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                  {{ sec.title }}
                </h3>

                <p class="text-sm text-slate-400 leading-relaxed">
                  {{ sec.subtitle }}
                </p>

                <ul class="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  @for (point of sec.highlights; track point) {
                    <li class="flex items-start gap-2">
                      <span class="text-indigo-400 mt-0.5">▹</span>
                      <span>{{ point }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Abrir módulo interactivo</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- CÓMO SE REGISTRAN LOS INTERCEPTORES EN ESTA APLICACIÓN -->
      <section class="space-y-4">
        <div class="space-y-1">
          <h2 class="text-xl sm:text-2xl font-bold text-white">
            ¿Cómo se conectan todos estos interceptores en Angular?
          </h2>
          <p class="text-sm text-slate-400">
            En Angular moderno (Standalone APIs), todos los interceptores funcionales se registran una única vez en <code class="text-indigo-300">app.config.ts</code> usando <code class="text-indigo-300">provideHttpClient(withInterceptors([...]))</code>.
          </p>
        </div>

        <app-code-explainer
          filename="src/app/app.config.ts"
          badge="Configuración Real de este Proyecto"
          badgeType="good"
          description="Así están registrados los 5 interceptores reales que puedes probar en vivo dentro de esta aplicación:"
          [code]="appConfigCode"
          [explanations]="appConfigExplanations"
        />
      </section>
    </div>
  `,
})
export class HomeComponent {
  readonly directorySections: DirectorySectionCard[] = [
    {
      number: 'SECCIÓN 01',
      title: 'Fundamentos y Cómo Funcionan por Debajo',
      subtitle:
        'Anatomía de HttpInterceptorFn, por qué HttpRequest es inmutable, el rol de req.clone(), next(req) y el orden de ejecución.',
      route: '/fundamentos',
      badge: 'Arquitectura Base',
      accentClass: 'bg-sky-950 text-sky-300 border-sky-800',
      highlights: [
        'Qué parámetros recibe (req, next) y qué devuelven',
        'Por qué está prohibido mutar req.headers directamente',
        'Diferencia entre Interceptor Funcional vs de Clase',
        'Uso avanzado de HttpContextToken por petición',
      ],
    },
    {
      number: 'SECCIÓN 02 • CASO PRINCIPAL',
      title: 'Inyección de Access Token (Sin vs Con Interceptor)',
      subtitle:
        'El caso más importante en el mundo real: inyectar el JWT cuando el usuario está autenticado, qué ocurre cuando no lo está y comparativa completa.',
      route: '/auth-token',
      badge: 'Requerido Principal',
      accentClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      highlights: [
        'Simulador en vivo: Autenticado, Anónimo y Token Expirado',
        'Código SIN usar interceptor (repetición y acoplamiento)',
        'Código USANDO authInterceptor limpio y centralizado',
        'Tabla detallada de beneficios, seguridad y escalabilidad',
      ],
    },
    {
      number: 'SECCIÓN 03 • CASO DE USO #2',
      title: 'Manejo Global de Errores y Reintentos (Retry)',
      subtitle:
        'Captura centralizada de errores HTTP (401, 403, 500) y recuperación automática ante microcortes 503 usando operadores RxJS.',
      route: '/errores-y-reintentos',
      badge: 'Resiliencia RxJS',
      accentClass: 'bg-rose-950 text-rose-300 border-rose-800',
      highlights: [
        'Reintentos automáticos con retry({ count, delay })',
        'Notificaciones globales sin ensuciar cada componente',
        'Simulador en vivo de errores 401, 403, 500 y 503',
        'Explicación línea por línea de catchError y throwError',
      ],
    },
    {
      number: 'SECCIÓN 04 • CASO DE USO #3',
      title: 'Loader / Spinner Global Automático',
      subtitle:
        'Control automático de indicadores de carga para peticiones simples o múltiples peticiones simultáneas usando finalize().',
      route: '/loader-global',
      badge: 'UX reactiva',
      accentClass: 'bg-amber-950 text-amber-300 border-amber-800',
      highlights: [
        'Por qué usar un contador de peticiones activas en vez de un booleano',
        'Garantía de limpieza con el operador RxJS finalize()',
        'Cómo excluir peticiones silenciosas con HttpContextToken',
        'Prueba en vivo disparando 3 peticiones en paralelo',
      ],
    },
    {
      number: 'SECCIÓN 05 • CASO DE USO #4',
      title: 'Caché HTTP en Memoria con TTL',
      subtitle:
        'Optimización extrema: cómo un interceptor puede responder en 0ms sin tocar la red devolviendo un Observable of(cachedResponse).',
      route: '/cache-http',
      badge: 'Rendimiento 0ms',
      accentClass: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      highlights: [
        'Cortocircuitar next(req) cuando existe respuesta en caché',
        'Almacenar respuestas exitosas al vuelo con tap()',
        'Invalidación manual y forzado de recarga (FORCE_REFRESH)',
        'Tabla en vivo del estado de la memoria caché y contador de HITs',
      ],
    },
    {
      number: 'SECCIÓN 06 • CASO DE USO #5',
      title: 'Auditoría, Tiempos de Respuesta y Headers Globales',
      subtitle:
        'Inyección de Correlation ID (X-Request-ID), idioma (Accept-Language), versión de app y medición exacta en milisegundos.',
      route: '/auditoria-y-headers',
      badge: 'Observabilidad',
      accentClass: 'bg-purple-950 text-purple-300 border-purple-800',
      highlights: [
        'Trazabilidad distribuida con X-Request-ID único por llamada',
        'Medición de latencia real con performance.now()',
        'Configuración dinámica de idioma y Multi-Tenant header',
        'Inspector interactivo de eco del servidor',
      ],
    },
    {
      number: 'SECCIÓN 07 • CASO DE USO #6',
      title: 'Transformación y Normalización de Respuestas (Adapter)',
      subtitle:
        'Desempaquetado automático de respuestas de APIs legacy usando RxJS map() y event.clone({ body }) antes de llegar al componente.',
      route: '/transformacion-respuestas',
      badge: 'Adapter RxJS',
      accentClass: 'bg-teal-950 text-teal-300 border-teal-800',
      highlights: [
        'Mutación inmutable de HttpResponse con event.clone()',
        'Limpieza de envelopes legacy sin repetir map() en servicios',
        'Simulador en vivo Crudo vs Normalizado',
        'Explicación paso a paso del operador map()',
      ],
    },
  ];

  readonly appConfigCode = `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorRetryInterceptor } from './core/interceptors/error-retry.interceptor';
import { loggingAndHeadersInterceptor } from './core/interceptors/logging-headers.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,             // 1. Inyecta Authorization: Bearer <token>
        loggingAndHeadersInterceptor,// 2. Añade X-Request-ID y mide latencia
        loadingInterceptor,          // 3. Activa/desactiva el loader global
        cacheInterceptor,            // 4. Responde desde caché en GET repetidos
        errorRetryInterceptor,       // 5. Reintenta 503 y procesa errores 401/403/500
      ])
    ),
  ],
};`;

  readonly appConfigExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'provideHttpClient(...)',
      concept: 'Habilitación del motor HTTP moderno de Angular',
      explanation:
        'Registra el servicio HttpClient en el inyector raíz de la aplicación sin necesidad del antiguo HttpClientModule.',
      underTheHood:
        'Crea internamente un HttpInterceptorHandler que encadena todas las funciones pasadas a withInterceptors.',
    },
    {
      lineRef: 'withInterceptors([ ... ])',
      concept: ' Tubería ordenada de interceptores funcionales',
      explanation:
        'Recibe un arreglo de funciones tipo HttpInterceptorFn. El orden del arreglo define el orden exacto en que la petición los atraviesa.',
      underTheHood:
        'En la IDA (Request) se ejecutan del índice 0 al final. En la VUELTA (Response) los operadores RxJS se resuelven desde el último hacia el índice 0.',
    },
  ];
}
