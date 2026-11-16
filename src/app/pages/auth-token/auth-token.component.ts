import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BYPASS_AUTH_INTERCEPTOR } from '../../core/interceptors/http-context.tokens';
import { AuthStateService } from '../../core/services/auth-state.service';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';
import { HttpInspectorPanelComponent } from '../../shared/components/http-inspector-panel.component';

@Component({
  selector: 'app-auth-token',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent, HttpInspectorPanelComponent],
  template: `
    <div class="space-y-10">
      <!-- ENCABEZADO -->
      <header class="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 p-6 sm:p-8 space-y-3">
        <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
          <span>Sección 02 • Caso Principal</span>
          <span>•</span>
          <span>Autenticación JWT & Comparativa Directa</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Inyección de Access Token: <span class="text-rose-400">Sin Interceptor</span> vs <span class="text-emerald-400">Con Interceptor</span>
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          En cualquier aplicación real, decenas de servicios (<code class="text-indigo-300">ProfileService</code>, <code class="text-indigo-300">OrdersService</code>, <code class="text-indigo-300">BillingService</code>) necesitan enviar el encabezado <code class="text-emerald-300">Authorization: Bearer &lt;token&gt;</code> cuando el usuario ha iniciado sesión, y omitirlo cuando navega como invitado. Aquí verás cómo funciona en vivo, cómo luce el código sin interceptor vs con interceptor y por qué la diferencia arquitectónica es enorme.
        </p>
      </header>

      <!-- SIMULADOR INTERACTIVO EN VIVO -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Laboratorio Interactivo en Tiempo Real
            </span>
            <h2 class="text-xl font-bold text-white mt-0.5">
              1. Controla el Estado de Autenticación del Usuario
            </h2>
            <p class="text-xs sm:text-sm text-slate-400">
              Cambia el estado de sesión y observa cómo <code class="text-emerald-300">authInterceptor</code> decide automáticamente si clona la petición para inyectar el token o si la deja pasar intacta.
            </p>
          </div>

          <!-- Selector de estado de sesión -->
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              (click)="authState.login()"
              class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border"
              [class]="authState.isAuthenticated() && !authState.simulateExpiredToken()
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
            >
              🟢 Usuario Autenticado (Token Válido)
            </button>

            <button
              type="button"
              (click)="authState.logout()"
              class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border"
              [class]="!authState.isAuthenticated()
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
            >
              🔴 Usuario NO Autenticado (Anónimo)
            </button>

            <button
              type="button"
              (click)="authState.toggleExpiredToken()"
              class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border"
              [class]="authState.simulateExpiredToken()
                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
            >
              🟠 Simular Token Expirado
            </button>
          </div>
        </div>

        <!-- Tarjeta visual del estado actual del token -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-xl bg-slate-950 border border-slate-800 p-4">
          <div class="lg:col-span-4 space-y-1">
            <div class="text-xs text-slate-400">Estado actual en <code class="text-indigo-300">AuthStateService</code>:</div>
            @if (authState.isAuthenticated()) {
              <div class="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <span>Sesión Activa: {{ authState.currentUser()?.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  {{ authState.currentUser()?.role }}
                </span>
              </div>
            } @else {
              <div class="text-sm font-bold text-rose-400">
                Sin sesión (Invitado / No autenticado)
              </div>
            }
          </div>

          <div class="lg:col-span-8">
            <div class="text-xs text-slate-400 mb-1">Valor de <code class="text-indigo-300">authState.accessToken()</code> leído por el Interceptor:</div>
            <div class="font-mono text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 break-all">
              @if (authState.accessToken(); as token) {
                <span class="text-emerald-300">Authorization: Bearer {{ token }}</span>
              } @else {
                <span class="text-slate-500">null (El interceptor NO clonará la cabecera Authorization y dejará pasar la petición original)</span>
              }
            </div>
          </div>
        </div>

        <!-- Botones para disparar peticiones -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Columna Con Interceptor -->
          <div class="rounded-xl border border-emerald-800/60 bg-emerald-950/15 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">
                ✅ Con authInterceptor Activo
              </span>
              <span class="text-[11px] font-mono text-slate-400">this.http.get(url)</span>
            </div>
            <p class="text-xs text-slate-300">
              El servicio solo pide la URL. El interceptor inyecta el <code class="text-emerald-300">Bearer Token</code> automáticamente si estás autenticado.
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                (click)="callProtectedEndpoint('/api/profile', false)"
                class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                GET /api/profile
              </button>
              <button
                type="button"
                (click)="callProtectedEndpoint('/api/orders', false)"
                class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                GET /api/orders
              </button>
              <button
                type="button"
                (click)="callProtectedEndpoint('/api/billing', false)"
                class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                GET /api/billing
              </button>
              <button
                type="button"
                (click)="callProtectedEndpoint('/api/public/status', false)"
                class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                GET /api/public/status (Pública)
              </button>
            </div>
          </div>

          <!-- Columna Simulando Sin Interceptor / Olvido Manual -->
          <div class="rounded-xl border border-rose-800/60 bg-rose-950/15 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-rose-400">
                ❌ Simulando SIN Interceptor (Olvido de Header)
              </span>
              <span class="text-[11px] font-mono text-slate-400">Sin Header Manual</span>
            </div>
            <p class="text-xs text-slate-300">
              ¿Qué ocurre cuando NO usas un interceptor y a un desarrollador se le olvida adjuntar manualmente el <code class="text-rose-300">HttpHeaders</code> en un nuevo método? ¡Falla con 401 aunque el usuario tenga sesión activa!
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                (click)="callProtectedEndpoint('/api/orders', true)"
                class="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer"
              >
                Llamar /api/orders SIN Interceptor → Ver Fallo 401
              </button>
            </div>
          </div>
        </div>

        <!-- Resultado de la última llamada en vivo -->
        @if (lastResult()) {
          <div
            class="rounded-xl border p-4 text-xs font-mono space-y-2"
            [class]="lastResult()!.ok
              ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/30 border-rose-700/60 text-rose-200'"
          >
            <div class="flex items-center justify-between font-sans">
              <span class="font-bold text-sm">
                {{ lastResult()!.title }}
              </span>
              <span class="px-2.5 py-0.5 rounded font-mono text-xs bg-slate-900">
                HTTP {{ lastResult()!.status }}
              </span>
            </div>
            <pre class="overflow-x-auto text-slate-200 bg-slate-950/80 p-3 rounded-lg border border-slate-800">{{ lastResult()!.payload }}</pre>
          </div>
        }
      </section>

      <!-- INSPECTOR EN VIVO -->
      <app-http-inspector-panel />

      <!-- COMPARATIVA DE CÓDIGO LADO A LADO: SIN INTERCEPTOR VS CON INTERCEPTOR -->
      <section class="space-y-6">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Comparativa de Código y Explicación Bajo el Capó
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            2. ¿Cómo sería el código NO usando el Interceptor vs USÁNDOLO?
          </h2>
          <p class="text-sm text-slate-400">
            Analicemos exactamente qué pasa en tus servicios de Angular en ambos escenarios.
          </p>
        </div>

        <!-- ESCENARIO A: SIN INTERCEPTOR -->
        <div class="space-y-3">
          <h3 class="text-lg font-bold text-rose-400 flex items-center gap-2">
            <span>❌ Escenario A: Cómo sería NO usando el Interceptor (Enfoque Manual Repetitivo)</span>
          </h3>
          <app-code-explainer
            filename="servicios-sin-interceptor.ts (Anti-patrón)"
            badge="❌ Sin Interceptor: Alto acoplamiento y código duplicado"
            badgeType="bad"
            description="Sin un interceptor, CADA servicio y CADA método (GET, POST, PUT, DELETE) está obligado a inyectar AuthStateService, leer el token, construir un objeto HttpHeaders y pasarlo manualmente:"
            [code]="withoutInterceptorCode"
            [explanations]="withoutInterceptorExplanations"
          />
        </div>

        <!-- ESCENARIO B: CON INTERCEPTOR -->
        <div class="space-y-3 pt-4">
          <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span>✅ Escenario B: Cómo es USANDO el Interceptor (Arquitectura Limpia)</span>
          </h3>

          <div class="grid grid-cols-1 gap-6">
            <app-code-explainer
              filename="src/app/core/interceptors/auth.interceptor.ts"
              badge="✅ Paso 1: El Interceptor Centralizado"
              badgeType="good"
              description="Escribes la lógica de autenticación UNA SOLA VEZ en toda la aplicación. El interceptor evalúa si el usuario está autenticado o no en cada petición:"
              [code]="withInterceptorAuthCode"
              [explanations]="withInterceptorAuthExplanations"
            />

            <app-code-explainer
              filename="servicios-con-interceptor.ts"
              badge="✅ Paso 2: Tus Servicios quedan 100% limpios"
              badgeType="good"
              description="Mira cómo quedan ahora los mismos servicios (ProfileService, OrdersService, BillingService) gracias al interceptor:"
              [code]="cleanServicesCode"
              [explanations]="cleanServicesExplanations"
            />
          </div>
        </div>
      </section>

      <!-- TABLA Y TARJETAS DE BENEFICIOS Y MEJORAS -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
        <div class="space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Ventajas Arquitectónicas
          </span>
          <h2 class="text-2xl font-bold text-white">
            3. Beneficios y Mejoras de Usar el Interceptor frente al Enfoque Manual
          </h2>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-950 text-slate-300 uppercase text-xs">
              <tr>
                <th class="p-4 border-b border-slate-800">Criterio Técnico</th>
                <th class="p-4 border-b border-slate-800 text-rose-400">❌ Sin Interceptor (Manual en cada servicio)</th>
                <th class="p-4 border-b border-slate-800 text-emerald-400">✅ Con authInterceptor (Centralizado)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              <tr class="bg-slate-900/40">
                <td class="p-4 font-bold text-white">Principio DRY (No te repitas)</td>
                <td class="p-4">Si tienes 80 endpoints, repites la construcción de <code class="text-rose-300">HttpHeaders</code> 80 veces.</td>
                <td class="p-4">Se escribe <strong>1 sola vez</strong> en un archivo de 25 líneas.</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-white">Riesgo de Error Humano</td>
                <td class="p-4">Alto: si un desarrollador nuevo crea un método y olvida pasar <code class="text-rose-300">&#123; headers &#125;</code>, falla en producción con 401.</td>
                <td class="p-4">Cero: toda petición que salga por <code class="text-emerald-300">HttpClient</code> pasa obligatoriamente por el interceptor.</td>
              </tr>
              <tr class="bg-slate-900/40">
                <td class="p-4 font-bold text-white">Desacoplamiento (Single Responsibility)</td>
                <td class="p-4">Los servicios de negocio (<code class="text-slate-200">OrdersService</code>) dependen de <code class="text-rose-300">AuthStateService</code>.</td>
                <td class="p-4">Los servicios de negocio solo conocen <code class="text-emerald-300">HttpClient</code> y sus modelos de datos.</td>
              </tr>
              <tr>
                <td class="p-4 font-bold text-white">Evolución y Refresh Token</td>
                <td class="p-4">Si cambias de <code class="text-slate-200">Bearer</code> a otro esquema o agregas rotación de Refresh Token, debes editar decenas de archivos.</td>
                <td class="p-4">Actualizas únicamente <code class="text-emerald-300">auth.interceptor.ts</code> sin tocar ningún servicio ni componente.</td>
              </tr>
              <tr class="bg-slate-900/40">
                <td class="p-4 font-bold text-white">Pruebas Unitarias (Unit Testing)</td>
                <td class="p-4">En el test de cada servicio debes mockear <code class="text-rose-300">AuthStateService</code> además de <code class="text-slate-200">HttpTestingController</code>.</td>
                <td class="p-4">Pruebas el interceptor de forma aislada una vez, y los tests de tus servicios son directos.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Navegación inferior -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a
          routerLink="/fundamentos"
          class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
        >
          ← Anterior: Fundamentos
        </a>
        <a
          routerLink="/errores-y-reintentos"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Siguiente Caso de Uso (#2): Manejo Global de Errores y Retry →
        </a>
      </div>
    </div>
  `,
})
export class AuthTokenComponent {
  readonly authState = inject(AuthStateService);
  private readonly http = inject(HttpClient);

