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
  BUILD_BLOCKS,
  DESIGN_PARTS,
  LINKS,
  OUTRO_QUOTE,
  PRINCIPLES,
  SECTIONS,
  TILES,
  tileGridLines,
  type ResourceLink,
} from '../content';
import { HeroGrid } from '../hero-grid/hero-grid';
import { RevealOnScroll } from '../reveal.directive';
import { Scene } from '../scene.directive';
import { Brochure } from '../visuals/brochure';
import { Builders } from '../visuals/builders';
import { Consistency } from '../visuals/consistency';
import { FoundationFlip } from '../visuals/foundation-flip';
import { Icon } from '../visuals/icon';
import { Network } from '../visuals/network';
import { NorthStar } from '../visuals/north-star';
import { ProductLine } from '../visuals/product-line';
import { WordCycle } from '../visuals/word-cycle';
import { Wordmark } from '../wordmark/wordmark';

@Component({
  selector: 'app-section-page',
  imports: [
    RouterLink,
    RevealOnScroll,
    Scene,
    NorthStar,
    Wordmark,
    HeroGrid,
    Icon,
    FoundationFlip,
    Brochure,
    WordCycle,
    Network,
    ProductLine,
    Consistency,
    Builders,
  ],
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
  readonly outro = OUTRO_QUOTE;
  readonly principles = PRINCIPLES;
  readonly designParts = DESIGN_PARTS;
  readonly buildBlocks = BUILD_BLOCKS;

  /** 7 x 7 field. The centre turns amber first; the rest follow together. */
  readonly dots = Array.from({ length: 49 }, (_, i) => ({ centre: i === 24 }));

  linksFor(port: ResourceLink['port']): ResourceLink[] {
    return LINKS.filter((link) => link.port === port);
  }
}
