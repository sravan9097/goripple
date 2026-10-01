import { Component, signal } from '@angular/core';

interface Swatch {
  name: string;
  varName: string;
}

@Component({
  selector: 'app-swatches',
  standalone: true,
  template: `
    <div class="swatches">
      <div class="swatch-toolbar">
        <button
          type="button"
          class="theme-toggle"
          (click)="toggle()"
          [attr.aria-pressed]="dark()"
        >
          {{ dark() ? 'Dark' : 'Light' }} theme
        </button>
      </div>
      <div class="swatch-grid">
        @for (s of swatches; track s.varName) {
          <div class="swatch">
            <span class="chip" [style.background]="'var(' + s.varName + ')'"></span>
            <span class="label annotation">{{ s.name }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .swatches {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .theme-toggle {
        padding: 8px 14px;
        border: 1px solid var(--site-line);
        background: var(--site-surface);
        font-family: var(--site-font-display);
        font-weight: 700;
        font-size: 13px;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
        gap: 12px;
      }

      .swatch {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .chip {
        aspect-ratio: 1;
        border: 1px solid var(--site-line);
      }

      .label {
        color: var(--rippl-sys-color-on-surface-muted);
      }
    `,
  ],
})
export class Swatches {
  readonly dark = signal(false);

  readonly swatches: Swatch[] = [
    { name: 'Cyan', varName: '--rippl-ref-color-cyan-500' },
    { name: 'Navy', varName: '--rippl-ref-color-navy-blue-500' },
    { name: 'Magenta', varName: '--rippl-ref-color-magenta-500' },
    { name: 'Stolt Red', varName: '--rippl-ref-color-stolt-red-500' },
    { name: 'Green', varName: '--rippl-ref-color-light-green-500' },
    { name: 'Yellow', varName: '--rippl-ref-color-primrose-yellow-500' },
    { name: 'Orange', varName: '--rippl-ref-color-orange-500' },
    { name: 'Neutral', varName: '--rippl-ref-color-neutral-500' },
  ];

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }
}
