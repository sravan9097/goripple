import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { NETWORK_LINE } from '../content';
import { scrubScene } from './scrub';

const NODES = [
  { label: 'You', x: 120, y: 230, dy: 48 },
  { label: 'Component', x: 440, y: 110, dy: -42 },
  { label: 'Product', x: 740, y: 230, dy: 48 },
  { label: 'Team', x: 440, y: 350, dy: 48 },
];

const LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
];

/** A few nodes, then the lines between them draw in. */
@Component({
  selector: 'app-network',
  standalone: true,
  template: `
    <svg viewBox="0 0 860 460" role="img" [attr.aria-label]="line">
      @for (link of links; track $index) {
        <line [attr.x1]="link.x1" [attr.y1]="link.y1" [attr.x2]="link.x2" [attr.y2]="link.y2" />
      }
      @for (node of nodes; track node.label) {
        <g class="node">
          <circle [attr.cx]="node.x" [attr.cy]="node.y" r="28" />
          <text [attr.x]="node.x" [attr.y]="node.y + node.dy">{{ node.label }}</text>
        </g>
      }
    </svg>
    <p class="h3">{{ line }}</p>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      align-content: center;
      gap: 28px;
      height: 100%;
      padding: 24px var(--pad);
    }

    svg {
      width: min(860px, 100%);
      height: auto;
    }

    line {
      stroke: var(--navy);
      stroke-width: 1.5;
    }

    circle {
      fill: var(--white);
      stroke: var(--navy);
      stroke-width: 1.5;
    }

    text {
      fill: var(--navy);
      font: 500 14px var(--site-font-body);
      text-anchor: middle;
    }

    .h3 {
      max-width: 22ch;
      text-align: center;
    }
  `,
})
export class Network implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly line = NETWORK_LINE;
  readonly nodes = NODES;
  readonly links = LINKS.map(([a, b]) => ({
    x1: NODES[a].x,
    y1: NODES[a].y,
    x2: NODES[b].x,
    y2: NODES[b].y,
  }));

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (tl) => {
      const lines = gsap.utils.toArray<SVGLineElement>('line', host);
      const nodes = gsap.utils.toArray<SVGGElement>('.node', host);
      gsap.set(lines, {
        strokeDasharray: (_i, el) => (el as SVGLineElement).getTotalLength(),
        strokeDashoffset: (_i, el) => (el as SVGLineElement).getTotalLength(),
      });
      tl.from(nodes, { autoAlpha: 0, scale: 0.6, transformOrigin: 'center', duration: 0.4, stagger: 0.12, ease: 'power2.out' }, 0);
      tl.to(lines, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15, ease: 'none' }, 0.25);
    });
  }
}
