import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BROCHURE } from '../content';

gsap.registerPlugin(ScrollTrigger);

/** Timeline positions where each folded panel starts to open. The cover is already open. */
export const FOLD_AT = [0.05, 0.45];

/** How many folded panels have started to open at a scrub progress of 0..1. */
export function openFoldCount(progress: number): number {
  let n = 0;
  for (const at of FOLD_AT) if (progress >= at) n++;
  return n;
}

/**
 * Three panels. The cover sits flat; the other two swing open on their left edge
 * as the page scrolls, and fold shut again on the way back.
 */
@Component({
  selector: 'app-brochure',
  standalone: true,
  template: `
    <div class="brochure">
      <article class="panel cover">
        <p class="kicker annotation">{{ cover.kicker }}</p>
        <h2 class="h3">{{ cover.title }}</h2>
        <p class="p-large">{{ cover.body }}</p>
      </article>
      @for (panel of folds; track panel.kicker) {
        <article class="panel fold">
          <p class="kicker annotation">{{ panel.kicker }}</p>
          <h2 class="h3">{{ panel.title }}</h2>
          <p class="p-large">{{ panel.body }}</p>
        </article>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
    }

    :host.is-open {
      height: auto;
      padding: 24px 0;
    }

    .brochure {
      display: flex;
      width: min(960px, 92vw);
      height: min(440px, 62vh);
    }

    .panel {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 12px;
      padding: clamp(16px, 2.4vw, 32px);
      backface-visibility: hidden;
    }

    .cover {
      background: var(--accent);
      color: var(--white);
    }

    .fold {
      background: var(--white);
      color: var(--navy);
      transform: rotateY(-140deg);
      transform-origin: left center;
    }

    .kicker {
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.7;
    }

    .p-large {
      max-width: 28ch;
    }

    :host.is-open .brochure {
      flex-direction: column;
      height: auto;
      width: min(520px, 92vw);
    }

    :host.is-open .fold {
      transform: none !important;
    }

    @media (max-width: 719px) {
      :host .brochure {
        flex-direction: column;
        height: auto;
        width: min(520px, 92vw);
      }
    }
  `,
})
export class Brochure implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly cover = BROCHURE[0];
  readonly folds = BROCHURE.slice(1);

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    const scene = host.closest<HTMLElement>('[data-pin]') ?? host;
    const folds = gsap.utils.toArray<HTMLElement>('.fold', host);
    this.mm = gsap.matchMedia();
    this.mm.add(
      {
        reduce: '(prefers-reduced-motion: reduce)',
        narrow: '(max-width: 719px)',
        screen: 'screen',
      },
      (context) => {
        const skip = !!context.conditions?.['reduce'] || !!context.conditions?.['narrow'];
        if (skip) {
          host.classList.add('is-open');
          return () => host.classList.remove('is-open');
        }
        host.classList.remove('is-open');
        gsap.set(folds, {
          rotationY: -140,
          transformPerspective: 1600,
          transformOrigin: 'left center',
        });
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        folds.forEach((panel, i) => {
          tl.to(panel, { rotationY: 0, duration: 0.35 }, FOLD_AT[i] ?? 0.45 + i * 0.4);
        });
        ScrollTrigger.create({
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: false,
          animation: tl,
        });
        return;
      },
      host,
    );
  }
}
