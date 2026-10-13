import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { NORTH_STAR } from '../content';
import { scrubScene } from './scrub';

gsap.registerPlugin(DrawSVGPlugin);

/** Parallax travel (px) of each text group across the whole pin; a different depth per group. */
export const DRIFT = [48, 72, 56];
/** The title's own parallax (px up across the pin), slower than the text groups so it reads as further back. */
export const TITLE_DRIFT = 28;

/**
 * Chapter 1 opener and hero (Figma "Chapter introduction"), one pin. The title
 * opens centred between the opener's rules; scrolling retracts the rules and
 * lifts the title to the top-left, smaller, then four scenes play: the star, the library with "Common language", the design and
 * build browsers with "Faster delivery", then the arrows and connector with
 * "Better decisions". The three text groups drift slowly on a second scrub.
 */
@Component({
  selector: 'app-north-star',
  standalone: true,
  template: `
    <!-- Figma "Chapter introduction": eyebrow and title on the left, the act's line top right. -->
    <p class="ns-eyebrow">
      <span>{{ eyebrow() }}</span>
    </p>
    <p class="ns-lead">{{ lead() }}</p>
    <h1 class="ns-title" [style.view-transition-name]="named() ? 'section-title' : null">
      @for (line of titleLines(); track $index) {
        <span class="ns-title-line">{{ line }}</span>
      }
    </h1>
    <i class="ns-rule ns-rule-h ns-rule-top" aria-hidden="true"></i>
    <i class="ns-rule ns-rule-h ns-rule-bottom" aria-hidden="true"></i>
    <i class="ns-rule ns-rule-h ns-rule-low" aria-hidden="true"></i>
    <i class="ns-rule ns-rule-v ns-rule-left" aria-hidden="true"></i>
    <i class="ns-rule ns-rule-v ns-rule-right" aria-hidden="true"></i>

    <div class="ns-stage">
      <div class="ns-col ns-left">
        <div class="ns-point ns-point-0">
          <h3 class="h4">{{ points[0].title }}</h3>
          <p class="p">{{ points[0].body }}</p>
        </div>
        <div class="ns-point ns-point-2">
          <h3 class="h4">{{ points[2].title }}</h3>
          <p class="p">{{ points[2].body }}</p>
        </div>
      </div>

      <svg
        class="ns-art"
        viewBox="0 0 520 548"
        fill="none"
        role="img"
        aria-label="The North Star guides the Rippl library, which feeds design and build, joined in one direction."
      >
        <!-- Scene 1: the star -->
        <g class="ns-star">
          <circle class="ns-ring-solid" cx="260" cy="93.5" r="68" opacity="0.25" />
          <circle
            class="ns-ring-dash"
            cx="260"
            cy="93.5"
            r="93"
            opacity="0.4"
            stroke-dasharray="3 10"
          />
          <path class="ns-ticks" d="M260 22.5V37.5M260 149.5V164.5M189 93.5H204M316 93.5H331" />
          <path
            class="ns-beams"
            opacity="0.5"
            d="M215 138.5L90 335.5M305 138.5L430 335.5"
            stroke-dasharray="4 8"
          />
          <path class="ns-stem" d="M260 144.5V207.5" />
          <path
            class="ns-star-body"
            d="M260 39.5L270 82.5L300 93.5L270 104.5L260 147.5L250 104.5L220 93.5L250 82.5L260 39.5Z"
          />
          <path
            class="ns-star-glint"
            opacity="0.6"
            d="M230 63.5L252 84.5L260 93.5L245 84.5L230 63.5ZM290 123.5L268 102.5L260 93.5L275 102.5L290 123.5Z"
          />
        </g>
        <circle class="ns-dot" cx="55" cy="89.5" r="2" />
        <circle class="ns-dot" cx="450" cy="53.5" r="3" />
        <circle class="ns-dot" cx="415" cy="158.5" r="2" />
        <circle class="ns-dot" cx="95" cy="198.5" r="3" />

        <!-- Scene 2: the library -->
        <g class="ns-library">
          <text class="ns-lib-title" x="260" y="190" text-anchor="middle">{{ library.title }}</text>
          <rect class="ns-card" x="116" y="224.5" width="288" height="78" rx="10" />
          <rect class="ns-card" x="124" y="214.5" width="272" height="78" rx="10" />
          <rect class="ns-card" x="132" y="204.5" width="256" height="78" rx="10" />
          <g class="ns-card-chrome">
            <path d="M132 230.5H388" opacity="0.6" />
            <circle class="amber" cx="147" cy="217.5" r="3" />
            <circle class="amber" cx="157" cy="217.5" r="3" />
            <circle class="amber" cx="167" cy="217.5" r="3" />
          </g>
          @for (tab of library.tabs; track tab; let i = $index) {
            <rect class="ns-pill" [attr.x]="146 + i * 58" y="243.5" width="46" height="6" rx="3" />
            <text class="ns-tab" [attr.x]="169 + i * 58" y="270" text-anchor="middle">
              {{ tab }}
            </text>
          }
        </g>

        <!-- Scene 3: design and build -->
        <g class="ns-design">
          <text class="ns-label" x="40" y="345.5">DESIGN</text>
          <rect class="ns-frame" x="40" y="354.5" width="194" height="119" rx="8" />
          <path d="M40 379.5H234" />
          <circle cx="54" cy="367.5" r="3" />
          <circle cx="64" cy="367.5" r="3" />
          <circle cx="74" cy="367.5" r="3" />
          <rect class="ns-ui" x="55" y="392.5" width="51" height="66" rx="4" />
          <rect class="ns-ui" x="118" y="409.5" width="75" height="5" rx="2" />
          <rect class="ns-ui" x="118" y="422.5" width="90" height="5" rx="2" />
          <rect class="ns-ui blue" x="118" y="441.5" width="63" height="17" rx="4" />
        </g>
        <g class="ns-build">
          <text class="ns-label" x="480" y="345.5" text-anchor="end">BUILD</text>
          <rect class="ns-frame" x="286" y="354.5" width="194" height="119" rx="8" />
          <path d="M286 379.5H480" />
          <circle cx="300" cy="367.5" r="3" />
          <circle cx="310" cy="367.5" r="3" />
          <circle cx="320" cy="367.5" r="3" />
          <path
            class="ns-code"
            d="M325 398.5L314 406.5L325 414.5M361 398.5L372 406.5L361 414.5M349 396.5L338 416.5"
          />
          <rect class="ns-ui" x="305" y="431.5" width="104" height="5" rx="2" />
          <rect class="ns-ui" x="318" y="443.5" width="136" height="5" rx="2" />
          <rect class="ns-ui" x="318" y="455.5" width="87" height="5" rx="2" />
        </g>

        <!-- Scene 4: the arrows down and the connector below -->
        <path class="ns-arrow" d="M212 294.5C212 335.5 137 312.5 137 351.5" />
        <path class="ns-arrow" d="M308 294.5C308 335.5 383 312.5 383 351.5" />
        <path class="ns-arrowhead" d="M133 345.5L137 351.5L141 345.5" />
        <path class="ns-arrowhead" d="M379 345.5L383 351.5L387 345.5" />
        <g class="ns-connector">
          <path
            class="ns-connector-line"
            d="M137 474.5C137 511.5 224 510.5 260 510.5C296 510.5 383 511.5 383 474.5"
          />
          <circle class="ns-connector-dot amber" cx="260" cy="510.5" r="7" />
          <text class="ns-connector-text" x="260" y="541" text-anchor="middle">
            {{ oneDirection }}
          </text>
        </g>
      </svg>

      <div class="ns-col ns-right">
        <div class="ns-point ns-point-1">
          <h3 class="h4">{{ points[1].title }}</h3>
          <p class="p">{{ points[1].body }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /*
       * Everything here is laid out in CSS from two numbers, so no JS measuring:
       * --t is the title's Figma size, --intro (0..1, scrubbed by GSAP) moves it
       * from the centre of the opener to its small slot under the eyebrow.
       */
      :host {
        --grey: #7a99ac;
        --blue: var(--rippl-ref-color-cyan-500, #007dba);
        --intro: 0;
        --t: clamp(52px, 7.2vw, 104px);
        /* The title settles at this fraction of --t, so the illustration fits below it. */
        --t-end: 0.56;
        --top: clamp(24px, 5vh, 64px);
        /* The eyebrow leaves as the title arrives, so the title takes its line. */
        --slot: var(--top);
        --lift: 0;
        --lead-w: min(518px, 36vw);
        position: relative;
        display: block;
        height: calc(100vh - var(--bar));
        overflow: hidden;
        --t0: 0.4s;
        --draw: 0.7s cubic-bezier(0.6, 0, 0.6, 1);
      }

      .ns-eyebrow {
        position: absolute;
        top: var(--top);
        left: var(--pad);
        font: 700 12px / 1.4 var(--site-font-body);
        letter-spacing: 0.8px;
        text-transform: uppercase;
        overflow: hidden;
        animation: ns-rise var(--draw) calc(var(--t0) + 0.3s) backwards;
      }

      /* Masked, so it slides up out of its own line as the title comes in under it. */
      .ns-eyebrow span {
        display: block;
      }

      .ns-lead {
        position: absolute;
        top: calc(var(--top) - 7px);
        right: var(--pad);
        width: var(--lead-w);
        font: 300 clamp(16px, 1.4vw, 20px) / 1.5 var(--site-font-body);
        animation: ns-rise var(--draw) calc(var(--t0) + 0.36s) backwards;
      }

      /* Centred two-line block at --intro 0; its slot at the top-left, scaled to --t-end, at 1. */
      .ns-title {
        position: absolute;
        left: var(--pad);
        top: calc(
          (1 - var(--intro)) * (50% - 1.04 * var(--t)) + var(--intro) * var(--slot) - var(--lift) *
            1px
        );
        margin: 0;
        font-family: var(--site-font-display);
        font-weight: 700;
        font-size: var(--t);
        line-height: 1.04;
        letter-spacing: -0.048em;
        transform-origin: 0 0;
        scale: calc(1 - var(--intro) * (1 - var(--t-end)));
      }

      .ns-title-line {
        display: block;
        white-space: nowrap;
      }

      /* The opener's rules: drawn in on load (the scale property), retracted by scroll (--out on transform). */
      .ns-rule {
        --out: 0;
        position: absolute;
        background: currentColor;
        opacity: 0.35;
        pointer-events: none;
      }

      .ns-rule-h {
        left: 0;
        width: 100%;
        height: 1px;
        transform-origin: left;
        transform: scaleX(calc(1 - var(--out)));
        animation: ns-draw-x var(--draw) var(--t0) backwards;
      }

      .ns-rule-v {
        top: 0;
        width: 1px;
        height: 100%;
        transform-origin: top;
        transform: scaleY(calc(1 - var(--out)));
        animation: ns-draw-y var(--draw) calc(var(--t0) + 0.1s) backwards;
      }

      .ns-rule-top {
        top: calc(50% - 1.04 * var(--t) - 16px);
      }

      .ns-rule-bottom {
        top: calc(50% + 1.04 * var(--t) + 16px);
        animation-delay: calc(var(--t0) + 0.2s);
      }

      .ns-rule-low {
        top: 86%;
        animation-delay: calc(var(--t0) + 0.4s);
      }

      .ns-rule-left {
        left: calc(var(--pad) - 16px);
      }

      .ns-rule-right {
        right: calc(var(--pad) + var(--lead-w) + 24px);
        animation-delay: calc(var(--t0) + 0.3s);
      }

      @keyframes ns-draw-x {
        from {
          scale: 0 1;
        }
      }

      @keyframes ns-draw-y {
        from {
          scale: 1 0;
        }
      }

      @keyframes ns-rise {
        from {
          opacity: 0;
          scale: 0.9;
        }
      }

      /* The illustration fills what the settled title leaves. */
      .ns-stage {
        position: absolute;
        inset: calc(var(--slot) + 2.08 * var(--t-end) * var(--t) + clamp(32px, 6vh, 72px)) 0 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        gap: clamp(16px, 3vw, 48px);
        align-items: center;
        padding: 0 var(--pad) clamp(16px, 4vh, 40px);
      }

      .ns-art {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        font-family: var(--site-font-body);
        fill: var(--grey);
        stroke: var(--grey);
      }

      .ns-col {
        display: grid;
        min-width: 0;
      }

      .ns-left {
        align-content: space-between;
        height: 76%;
      }

      .ns-right {
        align-content: center;
        padding-top: 12%;
      }

      .ns-point {
        display: grid;
        gap: 10px;
        max-width: 34ch;
      }

      .ns-point .h4 {
        line-height: 1.1;
        letter-spacing: 0;
      }

      .ns-point .p {
        opacity: 0.85;
      }

      /* ── artwork palette: shapes are grey fills, paths are grey strokes, then the exceptions ── */
      .ns-art :is(circle, rect, text) {
        stroke: none;
      }

      .ns-art path {
        fill: none;
      }

      .ns-art :is(.ns-ring-solid, .ns-ring-dash) {
        fill: none;
        stroke: var(--grey);
      }

      .ns-art :is(.ns-ticks, .ns-stem) {
        stroke: var(--amber);
        stroke-width: 2;
      }

      .ns-art :is(.ns-star-body, .ns-star-glint, .amber) {
        fill: var(--amber);
        stroke: none;
      }

      .ns-art :is(.ns-card, .ns-frame) {
        fill: var(--navy);
        stroke: var(--grey);
        stroke-width: 1.5;
      }

      .ns-art :is(.ns-pill, .blue) {
        fill: var(--blue);
      }

      .ns-art .ns-arrow {
        stroke: var(--blue);
        stroke-width: 3;
      }

      .ns-art .ns-arrowhead {
        stroke: var(--blue);
        stroke-width: 2;
      }

      .ns-art .ns-code {
        stroke: var(--amber);
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .ns-art .ns-connector-line {
        stroke-width: 2;
      }

      .ns-art text {
        fill: var(--white);
      }

      .ns-lib-title {
        font: 700 24px var(--site-font-display);
      }

      .ns-tab {
        font-size: 10px;
      }

      .ns-label {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .ns-connector-text {
        font-size: 14px;
        font-weight: 700;
      }

      @media (max-width: 719px) {
        /* No room for the line beside the title: it sits under the eyebrow and gives way as the title rises. */
        .ns-lead {
          top: calc(var(--top) + 28px);
          left: var(--pad);
          width: auto;
          opacity: calc(1 - var(--intro));
        }

        .ns-rule-right {
          display: none;
        }

        .ns-stage {
          grid-template-columns: 1fr;
          grid-template-rows: auto minmax(0, 1fr) auto;
          gap: 12px;
        }

        .ns-left {
          grid-template-columns: 1fr 1fr;
          height: auto;
          gap: 16px;
        }

        .ns-right {
          padding-top: 0;
        }

        .ns-point .p {
          display: none;
        }
      }
    `,
  ],
})
export class NorthStar implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly eyebrow = input('');
  readonly title = input('');
  readonly lead = input('');
  /** Carries the tile → opener view-transition name; lifted while the menu grid is open. */
  readonly named = input(true);
  /** Figma breaks "The North Star" before its last word. */
  readonly titleLines = computed(() => {
    const t = this.title();
    const at = t.lastIndexOf(' ');
    return at > 0 ? [t.slice(0, at), t.slice(at + 1)] : [t];
  });

  readonly points = NORTH_STAR.points;
  readonly library = NORTH_STAR.library;
  readonly oneDirection = NORTH_STAR.oneDirection;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (scrub, reduce) => {
      const q = gsap.utils.selector(host);
      const point = (i: number) => q(`.ns-point-${i} > *`);
      const origin = { transformOrigin: '50% 50%' };
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 1 } });

      // Opener → illustration: the rules retract the way they drew in, the title rises and
      // shrinks into its slot, and the star starts while it is still settling.
      scrub
        .to(q('.ns-rule'), { '--out': 1, duration: 0.8, stagger: 0.08, ease: 'power2.in' }, 0)
        .to(
          q('.ns-eyebrow span'),
          { yPercent: -110, autoAlpha: 0, duration: 0.6, ease: 'power3.in' },
          0.3,
        )
        .to(host, { '--intro': 1, duration: 1.6, ease: 'power2.inOut' }, 0.2)
        .add(tl, 1.3);

      // Scene 1: the star turns into place; its rings, ticks and beams follow.
      tl.addLabel('star')
        .from(q('.ns-star-body'), {
          scale: 0,
          rotation: -90,
          ...origin,
          duration: 1.4,
          ease: 'back.out(1.6)',
        })
        .from(q('.ns-star-glint'), { autoAlpha: 0 }, '<0.6')
        .from(q('.ns-ticks'), { drawSVG: '0%' }, '<')
        .from(q('.ns-ring-solid'), { scale: 0.5, autoAlpha: 0, ...origin, duration: 1.2 }, '<')
        .from(
          q('.ns-ring-dash'),
          { scale: 0.5, rotation: -40, autoAlpha: 0, ...origin, duration: 1.4 },
          '<0.1',
        )
        .from(q('.ns-dot'), { scale: 0, autoAlpha: 0, ...origin, stagger: 0.12 }, '<0.2')
        .from(q('.ns-stem'), { drawSVG: '0%', duration: 0.8 }, '-=0.5')
        .from(
          q('.ns-beams'),
          { scaleY: 0, transformOrigin: '50% 0', duration: 1.2, ease: 'power1.inOut' },
          '<',
        );

      // Scene 2: the library stacks up under the star, with "Common language".
      tl.addLabel('library', '>-0.2')
        .from(q('.ns-card'), { y: 40, autoAlpha: 0, stagger: 0.15, duration: 0.9 })
        .from(q('.ns-card-chrome'), { autoAlpha: 0, duration: 0.5 }, '-=0.3')
        .from(
          q('.ns-pill'),
          { scaleX: 0, transformOrigin: 'left center', stagger: 0.1, duration: 0.5 },
          '<',
        )
        .from(q('.ns-tab'), { autoAlpha: 0, y: 6, stagger: 0.1, duration: 0.5 }, '<0.15')
        .from(q('.ns-lib-title'), { autoAlpha: 0, y: 12, duration: 0.7 }, '<')
        .from(point(0), { autoAlpha: 0, y: 28, stagger: 0.12, duration: 0.9 }, 'library+=0.3');

      // Scene 3: design and build browsers, with "Faster delivery".
      tl.addLabel('ports', '>-0.1')
        .from(q('.ns-design, .ns-build'), {
          y: 40,
          scale: 0.92,
          autoAlpha: 0,
          ...origin,
          stagger: 0.2,
        })
        .from(
          q('.ns-ui'),
          { scaleX: 0, transformOrigin: 'left center', stagger: 0.06, duration: 0.5 },
          '-=0.4',
        )
        .from(q('.ns-code'), { drawSVG: '0%', duration: 0.6 }, '<')
        .from(point(1), { autoAlpha: 0, y: 28, stagger: 0.12, duration: 0.9 }, 'ports+=0.3');

      // Scene 4: arrows draw down, the connector grows from its dot, "Better decisions".
      tl.addLabel('flow', '>-0.1')
        .from(q('.ns-arrow'), { drawSVG: '0%', duration: 0.9, ease: 'power1.inOut' })
        .from(q('.ns-arrowhead'), { drawSVG: '50% 50%', duration: 0.3 }, '-=0.1')
        .from(
          q('.ns-connector-dot'),
          { scale: 0, ...origin, duration: 0.6, ease: 'back.out(2)' },
          '<',
        )
        .from(q('.ns-connector-line'), { drawSVG: '50% 50%', ease: 'power1.inOut' }, '<0.1')
        .from(q('.ns-connector-text'), { autoAlpha: 0, y: 8, duration: 0.6 }, '-=0.3')
        .from(point(2), { autoAlpha: 0, y: 28, stagger: 0.12, duration: 0.9 }, '-=0.2')
        .to({}, { duration: 1 }); // hold on the finished picture before the pin lets go

      // Narrow screens stack the text right under the title, with no room to drift into.
      if (reduce || window.matchMedia('(max-width: 719px)').matches) return;
      // Slow parallax on the title and the text groups, each at its own depth, over the whole pin.
      const pin = {
        trigger: host.closest('[data-pin]') ?? host,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      };
      gsap.to(host, { '--lift': TITLE_DRIFT, ease: 'none', scrollTrigger: { ...pin } });
      gsap.fromTo(
        q('.ns-point'),
        { y: (i: number) => DRIFT[i] },
        {
          y: (i: number) => -DRIFT[i],
          ease: 'none',
          scrollTrigger: { ...pin },
        },
      );
    });
  }
}
