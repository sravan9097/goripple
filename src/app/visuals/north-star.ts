import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { NORTH_STAR } from '../content';
import { WORDMARK_LETTERS } from '../wordmark/wordmark';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Wordmark viewBox (public/brand/ripplLogo.svg). */
const W = 488;
const H = 250;
/** Scene viewBox (matches the template). The mark forms at SCALE, centred in the field. */
const VIEW = { w: 1000, h: 600 };
const SCALE = 1.45;
const OX = (VIEW.w - W * SCALE) / 2;
const OY = (VIEW.h - H * SCALE) / 2;
/** Sampling pitch in wordmark units; the letter stroke is 21, so three dots across. */
const STEP = 8;

/** Timeline positions (seconds of a 10s timeline, scrubbed across the pin). */
const BEAT_IN = [0.2, 3.1, 7.6];
const BEAT_OUT = [2.6, 5.4];
const BEAT_STAGGER = [0.035, 0.16, 0.05];
const GATHER = 5.2;

export interface Dot {
  x: number;
  y: number;
  /** Lands in the tip square (the drop), drawn in amber like the other scenes. */
  tip: boolean;
}

/** One point per STEP x STEP cell of the wordmark that falls inside a letter or the tip square. */
export function sampleWordmark(step = STEP): Dot[] {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const letters = new Path2D();
  for (const d of WORDMARK_LETTERS) letters.addPath(new Path2D(d));
  const tip = new Path2D();
  tip.rect(467, 169, 21, 21);
  const dots: Dot[] = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (ctx.isPointInPath(letters, x, y)) dots.push({ x, y, tip: false });
      else if (ctx.isPointInPath(tip, x, y)) dots.push({ x, y, tip: true });
    }
  }
  return dots;
}

/**
 * Act 2 scene. Every dot is one part of one product, floating alone where it
 * was built; a dozen carry their names. Three beats of copy rise word by word
 * (why, the cost, the vision), then every part travels to its place in the
 * Rippl mark. One GSAP timeline, scrubbed by the pinned scroll.
 */
@Component({
  selector: 'app-north-star',
  standalone: true,
  template: `
    <svg
      class="field"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Scattered parts of many products drift on their own, then gather into the Rippl wordmark."
    >
      @for (d of dots; track $index) {
        <circle class="dot" [class.tip]="d.tip" [attr.cx]="d.sx" [attr.cy]="d.sy" [attr.r]="d.label ? 5.5 : 3.4" />
      }
      @for (d of labelled; track d.label) {
        <text class="label" [attr.x]="d.lx" [attr.y]="d.sy - 10" [attr.text-anchor]="d.anchor">{{ d.label }}</text>
      }
    </svg>
    <div class="beats">
      @for (b of beats; track b) {
        <p class="beat">{{ b }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        /* The field and the lines are separate rows, so type never crosses a dot. */
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        height: calc(100vh - var(--bar, 56px));
        overflow: hidden;
      }

      .field {
        --amp: 1;
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
      }

      /* GSAP wanders --fx/--fy per dot; --amp on the svg scales the wander down as the mark forms. */
      .dot {
        fill: var(--white);
        opacity: 0.9;
        transform: translate(calc(var(--fx, 0) * var(--amp) * 1px), calc(var(--fy, 0) * var(--amp) * 1px));
      }

      .dot.tip {
        fill: var(--amber);
      }

      .label {
        fill: var(--white);
        opacity: 0.7;
        font: 500 11px var(--site-font-body);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .beats {
        position: relative;
        height: calc(4 * 1.15em);
        margin: 8px var(--pad) clamp(24px, 5vh, 48px);
        font-family: var(--site-font-display);
        font-weight: 700;
        font-size: clamp(20px, 2.1vw, 30px);
        line-height: 1.15;
        letter-spacing: -0.03em;
        pointer-events: none;
      }

      .beat {
        position: absolute;
        inset: 0 auto auto 0;
        max-width: 36ch;
      }
    `,
  ],
})
export class NorthStar implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private ctx?: gsap.Context;

  readonly beats = NORTH_STAR.beats;

  /** Every target dot with the place it floats before it gathers; a dozen, spread evenly, are named parts. */
  readonly dots = sampleWordmark().map((d, i, all) => {
    const every = Math.floor(all.length / NORTH_STAR.parts.length);
    const sx = gsap.utils.random(70, VIEW.w - 70);
    const right = sx > VIEW.w - 180;
    return {
      ...d,
      sx,
      sy: gsap.utils.random(48, VIEW.h - 48),
      lx: right ? sx - 14 : sx + 14,
      anchor: right ? 'end' : 'start',
      label: i % every === 0 ? NORTH_STAR.parts[i / every] : undefined,
    };
  });
  readonly labelled = this.dots.filter((d) => d.label);

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    const scene = host.closest<HTMLElement>('[data-pin]') ?? host;
    this.ctx = gsap.context(() => {
      const svg = host.querySelector('svg')!;
      const circles = gsap.utils.toArray<SVGCircleElement>('.dot', host);
      const paragraphs = gsap.utils.toArray<HTMLElement>('.beat', host);

      // ponytail: ~550 circles each tweening two CSS variables every frame. Fine on
      // laptops; if it stutters on low-end devices, move the dots to a canvas as in
      // the three.js reference and keep only the timeline.
      const float = gsap.to(circles, {
        '--fx': 'random(-18, 18)',
        '--fy': 'random(-14, 14)',
        duration: () => gsap.utils.random(2.5, 4.5),
        repeat: -1,
        repeatRefresh: true,
        ease: 'sine.inOut',
      });

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      paragraphs.forEach((p, i) => {
        const { words } = SplitText.create(p, { type: 'words', mask: 'words' });
        tl.fromTo(
          words,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5, stagger: BEAT_STAGGER[i] },
          BEAT_IN[i],
        );
        if (i < BEAT_OUT.length) tl.to(p, { autoAlpha: 0, y: -24, duration: 0.5 }, BEAT_OUT[i]);
      });
      tl.to(svg, { '--amp': 0.12, duration: 2.8, ease: 'none' }, GATHER);
      tl.to('.label', { autoAlpha: 0, duration: 0.5 }, GATHER);
      circles.forEach((c, i) => {
        const { x, y } = this.dots[i];
        tl.to(
          c,
          { attr: { cx: OX + x * SCALE, cy: OY + y * SCALE }, duration: 1.6, ease: 'power3.inOut' },
          GATHER + Math.random() * 1.4,
        );
      });
      tl.to({}, { duration: 1.6 }); // hold on the formed mark before the pin lets go

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        float.kill();
        tl.progress(1);
        return;
      }
      ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        animation: tl,
      });
      // The parts only need to wander while the scene is on screen.
      ScrollTrigger.create({
        trigger: scene,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => float.paused(!self.isActive),
      });
    }, host);
  }
}
