import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface Ring {
  id: number;
  x: number;
  y: number;
}

interface Shore {
  label: string;
  x: number;
  y: number;
}

/**
 * Act 1 interactive: a still pool. Drop once, rings travel to every shore.
 * Click or tap to place the drop (Dropbox-style playground, not decoration).
 */
@Component({
  selector: 'app-drop-pool',
  standalone: true,
  template: `
    <div
      class="pool"
      role="img"
      [attr.aria-label]="
        'One drop spreading to every product. Click or tap to drop again.'
      "
      (click)="onClick($event)"
      (keydown.enter)="drop(50, 50)"
      (keydown.space)="drop(50, 50); $event.preventDefault()"
      tabindex="0"
    >
      @for (shore of shores; track shore.label) {
        <span
          class="shore annotation"
          [class.lit]="lit()"
          [style.left.%]="shore.x"
          [style.top.%]="shore.y"
        >
          {{ shore.label }}
        </span>
      }

      @for (ring of rings(); track ring.id) {
        <span
          class="ring"
          [style.left.%]="ring.x"
          [style.top.%]="ring.y"
          (animationend)="onRingEnd(ring.id)"
        ></span>
      }

      @if (dropAt(); as d) {
        <span class="drop" [style.left.%]="d.x" [style.top.%]="d.y"></span>
      }

      <span class="hint annotation">Click to drop</span>
    </div>
  `,
  styles: [
    `
      .pool {
        position: relative;
        aspect-ratio: 1;
        width: 100%;
        max-width: 360px;
        margin-inline: auto;
        overflow: hidden;
        cursor: crosshair;
        background: color-mix(in oklch, var(--rippl-ref-color-cyan-500) 8%, var(--site-surface));
        outline: none;
      }

      .pool:focus-visible {
        box-shadow: inset 0 0 0 2px var(--site-ink);
      }

      .drop {
        position: absolute;
        width: 14px;
        height: 14px;
        margin: -7px 0 0 -7px;
        background: var(--site-dot);
        z-index: 3;
        pointer-events: none;
        animation: dropPulse 0.55s cubic-bezier(0.2, 0, 0.3, 1);
      }

      @keyframes dropPulse {
        0% {
          transform: scale(0.4);
        }
        40% {
          transform: scale(1.25);
        }
        100% {
          transform: scale(1);
        }
      }

      .ring {
        position: absolute;
        width: 14px;
        height: 14px;
        margin: -7px 0 0 -7px;
        border-radius: 0;
        box-shadow: inset 0 0 0 1.5px var(--site-dot);
        pointer-events: none;
        z-index: 1;
        animation: ringOut 2.4s cubic-bezier(0.2, 0, 0.3, 1) forwards;
      }

      @keyframes ringOut {
        0% {
          width: 14px;
          height: 14px;
          margin: -7px 0 0 -7px;
          opacity: 0.9;
        }
        70% {
          opacity: 0.25;
        }
        100% {
          width: 140%;
          height: 140%;
          margin: -70% 0 0 -70%;
          opacity: 0;
        }
      }

      .shore {
        position: absolute;
        z-index: 2;
        transform: translate(-50%, -50%);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--rippl-sys-color-on-surface-muted);
        transition:
          color 0.45s var(--site-ease-nav),
          opacity 0.45s var(--site-ease-nav);
        opacity: 0.55;
        pointer-events: none;
        white-space: nowrap;
      }

      .shore.lit {
        color: var(--site-ink);
        opacity: 1;
      }

      .hint {
        position: absolute;
        left: 12px;
        bottom: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--rippl-sys-color-on-surface-muted);
        opacity: 0.7;
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .drop,
        .ring {
          animation: none;
        }

        .ring {
          width: 70%;
          height: 70%;
          margin: -35% 0 0 -35%;
          opacity: 0.35;
        }
      }
    `,
  ],
})
export class DropPool implements OnInit, OnDestroy {
  readonly shores: Shore[] = [
    { label: 'Tankers', x: 18, y: 14 },
    { label: 'Terminals', x: 82, y: 16 },
    { label: 'Containers', x: 14, y: 82 },
    { label: 'Sea Farm', x: 50, y: 88 },
    { label: 'Ventures', x: 86, y: 78 },
  ];

  readonly rings = signal<Ring[]>([]);
  readonly dropAt = signal<{ x: number; y: number } | null>(null);
  readonly lit = signal(false);

  private nextId = 0;
  private autoTimer = 0;
  private litTimer = 0;
  private reduced = false;

  ngOnInit(): void {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduced) {
      this.dropAt.set({ x: 50, y: 50 });
      this.lit.set(true);
      this.rings.set([{ id: 0, x: 50, y: 50 }]);
      return;
    }
    this.drop(50, 50);
    this.autoTimer = window.setInterval(() => {
      if (this.rings().length === 0) this.drop(50, 50);
    }, 5200);
  }

  ngOnDestroy(): void {
    clearInterval(this.autoTimer);
    clearTimeout(this.litTimer);
  }

  onClick(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.drop(x, y);
  }

  drop(x: number, y: number): void {
    this.dropAt.set({ x, y });
    this.lit.set(false);
    clearTimeout(this.litTimer);

    const burst: Ring[] = [0, 1, 2].map((i) => ({
      id: ++this.nextId,
      x,
      y,
    }));
    // Stagger by delaying later rings via separate push timing
    this.rings.set([burst[0]]);
    if (this.reduced) {
      this.lit.set(true);
      return;
    }
    window.setTimeout(() => this.rings.update((r) => [...r, burst[1]]), 280);
    window.setTimeout(() => this.rings.update((r) => [...r, burst[2]]), 560);
    this.litTimer = window.setTimeout(() => this.lit.set(true), 900);
  }

  onRingEnd(id: number): void {
    this.rings.update((list) => list.filter((r) => r.id !== id));
  }
}
