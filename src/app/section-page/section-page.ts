import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DIVISIONS, LINKS, OUTRO_QUOTE, SECTIONS, TILES, WHO_ICONS } from '../content';
import { RevealOnScroll } from '../reveal.directive';
import { DropPool } from '../visuals/drop-pool';
import { Propagate } from '../visuals/propagate';
import { Swatches } from '../visuals/swatches';
import { Wordmark } from '../wordmark/wordmark';

@Component({
  selector: 'app-section-page',
  imports: [RouterLink, RevealOnScroll, DropPool, Propagate, Swatches, Wordmark],
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

  readonly links = LINKS;
  readonly divisions = DIVISIONS;
  readonly whoIcons = WHO_ICONS;
  readonly outro = OUTRO_QUOTE;

  readonly foundations = ['Colour', 'Type', 'Spacing', 'Shape', 'Motion', 'Elevation'];
  readonly patterns = ['Page header', 'Side nav', 'Data table', 'Filter bar', 'Drawer'];

  readonly howSteps = [
    { label: 'Figma', detail: 'Variables' },
    { label: 'Tokens', detail: 'CSS · SCSS · TS' },
    { label: 'Components', detail: '@stolt/rippl' },
    { label: 'Agents', detail: 'KB · Skills · MCP' },
  ];

  readonly credits = [
    { name: 'Design System team', colour: 'var(--rippl-ref-color-cyan-500)' },
    { name: 'Stolt Tankers', colour: 'var(--rippl-ref-color-navy-blue-500)' },
    { name: 'Tank Containers', colour: 'var(--rippl-ref-color-magenta-500)' },
    { name: 'Stolthaven', colour: 'var(--rippl-ref-color-light-green-600)' },
    { name: 'Sea Farm', colour: 'var(--rippl-ref-color-orange-600)' },
  ];
}
