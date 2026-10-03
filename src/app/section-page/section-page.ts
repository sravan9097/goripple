import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
} from '../content';
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
  imports: [RouterLink, RevealOnScroll, Scene, DropPool, Wordmark],
  templateUrl: './section-page.html',
  styleUrl: './section-page.scss',
})
export class SectionPage {
  private readonly url = toSignal(
    inject(ActivatedRoute).url.pipe(map((segments) => segments[0]?.path ?? '')),
    { initialValue: '' },
  );

  /** The route only exists for ids in TILES, so the lookup always lands. */
  readonly tile = computed(() => TILES.find((t) => t.id === this.url()) ?? TILES[0]);
  readonly section = computed(
    () => SECTIONS.find((s) => s.id === this.tile().id) ?? SECTIONS[0],
  );
  private readonly index = computed(() => TILES.findIndex((t) => t.id === this.tile().id));
  readonly previous = computed(() => TILES[this.index() - 1]);
  readonly next = computed(() => TILES[this.index() + 1]);

  /** Opener words with a running index, so each can rise on its own share of the scroll. */
  readonly openerLines = computed(() => {
    let i = 0;
    return this.section()
      .title.split('\n')
      .map((line) => line.split(' ').map((t) => ({ t, i: i++ })));
  });
  readonly wordCount = computed(() => this.openerLines().flat().length);

  /** The big numbered line above the pillars, only when every pillar has a word for it. */
  readonly pillarWords = computed(() => {
    const words = (this.section().pillars ?? []).map((p) => p.word);
    return words.length && words.every(Boolean) ? (words as string[]) : null;
  });

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
