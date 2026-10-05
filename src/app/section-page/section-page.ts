import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  DIVISIONS,
  ISLAND_BUTTON,
  ISLAND_CAPTIONS,
  ISLAND_GAP,
  ISLANDS,
  LINKS,
  OUTRO_QUOTE,
  SECTIONS,
  SHARED_PROMISE,
  TILES,
  VERBS,
  tileGridLines,
} from '../content';
import { HeroGrid } from '../hero-grid/hero-grid';
import { RevealOnScroll } from '../reveal.directive';
import { Scene } from '../scene.directive';
import { DropPool } from '../visuals/drop-pool';
import { Wordmark, WORDMARK_LETTERS } from '../wordmark/wordmark';

/** Act 5 scene: the one colour at the centre that every part draws from. */
const KIT_PALETTE = [
  { name: 'Navy', value: 'var(--rippl-ref-color-navy-blue-700)' },
  { name: 'Cyan', value: 'var(--rippl-ref-color-cyan-600)' },
  { name: 'Green', value: 'var(--rippl-ref-color-light-green-700)' },
  { name: 'Magenta', value: 'var(--rippl-ref-color-magenta-600)' },
  { name: 'Red', value: 'var(--rippl-ref-color-stolt-red-500)' },
];

const DOT_PALETTE = [
  'var(--amber)',
  'var(--rippl-ref-color-cyan-400)',
  'var(--rippl-ref-color-light-green-400)',
  'var(--rippl-ref-color-magenta-400)',
  'var(--rippl-ref-color-white)',
];

@Component({
  selector: 'app-section-page',
  imports: [RouterLink, RevealOnScroll, Scene, DropPool, Wordmark, HeroGrid],
  templateUrl: './section-page.html',
  styleUrl: './section-page.scss',
})
export class SectionPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.route.url.pipe(map((segments) => segments[0]?.path ?? '')),
    { initialValue: '' },
  );
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');
  private readonly opener = viewChild<ElementRef<HTMLElement>>('opener');
  private menuObserver?: IntersectionObserver;

  /** The route only exists for ids in TILES, so the lookup always lands. */
  readonly tile = computed(() => TILES.find((t) => t.id === this.url()) ?? TILES[0]);
  readonly section = computed(
    () => SECTIONS.find((s) => s.id === this.tile().id) ?? SECTIONS[0],
  );
  private readonly index = computed(() => TILES.findIndex((t) => t.id === this.tile().id));
  readonly previous = computed(() => TILES[this.index() - 1]);
  readonly next = computed(() => TILES[this.index() + 1]);

  /** False through the opener title reveal; true once that section has cleared. */
  readonly menuAccent = signal(false);

  /**
   * Menu opens on this section (`?menu=1`) so the grid overlays it — white can
   * fade to transparent and reveal the page underneath (Dropbox behaviour).
   */
  readonly menuOpen = toSignal(
    this.route.queryParamMap.pipe(map((query) => query.has('menu'))),
    { initialValue: this.route.snapshot.queryParamMap.has('menu') },
  );

  constructor() {
    afterNextRender(() => this.watchOpener());
  }

  ngOnDestroy(): void {
    this.menuObserver?.disconnect();
  }

  closeOverlayMenu(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { menu: null },
      queryParamsHandling: 'merge',
    });
  }

  openFromMenu(id: string): void {
    void this.router.navigate(['/', id]);
  }

  private watchOpener(): void {
    const el = this.opener()?.nativeElement;
    if (!el) return;
    // Shrink the root by the sticky bar so "past" means below the page chrome.
    const top = Math.round(this.bar()?.nativeElement.getBoundingClientRect().height ?? 56);
    this.menuObserver = new IntersectionObserver(
      ([entry]) => this.menuAccent.set(!entry.isIntersecting),
      { rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    this.menuObserver.observe(el);
  }

  /** The big numbered line above the pillars, only when every pillar has a word for it. */
  readonly pillarWords = computed(() => {
    const words = (this.section().pillars ?? []).map((p) => p.word);
    return words.length && words.every(Boolean) ? (words as string[]) : null;
  });

  readonly gridLines = tileGridLines;
  readonly links = LINKS;
  readonly divisions = DIVISIONS;
  readonly outro = OUTRO_QUOTE;
  readonly letters = WORDMARK_LETTERS;

  // Act 2: four identical islands drift apart, and so do their buttons.
  readonly islands = ISLANDS;
  readonly islandButton = ISLAND_BUTTON;
  readonly islandCaptions = ISLAND_CAPTIONS;
  readonly islandGap = ISLAND_GAP;
  readonly drift: Record<string, string> = {
    seafarm: '--sx: -1; --sy: -1; --rot: -1.2; --bg2: var(--rippl-ref-color-cyan-600); --r2: 99px',
    containers:
      '--sx: 1; --sy: -1; --rot: 0.8; --bg2: var(--rippl-ref-color-light-green-700); --r2: 0px; --px2: 10px; --ls2: 0.08em',
    tankers:
      '--sx: -1; --sy: 1; --rot: 0.6; --bg2: transparent; --bd2: var(--navy); --fg2: var(--navy); --r2: 99px; --px2: 12px',
    terminals: '--sx: 1; --sy: 1; --rot: -0.9; --bg2: var(--rippl-ref-color-magenta-700); --r2: 12px',
  };

  // Act 3: 7 x 7 field; `d` is distance from the centre, so colour spreads like a ring.
  readonly dots = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7) - 3;
    const c = (i % 7) - 3;
    return {
      d: (Math.hypot(r, c) / Math.hypot(3, 3)).toFixed(3),
      c: i === 24 ? 'var(--amber)' : DOT_PALETTE[(i * 3) % DOT_PALETTE.length],
      centre: i === 24,
    };
  });

  // Act 5: change the centre, every part follows.
  readonly palette = KIT_PALETTE;
  readonly kit = signal(KIT_PALETTE[0]);

  // Acts 6 and 7
  readonly verbs = VERBS;
  readonly sharedPromise = SHARED_PROMISE;

  /** GoRippl / DoRippl: the colour swap spreads from wherever the pointer came in. */
  aim(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - r.left}px`);
    card.style.setProperty('--y', `${event.clientY - r.top}px`);
  }
}
