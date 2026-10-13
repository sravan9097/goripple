import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { NORTH_STAR } from '../content';
import { openingFrame, openingLayout, OPENING, type OpeningLayout } from '../hero-grid/opening';
import { WORDMARK_LETTERS } from '../wordmark/wordmark';
import { scrubScene } from './scrub';

gsap.registerPlugin(SplitText);

/** The opening is driven to the end of its move beat: the mark landed, eased to centre, the echo gone. */
export const REVEAL_END = OPENING.move[1];

/**
 * Chapter 1, "What's in the Name?". The landing's reveal, replayed from the
 * scroll (hero-grid/opening.ts): the ripple uncovers "Ripple", the E falls
 * away and the drop squares into its slot. Then the mark shrinks upward and
 * the title and its line rise beneath it.
 */
@Component({
  selector: 'app-name-reveal',
  standalone: true,
  template: `
    <svg class="mark" aria-hidden="true">
      <defs>
        <mask id="nr-reveal" class="o-maskdef" maskUnits="userSpaceOnUse" x="0" y="0">
          <circle class="o-mask" fill="#fff" r="0" />
        </mask>
      </defs>
      <circle class="o-ring" r="0" />
      <circle class="o-ring" r="0" />
      <circle class="o-ring" r="0" />
      <g mask="url(#nr-reveal)">
        <g class="o-mark">
          @for (d of letters; track $index) {
            <path class="o-letter" [attr.d]="d" />
          }
          <!-- The ghost E: same stroke and bowl as the p, so the word reads Ripple. -->
          <g class="o-e">
            <path d="M592.5 122A57.5 57.5 0 1 0 575.66 162.66" />
            <path d="M477.5 122H603" />
          </g>
        </g>
      </g>
      <circle class="o-echo" r="0" />
      <g class="o-drop"><rect class="o-drop-shape" /></g>
    </svg>
    <div class="copy">
      <h2 class="name-title">{{ name.title }}</h2>
      <p class="name-body">{{ name.body }}</p>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      height: calc(100vh - var(--bar));
      overflow: hidden;
      color: var(--white);
    }

    .mark {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .o-letter {
      fill: var(--white);
    }

    .o-e path {
      fill: none;
      stroke: var(--white);
      stroke-width: 21;
    }

    .o-drop-shape {
      fill: var(--amber);
    }

    .o-ring,
    .o-echo {
      fill: none;
      stroke: var(--white);
      stroke-width: 1;
      opacity: 0;
      vector-effect: non-scaling-stroke;
    }

    .o-echo {
      stroke: var(--amber);
    }

    .copy {
      position: absolute;
      left: var(--pad);
      right: var(--pad);
      top: 60%;
      display: grid;
      gap: 16px;
      justify-items: center;
      text-align: center;
    }

    .name-title {
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(36px, 7vw, 104px);
      line-height: 1.04;
      letter-spacing: -0.04em;
    }

    .name-body {
      max-width: 60ch;
      font-weight: 700;
      font-size: clamp(16px, 1.7vw, 24px);
      line-height: 1.4;
    }
  `,
})
export class NameReveal implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly letters = WORDMARK_LETTERS;
  readonly name = NORTH_STAR.name;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    const q = <T extends Element>(s: string) => host.querySelector(s) as T;
    const svg = q<SVGSVGElement>('.mark');
    const maskDef = q<SVGMaskElement>('.o-maskdef');
    const mask = q<SVGCircleElement>('.o-mask');
    const rings = Array.from(host.querySelectorAll<SVGCircleElement>('.o-ring'));
    const mark = q<SVGGElement>('.o-mark');
    const e = q<SVGGElement>('.o-e');
    const echo = q<SVGCircleElement>('.o-echo');
    const drop = q<SVGGElement>('.o-drop');
    const dropShape = q<SVGRectElement>('.o-drop-shape');

    let L: OpeningLayout | undefined;
    const layout = (): OpeningLayout => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (L && L.w === w && L.h === h) return L;
      L = openingLayout(w, h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      maskDef.setAttribute('width', String(w));
      maskDef.setAttribute('height', String(h));
      const [ix, iy] = openingFrame(0, L).impact;
      for (const c of [mask, ...rings]) {
        c.setAttribute('cx', String(ix));
        c.setAttribute('cy', String(iy));
      }
      return L;
    };

    /** hero-grid.ts paintOpening, without the hand-off to the centre box. */
    const paint = (p: number): void => {
      const f = openingFrame(p, layout());
      mark.setAttribute('transform', `translate(${f.mark.x} ${f.mark.y}) scale(${f.mark.s})`);
      mask.setAttribute('r', String(f.mask));
      f.rings.forEach((ring, k) => {
        rings[k].setAttribute('r', String(ring.r));
        rings[k].style.opacity = String(ring.o);
      });
      e.setAttribute('transform', `translate(0 ${f.e.dy}) rotate(${f.e.rot} 467 190)`);
      e.style.opacity = String(f.e.o);
      const d = f.drop;
      drop.setAttribute('transform', `translate(${d.x} ${d.y}) scale(${d.sx} ${d.sy})`);
      dropShape.setAttribute('x', String(-d.half));
      dropShape.setAttribute('y', String(-d.half));
      dropShape.setAttribute('width', String(2 * d.half));
      dropShape.setAttribute('height', String(2 * d.half));
      dropShape.setAttribute('rx', String(d.radius));
      echo.setAttribute('cx', String(d.x));
      echo.setAttribute('cy', String(d.y));
      echo.setAttribute('r', String(f.echo.r));
      echo.style.opacity = String(f.echo.o);
    };

    this.mm = scrubScene(host, (tl) => {
      const state = { p: 0 };
      paint(0);
      const title = SplitText.create(q('.name-title'), { type: 'words', mask: 'words' });
      const body = SplitText.create(q('.name-body'), { type: 'lines', mask: 'lines' });

      tl.to(state, { p: REVEAL_END, duration: 5, ease: 'none', onUpdate: () => paint(state.p) })
        // Reduce: the mark shrinks and rises to leave room for the title.
        .to(svg, { scale: 0.8, yPercent: -16, duration: 1.5, ease: 'power2.inOut' }, 5)
        .fromTo(
          title.words,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
          5.9,
        )
        .fromTo(
          body.lines,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' },
          6.6,
        )
        .to({}, { duration: 1.2 }); // hold before the pin lets go
      return () => {
        title.revert();
        body.revert();
      };
    });
  }
}
