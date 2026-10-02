import { NgTemplateOutlet } from '@angular/common';
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
import {
  BUTTON_SIZE,
  BUTTON_SIZE_MOBILE,
  EDGE_ANCHORS,
  anchoredThrow,
  boxInk,
  centreSize,
  centreState,
  endSequence,
  gridlineOpacity,
  tileLineDraw,
  tileTransform,
  tilesInteractive,
  yeet,
  type CentreState,
} from './choreography';

type Phase = 'opening' | 'settled';

/**
 * Load-in, in ms from mount. The drop falls, rings spread from the impact and
 * the wordmark fades up with them; then the mark settles into the corner.
 * The CSS delays (.intro-drop, .intro-ring, logoFade) are the same numbers.
 */
const DROP_AT_MS = 300;
const DROP_FALL_MS = 800;
const IMPACT_MS = DROP_AT_MS + DROP_FALL_MS;
const FADE_MS = 1500;
const INTRO_MS = IMPACT_MS + FADE_MS + 100;
const MOVE_MS = 1450;

@Component({
  selector: 'app-hero-grid',
  standalone: true,
  imports: [NgTemplateOutlet],
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
  readonly nine = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  readonly gridLines = tileGridLines;

  readonly phase = signal<Phase>('opening');
  readonly centre = signal<CentreState>(1);
  readonly loadedIn = signal(false);
  /** Set once the wordmark has filled at full size; it then tucks into the corner. */
  readonly titled = signal(false);
  readonly animatingIn = signal(false);
  readonly overlayOpen = signal(false);
  readonly enlargingId = signal<string | null>(null);
  readonly prefersReduced = signal(false);
  readonly tilesFocusable = signal(false);

  @HostBinding('class.is-reduced') get reducedHost(): boolean {
    return this.prefersReduced();
  }

  private raf = 0;
  private timers: number[] = [];
  private mq?: MediaQueryList;

  constructor() {
    afterNextRender(() => this.boot());
  }

  ngOnDestroy(): void {
    this.clearTimers();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.mq?.removeEventListener('change', this.onMotionPreference);
    document.body.classList.remove('lock-scroll');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scheduleProgress();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scheduleProgress();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.returnMode()) this.closeMenu.emit();
  }

  onCentreActivate(): void {
    if (this.returnMode()) this.closeMenu.emit();
  }

  openOverlay(): void {
    this.overlayOpen.set(true);
    this.tilesFocusable.set(true);
    document.body.classList.add('lock-scroll');
    this.applyProgress();
  }

  closeOverlay(): void {
    this.overlayOpen.set(false);
    document.body.classList.remove('lock-scroll');
    this.scheduleProgress();
  }

  onTileActivate(tile: Tile, event: Event): void {
    if (!this.tilesFocusable()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    if (this.enlargingId()) return;

    if (this.prefersReduced()) {
      if (this.overlayOpen()) this.closeOverlay();
      this.jumpTo.emit(tile.id);
      return;
    }

    this.enlargingId.set(tile.id);
    const tileEl = (event.currentTarget as HTMLElement).closest('.nav-tile') as HTMLElement | null;
    if (tileEl) {
      const from = tileEl.getBoundingClientRect();
      tileEl.style.position = 'fixed';
      tileEl.style.left = `${from.left}px`;
      tileEl.style.top = `${from.top}px`;
      tileEl.style.width = `${from.width}px`;
      tileEl.style.height = `${from.height}px`;
      tileEl.style.margin = '0';
      tileEl.style.transform = 'none';
      tileEl.style.transition = 'none';
      requestAnimationFrame(() => {
        tileEl.style.transition =
          'left 0.7s cubic-bezier(0.65, 0, 0.15, 1), top 0.7s cubic-bezier(0.65, 0, 0.15, 1), width 0.7s cubic-bezier(0.65, 0, 0.15, 1), height 0.7s cubic-bezier(0.65, 0, 0.15, 1)';
        tileEl.style.left = '0px';
        tileEl.style.top = '0px';
        tileEl.style.width = '100vw';
        tileEl.style.height = '100dvh';
      });
    }
    this.timers.push(
      window.setTimeout(() => {
        if (this.overlayOpen()) this.closeOverlay();
        this.jumpTo.emit(tile.id);
      }, 720),
    );
  }

  private boot(): void {
    this.mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReduced.set(this.mq.matches);
    this.mq.addEventListener('change', this.onMotionPreference);

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    if (this.returnMode()) {
      this.settleImmediately();
      this.openOverlay();
      return;
    }

    if (this.prefersReduced()) {
      this.settleImmediately();
      return;
    }

    document.body.classList.add('lock-scroll');
    window.scrollTo(0, 0);
    this.animatingIn.set(true);
    this.applyProgress();

    // Stroke finishes, then the mark drops into the corner and fills together.
    this.timers.push(
      window.setTimeout(() => {
        this.phase.set('settled');
        this.loadedIn.set(true);
      }, INTRO_MS),
    );
    this.timers.push(window.setTimeout(() => this.titled.set(true), INTRO_MS + MOVE_MS));
    this.timers.push(
      window.setTimeout(() => {
        document.body.classList.remove('lock-scroll');
        this.animatingIn.set(false);
        this.scheduleProgress();
      }, INTRO_MS + MOVE_MS + 200),
    );
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
    this.animatingIn.set(false);
    this.applyProgress();
  }

  private scheduleProgress(): void {
    if (this.raf) return;
    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.applyProgress();
      });
    });
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

    // The overlay is the settled grid held open, independent of scroll. Reduced
    // motion gets the same end state, since there is no fly-in to watch.
    const p =
      this.overlayOpen() || this.prefersReduced()
        ? 1
        : Math.min(1, Math.max(0, (window.scrollY || 0) / Math.max(1, el.offsetHeight - vh)));

    const throwDistance = yeet(base, buttonSize);
    const first = tileTransform(0, p, isMobile, throwDistance);

    el.style.setProperty('--ts', String(first.scale));
    el.style.setProperty('--inv', String(1 / first.scale));
    el.style.setProperty('--gl-op', String(this.prefersReduced() ? 0 : gridlineOpacity(p)));
    el.style.setProperty(
      '--tl-draw',
      String(this.overlayOpen() || this.prefersReduced() ? 1 : tileLineDraw(p)),
    );
    const end =
      this.overlayOpen() || this.prefersReduced() ? { centre: 1, grow: 1, s: 1 } : endSequence(p);
    el.style.setProperty('--centre-size', `${centreSize(p, viewportMin, buttonSize)}px`);
    el.style.setProperty('--box-ink', String(this.overlayOpen() || this.prefersReduced() ? 1 : boxInk(p)));
    el.style.setProperty('--m-centre', String(end.centre));
    el.style.setProperty('--m-grow', String(end.grow));
    el.style.setProperty('--m-s', String(end.s));
    const restSize = centreSize(0, viewportMin, buttonSize);
    const restTop = container.clientHeight / 2 - restSize / 2;
    const restLeft = container.clientWidth / 2 - restSize / 2;
    const tiles = container.querySelectorAll<HTMLElement>('.nav-tile');
    tiles.forEach((tile) => {
      const i = Number(tile.dataset['i']);
      let { x, y } = tileTransform(i, p, isMobile, throwDistance);
      const anchor = isMobile ? undefined : EDGE_ANCHORS[i];
      if (anchor?.edge === 'top' || anchor?.edge === 'bottom') {
        y = anchoredThrow(tile.offsetTop, tile.offsetHeight, restTop + restSize * anchor.at, anchor.edge, p);
      } else if (anchor) {
        x = anchoredThrow(tile.offsetLeft, tile.offsetWidth, restLeft + restSize * anchor.at, anchor.edge, p);
      }
      tile.style.setProperty('--tx', `${x}px`);
      tile.style.setProperty('--ty', `${y}px`);
    });

    const settled = this.overlayOpen() || tilesInteractive(p);
    container.classList.toggle('settled-grid', settled);

    const state = centreState(p);
    if (state !== this.centre() || settled !== this.tilesFocusable()) {
      this.zone.run(() => {
        this.centre.set(state);
        this.tilesFocusable.set(settled);
      });
    }
  }

  private clearTimers(): void {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
  }
}
