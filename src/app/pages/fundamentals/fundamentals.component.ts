import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CodeExplainerComponent,
  CodeLineExplanation,
} from '../../shared/components/code-explainer.component';

@Component({
  selector: 'app-fundamentals',
  standalone: true,
  imports: [RouterLink, CodeExplainerComponent],
  template: `
    <div class="space-y-10">
      <!-- Encabezado -->
      <header class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-3">
        <div class="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider">
          <span>Sección 01</span>
          <span>•</span>
          <span>Arquitectura Interna de Angular HTTP</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-white">
          Fundamentos: ¿Cómo funciona un Interceptor por debajo?
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          Antes de ver los casos de uso, comprendamos exactamente qué recibe un interceptor, por qué las peticiones son <strong>inmutables</strong>, cómo funciona la tubería reactiva de RxJS y cómo se diferencia el enfoque moderno funcional del enfoque clásico basado en clases.
        </p>
      </header>

      <!-- 3 Conceptos Pilares -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
          <div class="text-xs font-mono font-bold text-indigo-400">PILAR 1 • EL PARÁMETRO req</div>
          <h3 class="text-lg font-bold text-white">Inmutabilidad de HttpRequest</h3>
          <p class="text-sm text-slate-300 leading-relaxed">
            El objeto <code class="text-indigo-300">req: HttpRequest&lt;unknown&gt;</code> tiene sus propiedades bloqueadas contra escritura. <strong>No puedes hacer</strong> <code class="text-rose-400">req.headers.append(...)</code> porque ese método devuelve una nueva instancia sin modificar la original. Siempre debes usar <code class="text-emerald-300">req.clone(&#123; ... &#125;)</code>.
          </p>
          <p class="text-xs text-slate-400 pt-2 border-t border-slate-800">
            <strong>¿Por qué Angular lo diseñó así?</strong> Porque si un interceptor de reintento (<code class="text-amber-300">retry()</code>) vuelve a ejecutar la petición, necesita partir de un estado predecible y seguro sin efectos secundarios acumulados.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
          <div class="text-xs font-mono font-bold text-cyan-400">PILAR 2 • EL PARÁMETRO next</div>
          <h3 class="text-lg font-bold text-white">HttpHandlerFn y el Flujo RxJS</h3>
          <p class="text-sm text-slate-300 leading-relaxed">
            <code class="text-cyan-300">next</code> es una función que representa al <strong>siguiente eslabón</strong> de la cadena (otro interceptor o el backend final <code class="text-slate-200">HttpBackend</code> que ejecuta <code class="text-slate-200">fetch / XMLHttpRequest</code>).
          </p>
          <p class="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Todo lo que escribas <strong>antes</strong> de <code class="text-cyan-300">return next(req)</code> se ejecuta a la <strong>IDA</strong>. Todo lo que encadenes dentro de <code class="text-cyan-300">next(req).pipe(...)</code> se ejecuta a la <strong>VUELTA</strong> cuando el servidor contesta.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
          <div class="text-xs font-mono font-bold text-emerald-400">PILAR 3 • INYECCIÓN DE DEPENDENCIAS</div>
          <h3 class="text-lg font-bold text-white">Contexto de Inyección con inject()</h3>
          <p class="text-sm text-slate-300 leading-relaxed">
            Aunque un interceptor moderno es una simple función (<code class="text-emerald-300">HttpInterceptorFn</code>), Angular la ejecuta dentro de un <strong>EnvironmentInjector context</strong>.
          </p>
          <p class="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Esto te permite llamar a <code class="text-emerald-300">inject(AuthService)</code>, <code class="text-emerald-300">inject(Router)</code> o cualquier servicio singleton directamente en la primera línea de tu función.
          </p>
        </div>
      </section>

      <!-- Anatomía completa de un Interceptor -->
      <section class="space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-white">
          Anatomía Completa de un Interceptor Funcional (<code class="text-indigo-400">HttpInterceptorFn</code>)
        </h2>

        <app-code-explainer
          filename="anatomia-interceptor.ts"
          badge="Estándar Angular 15 hasta Angular 21+"
          badgeType="good"
          description="Observa las dos mitades de un interceptor: la transformación de salida (antes de next) y la intercepción de entrada (dentro de .pipe()):"
          [code]="anatomyCode"
          [explanations]="anatomyExplanations"
        />
      </section>

      <!-- Orden de ejecución FIFO / LIFO -->
      <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h2 class="text-xl font-bold text-white">
          El Efecto "Cebolla": Orden de Ejecución en Cadena
        </h2>
        <p class="text-sm text-slate-300">
          Si registras <code class="text-indigo-300">withInterceptors([interceptorA, interceptorB, interceptorC])</code>, las peticiones atraviesan las capas como una cebolla:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div class="text-indigo-400 font-bold mb-2">1️⃣ Fase de Salida (Request — Orden FIFO)</div>
            <div class="text-slate-300">1. Entra a <span class="text-emerald-300">interceptorA</span> (antes de next)</div>
            <div class="text-slate-300">2. Entra a <span class="text-cyan-300">interceptorB</span> (antes de next)</div>
            <div class="text-slate-300">3. Entra a <span class="text-amber-300">interceptorC</span> (antes de next)</div>
            <div class="text-indigo-300">4. 🌐 Sale por red hacia el Servidor Backend</div>
          </div>

          <div class="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div class="text-amber-400 font-bold mb-2">2️⃣ Fase de Regreso (Response — Orden LIFO)</div>
            <div class="text-indigo-300">5. 📥 Llega respuesta HTTP del Servidor</div>
            <div class="text-slate-300">6. Ejecuta <span class="text-amber-300">interceptorC.pipe()</span></div>
            <div class="text-slate-300">7. Ejecuta <span class="text-cyan-300">interceptorB.pipe()</span></div>
            <div class="text-slate-300">8. Ejecuta <span class="text-emerald-300">interceptorA.pipe()</span> y entrega al <code class="text-white">subscribe()</code></div>
          </div>
        </div>
      </section>

      <!-- Comunicación por petición con HttpContextToken -->
      <section class="space-y-4">
        <div class="space-y-1">
          <h2 class="text-xl sm:text-2xl font-bold text-white">
            Control Quirúrgico con <code class="text-indigo-400">HttpContextToken</code>
          </h2>
          <p class="text-sm text-slate-400">
            ¿Qué pasa si un interceptor es global, pero en <strong>una petición específica</strong> necesitas desactivarlo (por ejemplo, no mostrar el spinner global o no enviar el token a una API externa)? Para eso existe <code class="text-indigo-300">HttpContextToken</code>.
          </p>
        </div>

        <app-code-explainer
          filename="http-context-token-ejemplo.ts"
          badge="Patrón Avanzado Oficial"
          badgeType="info"
          description="A diferencia de los HttpHeaders, los metadatos de HttpContext NUNCA viajan por la red al servidor; solo viven en memoria para que tus interceptores lean instrucciones."
          [code]="contextTokenCode"
          [explanations]="contextTokenExplanations"
        />
      </section>

      <!-- Siguiente paso -->
      <div class="flex justify-end">
        <a
          routerLink="/auth-token"
          class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
        >
          Continuar a la Sección 02: Inyección de Access Token (Sin vs Con Interceptor) →
        </a>
      </div>
    </div>
  `,
})
export class FundamentalsComponent {
  readonly anatomyCode = `import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, finalize } from 'rxjs';
import { MiServicioDeEstado } from './mi-servicio';

export const ejemploAnatomiaInterceptor: HttpInterceptorFn = (req, next) => {
  // [A] INYECCIÓN: Se ejecuta en el contexto del EnvironmentInjector
  const estado = inject(MiServicioDeEstado);

  // [B] FASE DE IDA (Request): Clonamos porque 'req' es inmutable
  const reqModificada = req.clone({
    setHeaders: { 'X-Custom-Header': 'Valor-Inyectado' }
  });

  // [C] INVOCACIÓN AL SIGUIENTE ESLABÓN + FASE DE VUELTA (Response Stream)
  return next(reqModificada).pipe(
    tap((evento) => {
      // Un flujo HTTP emite varios eventos; filtramos cuando llega la respuesta final
      if (evento instanceof HttpResponse) {
        console.log('Respuesta recibida con status:', evento.status);
      }
    }),
    finalize(() => {
      // Se ejecuta SIEMPRE al terminar (éxito, error o cancelación de suscripción)
      estado.marcarPeticionTerminada();
    })
  );
};`;