  readonly lastResult = signal<{
    ok: boolean;
    status: number;
    title: string;
    payload: string;
  } | null>(null);

  callProtectedEndpoint(url: string, bypassInterceptor: boolean): void {
    const context = new HttpContext().set(BYPASS_AUTH_INTERCEPTOR, bypassInterceptor);

    this.http.get(url, { context }).subscribe({
      next: (res) => {
        this.lastResult.set({
          ok: true,
          status: 200,
          title: bypassInterceptor
            ? `Respuesta exitosa (Ruta pública) en ${url}`
            : `✅ Petición exitosa a ${url} (Token inyectado por authInterceptor)`,
          payload: JSON.stringify(res, null, 2),
        });
      },
      error: (err: HttpErrorResponse) => {
        this.lastResult.set({
          ok: false,
          status: err.status,
          title: bypassInterceptor
            ? `❌ Fallo en ${url} porque se llamó SIN el Interceptor (No se envió Authorization)`
            : `❌ Servidor rechazó la petición a ${url} (Revisa si el usuario está autenticado o si el token expiró)`,
          payload: JSON.stringify(err.error, null, 2),
        });
      },
    });
  }

  readonly withoutInterceptorCode = `import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStateService } from '../core/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class OrdersServiceSinInterceptor {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService); // ❌ Acoplamiento forzado en cada servicio

  getProfile() {
    // ❌ Repetición #1: Leer el token y armar headers manualmente
    const token = this.authState.accessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', \`Bearer \${token}\`);
    }
    return this.http.get('/api/profile', { headers });
  }

  getOrders() {
    // ❌ Repetición #2: Exactamente el mismo bloque boilerplate otra vez
    const token = this.authState.accessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', \`Bearer \${token}\`);
    }
    return this.http.get('/api/orders', { headers });
  }

  getBilling() {
    // 💥 ERROR HUMANO COMÚN: A un desarrollador se le olvida crear los headers aquí
    // Aunque el usuario haya iniciado sesión, esta llamada fallará con 401 Unauthorized!
    return this.http.get('/api/billing');
  }
}`;

