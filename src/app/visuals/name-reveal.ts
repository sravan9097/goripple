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
      <p class="name-lead">{{ name.lead }}</p>
      <!-- Ripple's E keeps falling away; Rippl's square keeps sending out a ripple (CSS loops). -->
      <div class="pair">
        <p class="side world">
          <span class="word"
            >{{ worldStem }}<span class="drop-e">{{ worldLast }}</span></span
          >
          <span class="line">{{ name.world.line }}</span>
        </p>
        <i class="pair-rule" aria-hidden="true"></i>
        <p class="side ours">
          <span class="word">{{ name.ours.word }}<span class="dot" aria-hidden="true"></span></span>
          <span class="line">{{ name.ours.line }}</span>
        </p>
      </div>
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
      --muted: color-mix(in oklch, var(--white) 55%, var(--navy));
      position: absolute;
      left: var(--pad);
      right: var(--pad);
      top: 44%;
      display: grid;
      gap: clamp(12px, 2vh, 20px);
      justify-items: center;
      text-align: center;
    }

    .name-title {
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(36px, 6vw, 88px);
      line-height: 1.04;
      letter-spacing: -0.048em;
    }

    .name-accent {
      display: inline-block;
      color: var(--amber);
    }

    .name-lead {
      font: 300 clamp(16px, 1.4vw, 20px) / 1.5 var(--site-font-body);
      color: var(--muted);
    }

    .pair {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: clamp(20px, 4vw, 56px);
      margin-top: clamp(8px, 2vh, 24px);
    }

    .side {
      display: grid;
      gap: 6px;
    }

    .world {
      justify-items: end;
      text-align: right;
      color: var(--muted);
    }

    .ours {
      justify-items: start;
      text-align: left;
    }

    .word {
      position: relative;
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(32px, 4.4vw, 64px);
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .line {
      font: 400 clamp(14px, 1.2vw, 17px) / 1.4 var(--site-font-body);
    }

    .pair-rule {
      align-self: stretch;
      width: 1px;
      background: var(--muted);
      opacity: 0.6;
    }

    /* The letter the world keeps: it loosens, falls, and comes back to be dropped again. */
    .drop-e {
      display: inline-block;
      transform-origin: 0 100%;
      animation: drop-e 3.6s cubic-bezier(0.5, 0, 0.75, 0) infinite;
    }

    @keyframes drop-e {
      0%,
      30% {
        transform: none;
        opacity: 1;
      }
      40% {
        transform: rotate(14deg);
        opacity: 1;
      }
      62% {
        transform: translateY(0.9em) rotate(40deg);
        opacity: 0;
      }
      85% {
        transform: translateY(-0.3em);
        opacity: 0;
      }
      100% {
        transform: none;
        opacity: 1;
      }
    }

    /* Rippl's square, where the E was, sending out a ripple on the same beat. */
    .dot {
      position: absolute;
      left: calc(100% + 0.06em);
      bottom: 0.02em;
      width: 0.18em;
      height: 0.18em;
      background: var(--amber);
    }

    .dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--amber);
      animation: ripple 3.6s cubic-bezier(0.16, 1, 0.3, 1) 1.4s infinite;
      opacity: 0;
    }

    @keyframes ripple {
      0% {
        transform: scale(1);
        opacity: 0.9;
      }
      60%,
      100% {
        transform: scale(5);
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .drop-e,
      .dot::after {
        animation: none;
      }
    }

    @media (max-width: 719px) {
      .pair {
        grid-template-columns: 1fr;
        justify-items: center;
      }

      .world,
      .ours {
        justify-items: center;
        text-align: center;
      }

      .pair-rule {
        display: none;
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
      const lead = SplitText.create(q('.name-lead'), { type: 'chars' });
      const rise = { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' };

      tl.to(state, { p: REVEAL_END, duration: 5, ease: 'none', onUpdate: () => paint(state.p) })
        // Reduce: the mark shrinks and rises to leave room for the story under it.
        .to(svg, { scale: 0.62, yPercent: -22, duration: 1.5, ease: 'power2.inOut' }, 5)
        .fromTo(title.words, { yPercent: 110, autoAlpha: 0 }, { ...rise, stagger: 0.08 }, 5.9)
        .from(
          q('.name-accent'),
          { rotation: -8, scale: 0.8, duration: 0.6, ease: 'back.out(2)' },
          '<0.25',
        )
        // The lead types itself out, a letter at a time.
        .from(lead.chars, { autoAlpha: 0, duration: 0.05, stagger: 0.02, ease: 'none' }, 6.7)
        // Then the pair: the world's word from the left, the rule draws, ours from the right.
        .from(q('.world'), { x: -48, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, '>0.1')
        .from(q('.pair-rule'), { scaleY: 0, duration: 0.5, ease: 'power2.inOut' }, '<0.3')
        .from(q('.ours'), { x: 48, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, '<0.2')
        .from(q('.dot'), { scale: 0, duration: 0.5, ease: 'back.out(3)' }, '<0.4')
        .to({}, { duration: 1.4 }); // hold before the pin lets go
      return () => {
        title.revert();
        lead.revert();
      };
    });
  }
}