  readonly anatomyExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'export const ejemplo: HttpInterceptorFn = (req, next) =>',
      concept: 'Firma funcional pura',
      explanation:
        'A partir de Angular 15+, no necesitas crear una clase con @Injectable() ni implementar la interfaz HttpInterceptor ni usar multi: true. Basta con exportar una función que cumpla con el tipo HttpInterceptorFn.',
    },
    {
      lineRef: 'const reqModificada = req.clone({ ... })',
      concept: 'Clonación segura de la petición',
      explanation:
        'req.clone() crea una copia exacta de la petición original aplicando únicamente los cambios indicados (setHeaders, setParams, body o url).',
      underTheHood:
        'Si intentaras mutar req.headers.set(...) sin asignarlo ni clonar, el cambio se perdería silenciosamente porque HttpHeaders también aplica Copy-on-Write inmutable.',
    },
    {
      lineRef: 'return next(reqModificada).pipe(...)',
      concept: 'Suscripción al flujo de eventos HTTP',
      explanation:
        'next() devuelve un Observable<HttpEvent<unknown>>. Al conectar operadores RxJS con .pipe(), puedes inspeccionar la respuesta (tap), transformarla (map), capturar fallos (catchError) o reintentarla (retry).',
    },
  ];

  readonly contextTokenCode = `// 1. Definimos el Token con su valor por defecto (false)
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

// 2. En el servicio que hace la petición silenciosa:
this.http.get('/api/notificaciones/polling', {
  context: new HttpContext().set(SKIP_GLOBAL_LOADER, true)
});

// 3. Dentro del loadingInterceptor leemos la bandera:
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req); // Ignora el spinner y pasa directo
  }
  // ... lógica normal del spinner
};`;

  readonly contextTokenExplanations: CodeLineExplanation[] = [
    {
      lineRef: 'new HttpContextToken<boolean>(() => false)',
      concept: 'Creación de una clave tipada de metadatos',
      explanation:
        'Define un token fuertemente tipado y su fábrica de valor por defecto. Si una petición no especifica este token, req.context.get() devolverá false automáticamente.',
    },
    {
      lineRef: 'context: new HttpContext().set(SKIP_GLOBAL_LOADER, true)',
      concept: 'Paso de metadatos desde HttpClient',
      explanation:
        'Permite que un componente o servicio le envíe instrucciones específicas a uno o varios interceptores sin contaminar los headers HTTP que salen hacia el backend.',
    },
  ];
}