  readonly withoutInterceptorExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'private authState = inject(AuthStateService)',
      concept: 'Violación de Separación de Responsabilidades',
      explanation:
        'Un servicio de pedidos (OrdersService) o facturación (BillingService) no debería saber cómo se almacena ni cómo se formatea un JWT.',
    },
    {
      lineRef: 'let headers = new HttpHeaders(); if (token) { ... }',
      concept: 'Código Boilerplate multiplicado por cada endpoint',
      explanation:
        'En una aplicación mediana con 15 servicios y 6 métodos por servicio, tendrías que copiar y pegar este bloque condicional 90 veces.',
    },
    {
      lineRef: "return this.http.get('/api/billing'); // Olvido de headers",
      concept: 'Bugs silenciosos difíciles de rastrear',
      explanation:
        'TypeScript no te dará ningún error de compilación si olvidas pasar { headers }. Solo descubrirás el fallo en tiempo de ejecución cuando el servidor devuelva 401.',
    },
  ];

  readonly withInterceptorAuthCode = `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inyectamos el estado de autenticación dentro de la función
  const authState = inject(AuthStateService);

  // 2. Excluimos rutas públicas que no requieren enviar credenciales
  if (req.url.includes('/api/public')) {
    return next(req);
  }

  // 3. Consultamos si existe un Access Token activo en este instante
  const token = authState.accessToken();

  // 4. CASO USUARIO NO AUTENTICADO: Si no hay token, la petición sigue su curso normal
  if (!token) {
    return next(req);
  }

  // 5. CASO USUARIO AUTENTICADO: Clonamos la petición inmutable agregando el Bearer Token
  const authReq = req.clone({
    setHeaders: {
      Authorization: \`Bearer \${token}\`,
    },
  });

  // 6. Entregamos la petición autenticada al siguiente interceptor o al servidor
  return next(authReq);
};`;

  readonly withInterceptorAuthExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'const token = authState.accessToken();',
      concept: 'Evaluación dinámica en el momento exacto del disparo HTTP',
      explanation:
        'El interceptor no guarda un token viejo en caché; lee el Signal o estado actual cada vez que sale una petición. Si el usuario acaba de iniciar o cerrar sesión, el interceptor reacciona al instante.',
    },
    {
      lineRef: 'if (!token) { return next(req); }',
      concept: 'Comportamiento cuando el usuario NO está autenticado',
      explanation:
        'Si el usuario no ha iniciado sesión (token es null), no ensuciamos la petición con un header "Authorization: Bearer null". Simplemente pasamos la petición original intacta con next(req).',
    },
    {
      lineRef: 'const authReq = req.clone({ setHeaders: { Authorization: ... } })',
      concept: 'Inyección inmutable del JWT',
      explanation:
        'Crea un clon exacto de la petición original pero con el encabezado estándar OAuth2/JWT adjunto y lo envía hacia el backend.',
      underTheHood:
        'req.clone({ setHeaders }) internamente llama a req.headers.set(key, value) para cada propiedad y construye una nueva instancia de HttpRequest.',
    },
  ];

  readonly cleanServicesCode = `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrdersServiceConInterceptor {
  private http = inject(HttpClient); // ✅ Única dependencia necesaria

  getProfile() {
    return this.http.get('/api/profile');
  }

  getOrders() {
    return this.http.get('/api/orders');
  }

  getBilling() {
    return this.http.get('/api/billing');
  }
}`;

  readonly cleanServicesExplanations: CodeLineExplanation[] = [
    {
      lineRef: "return this.http.get('/api/orders');",
      concept: 'Código declarativo, limpio y seguro por defecto',
      explanation:
        'Cada método expresa únicamente QUÉ recurso de negocio solicita. La infraestructura de seguridad ocurre de forma transparente bajo el capó.',
    },
  ];
}
