import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { FOUNDATIONS } from '../content';
import { Icon } from './icon';
import { scrubScene } from './scrub';

/** Seven foundations. Each card flips up to reveal the next as you scroll. */
@Component({
  selector: 'app-foundation-flip',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="stack">
      @for (card of cards; track card.title; let i = $index) {
        <article class="card" [style.z-index]="cards.length - i">
          <app-icon [name]="card.icon" />
          <h2 class="h2">{{ card.title }}</h2>
          <p class="p-large">{{ card.body }}</p>
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
      padding: 8px 0 24px;
    }

    .stack {
      position: relative;
      width: min(480px, 88vw);
      height: min(340px, 56vh);
    }

    .card {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 12px;
      padding: 28px;
      background: var(--white);
      color: var(--navy);
      box-shadow: 0 16px 40px rgb(0 0 0 / 10%);
    }

    .p-large {
      color: var(--muted);
      max-width: 32ch;
    }

    :host.is-open .stack {
      display: grid;
      height: auto;
      width: min(640px, 92vw);
      gap: 12px;
    }

    :host.is-open .card {
      position: relative;
      inset: auto;
    }
  `,
})
export class FoundationFlip implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly cards = FOUNDATIONS;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (tl, reduce) => {
      if (reduce) {
        host.classList.add('is-open');
        return () => host.classList.remove('is-open');
      }
      host.classList.remove('is-open');
      const cards = gsap.utils.toArray<HTMLElement>('.card', host);
      gsap.set(cards, {
        transformPerspective: 1200,
        transformOrigin: 'center top',
        backfaceVisibility: 'hidden',
      });
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        tl.to(card, { rotationX: -110, duration: 0.7, ease: 'none' }, i);
      });
      return;
    });
  }
}
