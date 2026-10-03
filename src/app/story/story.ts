import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORY } from '../content';
import { RevealOnScroll } from '../reveal.directive';
import { Wordmark, WORDMARK_LETTERS } from '../wordmark/wordmark';
import {
  closingZoom,
  openingFrame,
  openingLayout,
  progressToScroll,
  sceneProgress,
  travellerAt,
  type Box,
  type OpeningLayout,
  type Station,
} from './scenes';

/** Scroll unlocks just after the drop lands; the rings play on under the visitor's scroll. */
const INTRO_LOCK_MS = 1700;
/** Share of the remaining distance covered per frame: Lenis-like inertia without Lenis. */
const SMOOTHING = 0.12;
const CLOSING_LINES_AT = 0.44;

interface SceneRef {
  el: HTMLElement;
  pinned: boolean;
  rest: number;
  top: number;
  height: number;
  p: number;
}

interface AnchorRef {
  target: Element;
  round: boolean;
  station: Station;
}

const DOT_PALETTE = [
  'var(--amber)',
  'var(--rippl-ref-color-cyan-400)',
  'var(--rippl-ref-color-light-green-400)',
  'var(--rippl-ref-color-magenta-400)',
  'var(--rippl-ref-color-white)',
];

/**
 * The landing story: ten scenes on one scroll. A single rAF loop turns the
 * smoothed scroll position into per-scene progress (`--p`), paints the opening
 * SVG and closing zoom, and carries the amber traveller between anchors.
 */
