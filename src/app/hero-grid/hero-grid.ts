import {
  afterNextRender,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  NgZone,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { TAGLINE_ONE, TAGLINE_TWO, TILES, tileGridLines, type Tile } from '../content';
import { WORDMARK_LETTERS } from '../wordmark/wordmark';
import {
  BUTTON_SIZE,
  BUTTON_SIZE_MOBILE,
  EDGE_ANCHORS,
  anchoredThrow,
  boxInk,
  centreSize,
  centreState,
  clamp01,
  endSequence,
  gridlineOpacity,
  tileLineDraw,
  tileScreenBox,
  tileTransform,
  tilesInteractive,
  yeet,
  type CentreState,
} from './choreography';
import { heroFrame, landedReveal, lerp, openingLayout, span, type OpeningLayout, type Placement } from './opening';

type Phase = 'opening' | 'settled';

/** Beat A: dropIn is 0.4s delay + 1.9s; hold scroll until the rebound has finished. */
const INTRO_LOCK_MS = 2300;
/** Viewports of scroll that scrub the opening before the collapse begins (:host height = 1 + this + 1). */
const OPEN_SCROLL_VH = 2;
/** Per-frame easing toward the real scroll position, for the story's smooth-scroll feel. */
const SMOOTHING = 0.12;
/** Menu overlay fly-in / fly-out — 25% faster than the prior 550ms swoop. */
const OVERLAY_MS = 413;

interface OpeningEls {
  root: HTMLElement;
  bg: HTMLElement;
  tag: HTMLElement;
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
}

@Component({
  selector: 'app-hero-grid',
  standalone: true,
  templateUrl: './hero-grid.html',
  styleUrl: './hero-grid.scss',
})
export class HeroGrid implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  readonly jumpTo = output<string>();
  /** Opened from a section's corner menu: the grid is already settled, and the centre closes it. */
  readonly returnMode = input(false);
  readonly closeMenu = output<void>();

  readonly tiles: Tile[] = TILES;
  readonly taglineOne = TAGLINE_ONE;
  readonly taglineTwo = TAGLINE_TWO;
  readonly gridLines = tileGridLines;
  readonly letters = WORDMARK_LETTERS;

  readonly phase = signal<Phase>('opening');
  readonly centre = signal<CentreState>(1);
  /** The opening has handed off: the box is on screen with the mark in its corner. */
  readonly loadedIn = signal(false);
  /** The tagline and chevrons belong to the settled box; same moment as loadedIn. */
  readonly titled = signal(false);
  readonly overlayOpen = signal(false);
  /** Close is in flight: X shrinks away while tiles and the paper fill leave. */
  readonly overlayLeaving = signal(false);
  readonly prefersReduced = signal(false);
  readonly tilesFocusable = signal(false);

  @HostBinding('class.is-reduced') get reducedHost(): boolean {
    return this.prefersReduced();
  }

  /** Menu overlay sits on a section page; host must not stretch that page. */
  @HostBinding('class.is-overlay-host') get overlayHost(): boolean {
    return this.returnMode();
  }

  private raf = 0;
  private overlayRaf = 0;
  private timers: number[] = [];
  private mq?: MediaQueryList;
  /** Smoothed scroll position; the rAF loop runs until it catches up with the real one. */
  private y = 0;
  /** Set once the reveal reaches the box, so scrolling back does not replay it. */
  private revealLanded = false;
  /**
   * Overlay tile progress (0 = thrown off-screen, 1 = settled). Independent of
   * scroll so the menu can fly in/out like brand.dropbox.com section pages.
   */
  private overlayP = 1;
  private o!: OpeningEls;
  private layout!: OpeningLayout;
  /** The box's settled corner mark, where the opening lands its own copy. */
  private target!: Placement;
  private box = { size: 0, left: 0, top: 0 };

  constructor() {
    afterNextRender(() => this.boot());
  }

  ngOnDestroy(): void {
    this.clearTimers();
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.overlayRaf) cancelAnimationFrame(this.overlayRaf);
    this.mq?.removeEventListener('change', this.onMotionPreference);
    document.body.classList.remove('lock-scroll');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scheduleProgress();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.measureOpening();
    this.scheduleProgress();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.returnMode()) this.dismissOverlay();
  }

  onCentreActivate(): void {
    if (this.returnMode()) this.dismissOverlay();
  }

  openOverlay(): void {
    this.overlayOpen.set(true);
    this.overlayLeaving.set(false);
    document.body.classList.add('lock-scroll');
    if (this.prefersReduced()) {
      this.overlayP = 1;
      this.tilesFocusable.set(true);
      this.applyProgress();
      return;
    }
    // Paint thrown tiles first, then swoop them in (Dropbox `.open` toggle).
    this.overlayP = 0;
    this.tilesFocusable.set(false);
    this.applyProgress();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.animateOverlay(0, 1, () => this.tilesFocusable.set(true)));
    });
  }

  /** Fly the tiles out, then leave the overlay (X / Escape in return mode). */
  private dismissOverlay(): void {
    if (this.overlayLeaving()) return;
    this.overlayLeaving.set(true);
    this.tilesFocusable.set(false);
    if (this.prefersReduced()) {
      this.closeMenu.emit();
      return;
    }
    this.animateOverlay(1, 0, () => this.closeMenu.emit());
  }

  private animateOverlay(from: number, to: number, done?: () => void): void {
    if (this.overlayRaf) cancelAnimationFrame(this.overlayRaf);
    const t0 = performance.now();
    const step = (now: number): void => {
      const t = clamp01((now - t0) / OVERLAY_MS);
      this.overlayP = from + (to - from) * t;
      this.applyProgress();
      if (t < 1) {
        this.overlayRaf = requestAnimationFrame(step);
        return;
      }
      this.overlayRaf = 0;
      this.overlayP = to;
      this.applyProgress();
      done?.();
    };
    this.zone.runOutsideAngular(() => {
      this.overlayRaf = requestAnimationFrame(step);
    });
  }

  onTileActivate(tile: Tile, event: Event): void {
    event.preventDefault();
    if (!this.tilesFocusable()) return;
    // Name the tile and its title for the router's view transition: the chapter
    // opener carries the same names (section-page.scss), so the browser morphs
    // the colour panel and the title from here to there as one.
    const a = event.currentTarget as HTMLElement;
    a.style.viewTransitionName = 'section-panel';
    a.querySelector<HTMLElement>('.tile-title')!.style.viewTransitionName = 'section-title';
    this.jumpTo.emit(tile.id);
  }

  private boot(): void {
    this.mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReduced.set(this.mq.matches);
    this.mq.addEventListener('change', this.onMotionPreference);

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const q = <T extends Element>(s: string) => this.host.nativeElement.querySelector(s) as T;
    const qa = <T extends Element>(s: string) =>
      Array.from(this.host.nativeElement.querySelectorAll(s)) as T[];
    this.o = {
      root: q('.opening'),
      bg: q('.open-bg'),
      tag: q('.o-tag'),
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
    };
    this.measureOpening();

    if (this.returnMode()) {
      // Overlay owns the tile motion; skip settleImmediately so we do not fade
      // the grid in before the fly-in starts.
      this.clearTimers();
      this.phase.set('settled');
      this.loadedIn.set(true);
      this.titled.set(true);
      this.centre.set(3);
      this.openOverlay();
      return;
    }

    if (this.prefersReduced()) {
      this.settleImmediately();
      return;
    }

    // Hold the page while the drop falls; from then on the scroll drives everything.
    document.body.classList.add('lock-scroll');
    window.scrollTo(0, 0);
    this.timers.push(
      window.setTimeout(() => document.body.classList.remove('lock-scroll'), INTRO_LOCK_MS),
    );
    this.applyProgress();
  }

  private readonly onMotionPreference = (event: MediaQueryListEvent): void => {
    this.prefersReduced.set(event.matches);
    if (event.matches) this.settleImmediately();
  };

  private settleImmediately(): void {
    this.clearTimers();
    document.body.classList.remove('lock-scroll');
    this.phase.set('settled');
    this.loadedIn.set(true);
    this.titled.set(true);
    this.applyProgress();
  }

  private scheduleProgress(): void {
    if (this.raf) return;
    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(this.tick);
    });
  }

  private readonly tick = (): void => {
    this.raf = 0;
    const target = window.scrollY || 0;
    this.y = this.prefersReduced() ? target : this.y + (target - this.y) * SMOOTHING;
    if (Math.abs(target - this.y) < 0.5) this.y = target;
    this.applyProgress();
    if (this.y !== target) this.scheduleProgress();
  };

  /** Layout reads for the opening that do not change with scroll. */
  private measureOpening(): void {
    const container = this.host.nativeElement.querySelector('.nav-container') as HTMLElement | null;
    if (!container || !this.o) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const { o } = this;

    const L = openingLayout(w, h);
    this.layout = L;
    o.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    o.maskDef.setAttribute('width', String(w));
    o.maskDef.setAttribute('height', String(h));

    const [ix, iy] = heroFrame(0, L, L.end).impact;
    const min = Math.min(w, h);
    for (const g of o.at) g.setAttribute('transform', `translate(${ix} ${iy})`);
    o.mask.setAttribute('cx', String(ix));
    o.mask.setAttribute('cy', String(iy));
    for (const ring of o.rings) {
      ring.setAttribute('cx', String(ix));
      ring.setAttribute('cy', String(iy));
    }
    o.root.querySelector('.o-glimmer')?.setAttribute('r', String(0.2 * min));
    o.root.querySelector('.o-idle')?.setAttribute('r', String(0.3 * min));
    o.root.querySelectorAll('.o-burst').forEach((c) => c.setAttribute('r', String(0.45 * L.diag)));
    const rest = 18 * L.start.s;
    o.root.querySelectorAll<SVGCircleElement>('.o-ghost').forEach((c) => {
      c.setAttribute('r', String(rest * Number(c.style.getPropertyValue('--g') || 0.5)));
    });

    // The box at rest and the mark in its corner: the same numbers as .nav-button's
    // --mark-l / --mark-w and .final .centre-mark in hero-grid.scss.
    const size = centreSize(0, min, w <= 991 ? BUTTON_SIZE_MOBILE : BUTTON_SIZE);
    const markL = Math.min(Math.max(20, 0.05 * size), 56);
    const markW = Math.min(0.46 * size, 280);
    this.box = { size, left: (w - size) / 2, top: (h - size) / 2 };
    this.target = {
      x: this.box.left + markL,
      y: this.box.top + size - markL - (markW * 250) / 488,
      s: markW / 488,
    };
  }

  /** The opening from the scroll: the story's frame, then the hand-off into the box. */
  private paintOpening(q: number): void {
    const { o, layout: L } = this;
    const f = heroFrame(q, L, this.target);
    o.mark.setAttribute('transform', `translate(${f.mark.x} ${f.mark.y}) scale(${f.mark.s})`);
    o.mask.setAttribute('r', String(f.mask));
    f.rings.forEach((ring, k) => {
      o.rings[k].setAttribute('r', String(ring.r));
      o.rings[k].style.opacity = String(ring.o);
    });
    o.e.setAttribute('transform', `translate(0 ${f.e.dy}) rotate(${f.e.rot} 467 190)`);
    o.e.style.opacity = String(f.e.o);

    const d = f.drop;
    o.drop.setAttribute('transform', `translate(${d.x} ${d.y}) scale(${d.sx} ${d.sy})`);
    o.dropShape.setAttribute('x', String(-d.half));
    o.dropShape.setAttribute('y', String(-d.half));
    o.dropShape.setAttribute('width', String(2 * d.half));
    o.dropShape.setAttribute('height', String(2 * d.half));
    o.dropShape.setAttribute('rx', String(d.radius));
    o.echo.setAttribute('cx', String(d.x));
    o.echo.setAttribute('cy', String(d.y));
    o.echo.setAttribute('r', String(f.echo.r));
    o.echo.style.opacity = String(f.echo.o);

    // Hand-off: the navy shrinks onto the box and the tagline fades in on its spot.
    o.bg.style.setProperty('--bsx', String(lerp(1, this.box.size / L.w, f.box)));
    o.bg.style.setProperty('--bsy', String(lerp(1, this.box.size / L.h, f.box)));
    o.tag.style.setProperty('--bx', `${this.box.left}px`);
    o.tag.style.setProperty('--by', `${this.box.top}px`);
    o.tag.style.setProperty('--bs', `${this.box.size}px`);
    o.tag.style.setProperty('--to', String(span(f.box, 0.5, 1)));
    // One way. Taking .scrolled off reapplies dropIn, so scrolling back to the
    // top replays the fall over the partial P. The fall plays once.
    if (q > 0.002) o.root.classList.add('scrolled');
  }

  private applyProgress(): void {
    const el = this.host.nativeElement;
    const container = el.querySelector('.nav-container') as HTMLElement | null;
    if (!container) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 991;
    const buttonSize = isMobile ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;
    const base = Math.max(vw, vh);
    const viewportMin = Math.min(vw, vh);

    // Overlay: opening is already done (q = 1, centre settled); only the tiles
    // scrub on overlayP. Reduced motion jumps to the end. Otherwise scroll
    // drives opening (q) then the box collapse (p).
    const overlay = this.overlayOpen();
    const reduced = this.prefersReduced();
    const openPx = OPEN_SCROLL_VH * vh;
    const reveal = landedReveal(overlay || reduced ? 1 : clamp01(this.y / openPx), this.revealLanded);
    this.revealLanded = reveal.landed;
    const q = reveal.q;
    const scrollP = reduced
      ? 1
      : clamp01((this.y - openPx) / Math.max(1, el.offsetHeight - vh - openPx));
    const tileP = overlay ? this.overlayP : scrollP;
    const boxP = overlay || reduced ? 1 : scrollP;
    this.paintOpening(q);

    // Paper fill tracks tile progress so white ↔ transparent runs with the fly.
    el.style.setProperty('--overlay-fill', overlay ? String(this.overlayP) : '1');

    const throwDistance = yeet(base, buttonSize);
    const first = tileTransform(0, tileP, isMobile, throwDistance);

    el.style.setProperty('--ts', String(first.scale));
    el.style.setProperty('--inv', String(1 / first.scale));
    // Gridlines only ride the landing scroll fly-in — hide them on the menu overlay.
    el.style.setProperty('--gl-op', String(overlay || reduced ? 0 : gridlineOpacity(tileP)));
    el.style.setProperty(
      '--tl-draw',
      String(overlay ? 0 : reduced ? 1 : tileLineDraw(tileP)),
    );
    const end = overlay || reduced ? { centre: 1, grow: 1, s: 1 } : endSequence(boxP);
    el.style.setProperty('--box-ink', String(overlay || reduced ? 1 : boxInk(boxP)));
    el.style.setProperty('--m-centre', String(end.centre));
    el.style.setProperty('--m-grow', String(end.grow));
    el.style.setProperty('--m-s', String(end.s));
    const restSize = centreSize(0, viewportMin, buttonSize);
    const restTop = container.clientHeight / 2 - restSize / 2;
    const restLeft = container.clientWidth / 2 - restSize / 2;
    const tiles = container.querySelectorAll<HTMLElement>('.nav-tile');
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    // Half the largest square around the centre that no tile face reaches into.
    let room = Infinity;
    tiles.forEach((tile) => {
      const i = Number(tile.dataset['i']);
      let { x, y } = tileTransform(i, tileP, isMobile, throwDistance);
      // Overlay matches Dropbox's menu: pure yeet vectors, no edge anchors.
      const anchor = overlay || isMobile ? undefined : EDGE_ANCHORS[i];
      if (anchor?.edge === 'top' || anchor?.edge === 'bottom') {
        y = anchoredThrow(
          tile.offsetTop,
          tile.offsetHeight,
          restTop + restSize * anchor.at,
          anchor.edge,
          tileP,
        );
      } else if (anchor) {
        x = anchoredThrow(
          tile.offsetLeft,
          tile.offsetWidth,
          restLeft + restSize * anchor.at,
          anchor.edge,
          tileP,
        );
      }
      tile.style.setProperty('--tx', `${x}px`);
      tile.style.setProperty('--ty', `${y}px`);
      const b = tileScreenBox(
        { x: tile.offsetLeft, y: tile.offsetTop, width: tile.offsetWidth, height: tile.offsetHeight },
        { scale: first.scale, x, y },
      );
      room = Math.min(room, Math.max(b.left - cx, cx - b.right, b.top - cy, cy - b.bottom));
    });
    // The tiles close in on their own curve while the box shrinks on a straight
    // one, so cap the box at the gap they leave: it never covers a tile.
    const size = centreSize(boxP, viewportMin, buttonSize);
    const capped = !overlay && !reduced && centreState(boxP) === 3;
    el.style.setProperty('--centre-size', `${capped ? Math.min(size, Math.max(buttonSize, 2 * room)) : size}px`);

    const settled = (overlay && this.overlayP > 0.95) || (!overlay && tilesInteractive(scrollP));
    container.classList.toggle('settled-grid', settled);

    const state = centreState(boxP);
    const final = q >= 1;
    if (state !== this.centre() || settled !== this.tilesFocusable() || final !== this.loadedIn()) {
      this.zone.run(() => {
        this.centre.set(state);
        // Overlay owns focusability via its own animation callbacks.
        if (!overlay) this.tilesFocusable.set(settled);
        this.loadedIn.set(final);
        this.titled.set(final);
        this.phase.set(final ? 'settled' : 'opening');
      });
    }
  }

  private clearTimers(): void {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
  }
}
