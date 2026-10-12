import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { scrubScene } from './scrub';

/** People arrive, then stack work on the foundation. The pile is the scale. */
@Component({
  selector: 'app-builders',
  standalone: true,
  template: `
    <div class="yard" role="img" aria-label="People stack work on a shared foundation">
      <div class="people" aria-hidden="true">
        @for (p of people; track p) {
          <svg class="person" viewBox="0 0 48 72">
            <circle cx="24" cy="12" r="7" />
            <path d="M10 70V40c0-8 6-12 14-12s14 4 14 12v30" />
          </svg>
        }
      </div>
      <div class="pile" aria-hidden="true">
        @for (block of blocks; track block) {
          <i class="block"></i>
        }
      </div>
      <p class="base">Foundations</p>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
      color: var(--white);
    }

    .yard {
      display: grid;
      justify-items: center;
      gap: 8px;
    }

    .people {
      display: flex;
      gap: 36px;
    }

    .person {
      width: 42px;
      height: 64px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    .pile {
      display: flex;
      flex-direction: column-reverse;
      gap: 6px;
      width: min(240px, 64vw);
    }

    .block {
      display: block;
      height: 28px;
      background: var(--accent);
    }

    .base {
      margin: 0;
      width: min(300px, 76vw);
      padding: 10px 0;
      background: var(--white);
      color: var(--navy);
      text-align: center;
      font-family: var(--site-font-display);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
  `,
})
export class Builders implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly people = [0, 1, 2];
  readonly blocks = [0, 1, 2, 3, 4];

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (tl) => {
      const people = gsap.utils.toArray<HTMLElement>('.person', host);
      const blocks = gsap.utils.toArray<HTMLElement>('.block', host);
      tl.from(people, { autoAlpha: 0, y: 16, duration: 0.35, stagger: 0.12, ease: 'power2.out' }, 0);
      tl.from(blocks, { autoAlpha: 0, y: 36, duration: 0.4, stagger: 0.18, ease: 'power2.out' }, 0.45);
    });
  }
}
