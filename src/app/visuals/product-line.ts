import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { DIVISIONS } from '../content';
import { scrubScene } from './scrub';

const N = DIVISIONS.length;

function nodeX(i: number): number {
  return ((i + 0.5) / N) * 1000;
}

/** Stolt businesses, joined one segment at a time. */
@Component({
  selector: 'app-product-line',
  standalone: true,
  template: `
    <div class="chain">
      <svg viewBox="0 0 1000 36" preserveAspectRatio="none" aria-hidden="true">
        @for (seg of segments; track $index) {
          <line [attr.x1]="seg.x1" y1="18" [attr.x2]="seg.x2" y2="18" />
        }
      </svg>
      <ol>
        @for (name of names; track name) {
          <li><i></i><span>{{ name }}</span></li>
        }
      </ol>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
      padding: 24px var(--pad);
    }

    .chain {
      width: min(1000px, 100%);
      display: grid;
    }

    svg,
    ol {
      grid-area: 1 / 1;
    }

    svg {
      width: 100%;
      height: 36px;
      align-self: start;
    }

    line {
      stroke: var(--navy);
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }

    ol {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      margin: 0;
      padding: 0;
    }

    li {
      display: grid;
      justify-items: center;
      gap: 14px;
      text-align: center;
    }

    i {
      width: 14px;
      height: 14px;
      margin-top: 11px;
      border-radius: 50%;
      background: var(--amber);
    }

    span {
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(13px, 1.5vw, 18px);
      letter-spacing: -0.02em;
      line-height: 1.2;
      max-width: 12ch;
    }

    @media (max-width: 719px) {
      ol {
        grid-template-columns: 1fr 1fr;
        gap: 20px 12px;
      }

      svg {
        display: none;
      }
    }
  `,
})
export class ProductLine implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly names = DIVISIONS.map((d) => d.name);
  readonly segments = DIVISIONS.slice(0, -1).map((_, i) => ({ x1: nodeX(i), x2: nodeX(i + 1) }));

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (tl) => {
      const lines = gsap.utils.toArray<SVGLineElement>('line', host);
      gsap.set(lines, {
        strokeDasharray: (_i, el) => (el as SVGLineElement).getTotalLength(),
        strokeDashoffset: (_i, el) => (el as SVGLineElement).getTotalLength(),
      });
      tl.to(lines, { strokeDashoffset: 0, duration: 0.5, stagger: 0.2, ease: 'none' }, 0);
    });
  }
}
