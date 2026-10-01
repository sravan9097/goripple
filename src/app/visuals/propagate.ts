import { Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-propagate',
  standalone: true,
  template: `
    <div class="propagate" role="img" aria-label="One change rippling across every product">
      <span class="seed" [class.pulse]="lit() === 0"></span>
      <span class="stem"></span>
      <div class="field">
        @for (row of rows; track row) {
          <div class="row">
            @for (n of cells; track n) {
              <span class="cell" [class.lit]="lit() > n"></span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .propagate {
        display: grid;
        grid-template-columns: auto 18px 1fr;
        align-items: center;
        gap: 0;
        width: 100%;
      }

      .seed {
        width: 30px;
        height: 30px;
        background: var(--site-dot);
      }

      .seed.pulse {
        animation: seedPulse 0.5s cubic-bezier(0.2, 0, 0.3, 1);
      }

      @keyframes seedPulse {
        50% {
          transform: scale(1.35);
        }
      }

      .stem {
        height: 2px;
        background: var(--site-line-strong);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
      }

      .cell {
        aspect-ratio: 1;
        box-shadow: inset 0 0 0 1px var(--site-line-strong);
        transition:
          background-color 0.5s var(--site-ease-nav),
          box-shadow 0.5s var(--site-ease-nav);
      }

      .row:nth-child(2) .cell {
        transition-delay: 90ms;
      }

      .row:nth-child(3) .cell {
        transition-delay: 180ms;
      }

      .cell.lit {
        background: var(--site-accent);
        box-shadow: inset 0 0 0 1px var(--site-accent);
      }

      @media (prefers-reduced-motion: reduce) {
        .cell,
        .seed {
          transition: none;
          animation: none;
        }
      }
    `,
  ],
})
export class Propagate implements OnInit, OnDestroy {
  readonly cells = [0, 1, 2, 3, 4, 5, 6];
  readonly rows = [0, 1, 2];
  readonly lit = signal(-1);
  private timer = 0;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.lit.set(7);
      return;
    }
    let step = -1;
    const tick = () => {
      step = step > 6 ? -1 : step + 1;
      this.lit.set(step);
      this.timer = window.setTimeout(tick, step < 0 ? 1100 : 260);
    };
    this.timer = window.setTimeout(tick, 500);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
