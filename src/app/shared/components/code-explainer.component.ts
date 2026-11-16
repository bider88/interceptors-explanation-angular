import { Component, input, signal } from '@angular/core';

export interface CodeLineExplanation {
  lineRef: string;
  concept: string;
  explanation: string;
  underTheHood?: string;
}

@Component({
  selector: 'app-code-explainer',
  standalone: true,
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
      <!-- Header de la ventana de código -->
      <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <span class="text-xs font-mono font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
            {{ filename() }}
          </span>
          @if (badge()) {
            <span
              class="text-xs font-medium px-2.5 py-0.5 rounded-full"
              [class]="badgeType() === 'bad'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : badgeType() === 'good'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-sky-950 text-sky-300 border border-sky-800'"
            >
              {{ badge() }}
            </span>
          }
        </div>

        <button
          type="button"
          (click)="copyCode()"
          class="text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        >
          {{ copied() ? '✓ Copiado' : 'Copiar código' }}
        </button>
      </div>

      <!-- Descripción contextual superior -->
      @if (description()) {
        <div class="px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 text-sm text-slate-300">
          {{ description() }}
        </div>
      }

      <!-- Bloque de código -->
      <div class="p-5 overflow-x-auto bg-slate-950/70">
        <pre class="text-xs sm:text-sm font-mono leading-relaxed text-slate-100"><code>{{ code() }}</code></pre>
      </div>

      <!-- Desglose línea por línea / Por debajo del capó -->
      @if (explanations().length > 0) {
        <div class="border-t border-slate-800 bg-slate-900/95 p-5">
          <div class="flex items-center gap-2 mb-4">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              🔍
            </span>
            <h4 class="text-sm font-bold uppercase tracking-wider text-indigo-300">
              ¿Qué hace este código por debajo? (Explicación paso a paso)
            </h4>
          </div>

          <div class="space-y-3">
            @for (item of explanations(); track item.lineRef) {
              <div class="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 hover:border-indigo-500/40 transition">
                <div class="flex flex-wrap items-center gap-2 mb-1.5">
                  <code class="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {{ item.lineRef }}
                  </code>
                  <span class="text-sm font-semibold text-white">
                    {{ item.concept }}
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {{ item.explanation }}
                </p>
                @if (item.underTheHood) {
                  <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-amber-300/90">
                    <span class="font-semibold shrink-0">⚙️ Bajo el capó:</span>
                    <span>{{ item.underTheHood }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CodeExplainerComponent {
  readonly filename = input.required<string>();
  readonly code = input.required<string>();
  readonly description = input<string>('');
  readonly badge = input<string>('');
  readonly badgeType = input<'good' | 'bad' | 'info'>('info');
  readonly explanations = input<CodeLineExplanation[]>([]);

  readonly copied = signal(false);

  copyCode(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    }
  }
}
