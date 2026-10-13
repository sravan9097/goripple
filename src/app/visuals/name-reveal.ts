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
      <h2 class="name-title">
        {{ name.title }} <span class="name-accent">{{ name.accent }}</span>
      </h2>
      <!-- Three beats along an amber rail: the decision, the E struck out, our word marked. -->
      <ol class="story">
        <i class="rail" aria-hidden="true"></i>
        <li>
          <span class="beat lead">{{ name.lead }}</span>
        </li>
        <li>
          <span class="beat"
            >“<b
              >{{ worldStem
              }}<span class="cut">{{ worldLast }}<i class="strike" aria-hidden="true"></i></span></b
            >” {{ name.world.line }}</span
          >
        </li>
        <li>
          <span class="beat"
            >“<mark class="hl">{{ name.ours.word }}</mark
            >” {{ name.ours.line }}</span
          >
        </li>
      </ol>
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
      top: 50%;
      width: 44%;
      translate: 0 -50%;
      display: grid;
      gap: clamp(20px, 4vh, 40px);
    }

    .name-title {
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(36px, 5.2vw, 80px);
      line-height: 1.04;
      letter-spacing: -0.048em;
    }

    .name-accent {
      display: inline-block;
      color: var(--amber);
    }

    .story {
      position: relative;
      display: grid;
      gap: 14px;
      padding-left: 24px;
      list-style: none;
      font: 400 clamp(15px, 1.25vw, 18px) / 1.45 var(--site-font-body);
    }

    .rail {
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--amber);
      transform-origin: 50% 0;
    }

    /* Each beat rises out of its own line. */
    .story li {
      overflow: hidden;
    }

    .beat {
      display: block;
    }

    .lead {
      color: color-mix(in oklch, var(--white) 70%, var(--navy));
    }

    .cut {
      position: relative;
      display: inline-block;
    }

    .strike {
      position: absolute;
      left: -10%;
      right: -10%;
      top: 55%;
      height: 2px;
      background: var(--amber);
      transform-origin: 0 50%;
    }

    /* A marker sweep: --hl grows the amber fill under our word. */
    .hl {
      --hl: 100%;
      padding: 0 0.2em;
      color: var(--navy);
      font-weight: 700;
      background: linear-gradient(var(--amber), var(--amber)) no-repeat 0 0 / var(--hl) 100%;
    }

    @media (max-width: 719px) {
      .copy {
        top: 46%;
        right: var(--pad);
        width: auto;
        translate: none;
      }
    }
  `,
})
export class NameReveal implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly letters = WORDMARK_LETTERS;
  readonly name = NORTH_STAR.name;
  readonly worldStem = this.name.world.word.slice(0, -1);
  readonly worldLast = this.name.world.word.slice(-1);

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
      const rise = { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' };
      const ink = (v: string) => getComputedStyle(host).getPropertyValue(v).trim();
      // ponytail: read once per build, so a resize across 719px keeps the old placement until reload.
      const narrow = matchMedia('(max-width: 719px)').matches;
      const aside = narrow ? { scale: 0.8, yPercent: -16 } : { scale: 0.6, xPercent: 24 };

      tl.to(state, { p: REVEAL_END, duration: 5, ease: 'none', onUpdate: () => paint(state.p) })
        // Reduce: the mark shrinks aside (right, or up on a phone) to leave the story its room.
        .to(svg, { ...aside, duration: 1.5, ease: 'power2.inOut' }, 5)
        .fromTo(title.words, { yPercent: 110, autoAlpha: 0 }, { ...rise, stagger: 0.08 }, 5.9)
        .from(
          q('.name-accent'),
          { rotation: -8, scale: 0.8, duration: 0.6, ease: 'back.out(2)' },
          '<0.25',
        )
        // The rail draws down; each beat rises out of its line as the rail reaches it.
        .from(q('.rail'), { scaleY: 0, duration: 2.2, ease: 'none' }, 6.6)
        .from(
          gsap.utils.toArray('.beat', host),
          { yPercent: 110, duration: 0.6, stagger: 0.8, ease: 'power3.out' },
          6.6,
        )
        // Beat two: the world's E is struck out, then dims.
        .from(q('.strike'), { scaleX: 0, duration: 0.4, ease: 'power2.inOut' }, 7.6)
        .to(q('.cut'), { opacity: 0.35, duration: 0.3 }, '>')
        // Beat three: the amber marker sweeps under our word.
        .fromTo(
          q('.hl'),
          { '--hl': '0%', color: ink('--white') },
          { '--hl': '100%', color: ink('--navy'), duration: 0.6, ease: 'power2.inOut' },
          8.4,
        )
        .to({}, { duration: 1.4 }); // hold before the pin lets go
      return () => title.revert();
    });
  }
}