@Component({
  selector: 'app-story',
  imports: [NgTemplateOutlet, RouterLink, RevealOnScroll, Wordmark],
  templateUrl: './story.html',
  styleUrl: './story.scss',
  host: { '[class.is-reduced]': 'reduced()' },
})
export class Story implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);

  readonly copy = STORY;
  readonly letters = WORDMARK_LETTERS;
  readonly reduced = signal(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /** Drift per island: which way it floats off, and what its button has quietly become by the end. */
  readonly drift: Record<string, string> = {
    seafarm: '--sx: -1; --sy: -1; --rot: -1.2; --bg2: var(--rippl-ref-color-cyan-600); --r2: 99px',
    containers:
      '--sx: 1; --sy: -1; --rot: 0.8; --bg2: var(--rippl-ref-color-light-green-700); --r2: 0px; --px2: 10px; --ls2: 0.08em',
    tankers: '--sx: -1; --sy: 1; --rot: 0.6; --bg2: transparent; --bd2: var(--navy); --fg2: var(--navy); --r2: 99px; --px2: 12px',
    terminals: '--sx: 1; --sy: 1; --rot: -0.9; --bg2: var(--rippl-ref-color-magenta-700); --r2: 12px',
  };

  /** 7 x 7 field; `d` is distance from the centre, so colour spreads like a ring. */
  readonly dots = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7) - 3;
    const c = (i % 7) - 3;
    return {
      d: (Math.hypot(r, c) / Math.hypot(3, 3)).toFixed(3),
      c: DOT_PALETTE[(i * 3) % DOT_PALETTE.length],
      centre: i === 24,
    };
  });

  readonly panels = STORY.how.ideas.map((idea, i) => ({
    ...idea,
    colour: ['var(--amber)', 'var(--rippl-ref-color-cyan-600)', 'var(--rippl-ref-color-light-green-600)'][i],
    hi: [12, 12, 24][i],
    big: i > 0,
  }));
  readonly panelDots = Array.from({ length: 25 }, (_, n) => ({ n, row: Math.floor(n / 5) }));

  private scenes: SceneRef[] = [];
  private anchors: AnchorRef[] = [];
  private layout!: OpeningLayout;
  private vh = 0;
  private y = 0;
  private raf = 0;
  private lockTimer = 0;
  private z0 = 1;
  private zoomFrom = { x: 0, y: 0 };
  private resizeObserver?: ResizeObserver;
  private el!: {
    traveller: HTMLElement;
    openPin: HTMLElement;
    openInner: HTMLElement;
    svg: SVGSVGElement;
    maskDef: SVGMaskElement;
    at: SVGGElement[];
    mask: SVGCircleElement;
    rings: SVGCircleElement[];
    mark: SVGGElement;
    e: SVGGElement;
    echo: SVGCircleElement;
    drop: SVGGElement;
    dropShape: SVGRectElement;
    tag: HTMLElement;
    closeMark: HTMLElement;
    closeInner: HTMLElement;
  };

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.boot()));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.lockTimer);
    window.removeEventListener('scroll', this.wake);
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver?.disconnect();
    document.body.classList.remove('lock-scroll');
  }

  /** GoRippl / DoRippl: the colour swap spreads from wherever the pointer came in. */
  aim(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - r.left}px`);
    card.style.setProperty('--y', `${event.clientY - r.top}px`);
  }

  private boot(): void {
    const q = <T extends Element>(s: string) => this.host.querySelector(s) as T;
    const qa = <T extends Element>(s: string) => Array.from(this.host.querySelectorAll(s)) as T[];
    this.el = {
      traveller: q('.traveller'),
      openPin: q('.open-pin'),
      openInner: q('.open-inner'),
      svg: q('.open-svg'),
      maskDef: q('.o-maskdef'),
      at: qa('.o-at'),
      mask: q('.o-mask'),
      rings: qa('.o-ring'),
      mark: q('.o-mark'),
      e: q('.o-e'),
      echo: q('.o-echo'),
      drop: q('.o-drop'),
      dropShape: q('.o-drop-shape'),
      tag: q('.o-tag'),
      closeMark: q('.close-mark'),
      closeInner: q('.close-inner'),
    };
    this.scenes = qa<HTMLElement>('[data-scene]').map((el) => ({
      el,
      pinned: el.hasAttribute('data-pin'),
      rest: Number(el.dataset['rest'] ?? 1),
      top: 0,
      height: 0,
      p: 0,
    }));

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!this.reduced()) {
      window.scrollTo(0, 0);
      document.body.classList.add('lock-scroll');
      this.lockTimer = window.setTimeout(
        () => document.body.classList.remove('lock-scroll'),
        INTRO_LOCK_MS,
      );
    }

    this.measure();
    this.y = window.scrollY;
    window.addEventListener('scroll', this.wake, { passive: true });
    window.addEventListener('resize', this.onResize);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.host);
    void document.fonts?.ready.then(this.onResize);
    this.render();
  }

  private readonly onResize = (): void => {
    this.measure();
    this.render();
  };

  private readonly wake = (): void => {
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  };

  private readonly tick = (): void => {
    this.raf = 0;
    const target = window.scrollY;
    this.y = this.reduced() ? target : this.y + (target - this.y) * SMOOTHING;
    if (Math.abs(target - this.y) < 0.5) this.y = target;
    this.render();
    if (this.y !== target) this.wake();
  };

  /** All layout reads that do not change with scroll. */
  private measure(): void {
    const { el } = this;
    const w = el.openPin.clientWidth;
    const h = el.openPin.clientHeight;
    this.vh = h;

    for (const s of this.scenes) {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + window.scrollY;
      s.height = r.height;
    }

    const L = openingLayout(w, h, el.tag.offsetWidth, el.tag.offsetHeight);
    this.layout = L;
    el.tag.style.setProperty('--tx', `${L.tag.x}px`);
    el.tag.style.setProperty('--ty', `${L.tag.y}px`);
    el.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    el.maskDef.setAttribute('width', String(w));
    el.maskDef.setAttribute('height', String(h));

    const [ix, iy] = openingFrame(0, L).impact;
    const min = Math.min(w, h);
    for (const g of el.at) g.setAttribute('transform', `translate(${ix} ${iy})`);
    el.mask.setAttribute('cx', String(ix));
    el.mask.setAttribute('cy', String(iy));
    for (const ring of el.rings) {
      ring.setAttribute('cx', String(ix));
      ring.setAttribute('cy', String(iy));
    }
    this.host.querySelector('.o-glimmer')?.setAttribute('r', String(0.2 * min));
    this.host.querySelector('.o-idle')?.setAttribute('r', String(0.3 * min));
    this.host.querySelectorAll('.o-burst').forEach((c) => c.setAttribute('r', String(0.45 * L.diag)));
    const rest = 18 * L.start.s;
    this.host.querySelectorAll<SVGCircleElement>('.o-ghost').forEach((c) => {
      c.setAttribute('r', String(rest * Number(c.style.getPropertyValue('--g') || 0.5)));
    });

    // Stations: scroll positions at which the traveller rests on each anchor.
    this.anchors = Array.from(this.host.querySelectorAll<HTMLElement | SVGElement>('.anchor[data-hold]'))
      .map((a) => {
        const scene = this.scenes.find((s) => s.el.contains(a))!;
        const [from, to] = (a.dataset['hold'] ?? '0,0').split(',').map(Number);
        return {
          target: a.querySelector('.wordmark-dot') ?? a,
          round: a.hasAttribute('data-round'),
          station: {
            from: progressToScroll(from, scene.top, scene.height, h, scene.pinned),
            to: progressToScroll(to, scene.top, scene.height, h, scene.pinned),
          },
        };
      })
      .sort((a, b) => a.station.from - b.station.from);

    // Closing: zoom from a square filling most of the screen, centred, back to the mark.
    const mark = el.closeMark;
    const side = (mark.offsetWidth * 21) / 488;
    this.z0 = side > 0 ? (0.62 * min) / side : 1;
    const dotX = mark.offsetLeft + mark.offsetWidth * (477.5 / 488);
    const dotY = mark.offsetTop + mark.offsetHeight * (179.5 / 250);
    this.zoomFrom = { x: w / 2 - dotX, y: h / 2 - dotY };
  }

  private anchorBox(i: number): Box {
    const a = this.anchors[i];
    const r = a.target.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, r: a.round ? r.width / 2 : 0 };
  }

  private render(): void {
    const reduced = this.reduced();
    const y = this.y;
    for (const s of this.scenes) {
      s.p = reduced ? s.rest : sceneProgress(y, s.top, s.height, this.vh, s.pinned);
    }

    // Reads first (at most two rects), then writes, so each frame lays out once.
    const box = reduced
      ? null
      : travellerAt(y, this.anchors.map((a) => a.station), (i) => this.anchorBox(i));

    for (const s of this.scenes) s.el.style.setProperty('--p', s.p.toFixed(4));
    this.paintOpening(this.scenes[0].p);
    this.paintClosing(this.scenes[this.scenes.length - 1].p);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.host.style.setProperty('--story', (max > 0 ? y / max : 0).toFixed(4));

    this.host.classList.toggle('travelling', !!box);
    if (box) {
      const t = this.el.traveller.style;
      t.transform = `translate3d(${box.x}px, ${box.y}px, 0)`;
      t.width = `${box.w}px`;
      t.height = `${box.h}px`;
      t.borderRadius = `${box.r}px`;
    }
  }

  private paintOpening(p: number): void {
    const { el } = this;
    const f = openingFrame(p, this.layout);
    el.mark.setAttribute('transform', `translate(${f.mark.x} ${f.mark.y}) scale(${f.mark.s})`);
    el.mask.setAttribute('r', String(f.mask));
    f.rings.forEach((ring, k) => {
      el.rings[k].setAttribute('r', String(ring.r));
      el.rings[k].style.opacity = String(ring.o);
    });
    el.e.setAttribute('transform', `translate(0 ${f.e.dy}) rotate(${f.e.rot} 467 190)`);
    el.e.style.opacity = String(f.e.o);

    const d = f.drop;
    el.drop.setAttribute('transform', `translate(${d.x} ${d.y}) scale(${d.sx} ${d.sy})`);
    el.dropShape.setAttribute('x', String(-d.half));
    el.dropShape.setAttribute('y', String(-d.half));
    el.dropShape.setAttribute('width', String(2 * d.half));
    el.dropShape.setAttribute('height', String(2 * d.half));
    el.dropShape.setAttribute('rx', String(d.radius));
    el.echo.setAttribute('cx', String(d.x));
    el.echo.setAttribute('cy', String(d.y));
    el.echo.setAttribute('r', String(f.echo.r));
    el.echo.style.opacity = String(f.echo.o);

    el.openInner.style.transform = `translate3d(0, ${f.drift}px, 0)`;
    el.tag.classList.toggle('on', f.promise);
    el.openPin.classList.toggle('scrolled', p > 0.002);
  }

  private paintClosing(p: number): void {
    const { t, scale } = closingZoom(p, this.z0);
    const s = this.el.closeMark.style;
    s.setProperty('--zs', scale.toFixed(4));
    s.setProperty('--zx', `${(this.zoomFrom.x * (1 - t)).toFixed(2)}px`);
    s.setProperty('--zy', `${(this.zoomFrom.y * (1 - t)).toFixed(2)}px`);
    this.el.closeInner.classList.toggle('on', p >= CLOSING_LINES_AT);
  }
}
