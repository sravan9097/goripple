import { afterNextRender, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';

interface Division {
  id: string;
  name: string;
  /** Top-left cell of the 2×2 box, 0-based. */
  col: number;
  row: number;
}

const COLS = 16;
const ROWS = 7;
/** Per-cell stagger and the wave's own length (the anime.js ripple grid this is after). */
const STEP_MS = 58;
const WAVE_MS = 1530;

/**
 * Act 1 interactive: a field of cells with the four divisions sitting in it as
 * 2×2 boxes. Click, and the wave radiates from exactly where you hit, cell by
 * cell, through the division boxes too. Everything runs the same keyframes,
 * delayed by its distance from the drop (`--d`), so the whole effect is CSS
 * and the click only writes distances.
 */
@Component({
  selector: 'app-drop-pool',
  standalone: true,
  template: `
    <div
      class="pool"
      role="img"
      aria-label="One drop spreading to Stolt Tankers, Stolt Tank Containers, Stolthaven Terminals and Stolt Sea Farm. Click or tap to drop again."
      (click)="onClick($event)"
      (keydown.enter)="drop()"
      (keydown.space)="drop(); $event.preventDefault()"
      tabindex="0"
    >
      <div #grid class="grid" [style.--cols]="cols">
        @for (d of divisions; track d.id) {
          <i
            class="cell box box-{{ d.id }}"
            [style.grid-area]="d.row + 1 + ' / ' + (d.col + 1) + ' / span 2 / span 2'"
            [attr.title]="d.name"
          ></i>
        }
        @for (i of cells; track i) {
          <i class="cell"></i>
        }
      </div>
      <span class="hint annotation">Click to drop</span>
    </div>
  `,
  styles: [
    `
      .pool {
        position: relative;
        width: 100%;
        cursor: crosshair;
        outline: none;
      }

      .pool:focus-visible {
        box-shadow: 0 0 0 2px var(--site-ink);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        gap: 6px;
      }

      .cell {
        --tile: color-mix(in oklch, var(--accent) 10%, var(--site-surface));
        display: block;
        aspect-ratio: 1;
        background: var(--tile);
        color: var(--accent);
        transform-origin: center;
      }

      /* The icon is a mask over currentColor, so it rides the same colour keyframes as its box. */
      .box {
        position: relative;
      }

      .box::before {
        content: '';
        position: absolute;
        inset: 8%;
        background: currentColor;
        mask: center / contain no-repeat;
      }

      .box-tankers::before {
        mask-image: url('/icons/tankers.png');
      }
      .box-terminals::before {
        mask-image: url('/icons/terminals.png');
      }
      .box-containers::before {
        mask-image: url('/icons/containers.png');
      }
      .box-seafarm::before {
        mask-image: url('/icons/seafarm.png');
      }

      .cell.rippling {
        animation: wave var(--wave) cubic-bezier(0.45, 0, 0.55, 1) calc(var(--d) * var(--step)) both;
      }

      /* Down to a dot of the section's colour as the wave arrives, then back to a tile. */
      @keyframes wave {
        0% {
          transform: scale(1);
          background: var(--tile);
          color: var(--accent);
          border-radius: 0;
        }
        25% {
          transform: scale(0.18);
          background: var(--accent);
          color: var(--site-surface);
          border-radius: 50%;
        }
        100% {
          transform: scale(1);
          background: var(--tile);
          color: var(--accent);
          border-radius: 0;
        }
      }

      .hint {
        position: absolute;
        left: 0;
        top: calc(100% + 10px);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--rippl-sys-color-on-surface-muted);
        opacity: 0.7;
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .cell.rippling {
          animation: none;
        }
      }
    `,
  ],
})
export class DropPool implements OnDestroy {
  readonly cols = COLS;

  /** Four divisions, four corners of the field. */
  readonly divisions: Division[] = [
    { id: 'tankers', name: 'Stolt Tankers', col: 2, row: 1 },
    { id: 'terminals', name: 'Stolthaven Terminals', col: 12, row: 1 },
    { id: 'containers', name: 'Stolt Tank Containers', col: 2, row: 4 },
    { id: 'seafarm', name: 'Stolt Sea Farm', col: 12, row: 4 },
  ];
  /** Plain cells fill whatever the 2×2 boxes leave of the COLS×ROWS field. */
  readonly cells = Array.from({ length: COLS * ROWS - this.divisions.length * 4 }, (_, i) => i);

  private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
  private arrival?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // One drop at the centre each time the field scrolls into view; after that it is the user's.
      this.arrival = new IntersectionObserver(([e]) => e.isIntersecting && this.drop(), { threshold: 0.5 });
      this.arrival.observe(this.grid().nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.arrival?.disconnect();
  }

  onClick(event: MouseEvent): void {
    this.drop(event.clientX, event.clientY);
  }

  /** Drop at a viewport point (default: the centre of the field). */
  drop(x?: number, y?: number): void {
    const grid = this.grid().nativeElement;
    const r = grid.getBoundingClientRect();
    const ox = x ?? r.left + r.width / 2;
    const oy = y ?? r.top + r.height / 2;
    const pitch = r.width / COLS;
    grid.style.setProperty('--step', `${STEP_MS}ms`);
    grid.style.setProperty('--wave', `${WAVE_MS}ms`);
    const cells = Array.from(grid.children) as HTMLElement[];
    for (const cell of cells) cell.classList.remove('rippling');
    // Reflow between remove and add, or a running wave is not restarted from the new drop.
    void grid.offsetWidth;
    for (const cell of cells) {
      const c = cell.getBoundingClientRect();
      const d = Math.hypot(c.left + c.width / 2 - ox, c.top + c.height / 2 - oy) / pitch;
      cell.style.setProperty('--d', d.toFixed(2));
      cell.classList.add('rippling');
    }
  }
}
