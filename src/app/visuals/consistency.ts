import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { scrubScene } from './scrub';

/** Product and the design system meet, and the word they make is Consistency. */
@Component({
  selector: 'app-consistency',
  standalone: true,
  template: `
    <div class="meet">
      <p class="chip product">Product</p>
      <p class="chip system">Design system</p>
      <p class="word">Consistency</p>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
    }

    .meet {
      position: relative;
      display: grid;
      place-items: center;
      width: min(640px, 92vw);
      height: 180px;
    }

    .chip,
    .word {
      position: absolute;
      margin: 0;
      font-family: var(--site-font-display);
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .chip {
      font-size: clamp(22px, 3vw, 36px);
      padding: 12px 18px;
      border: 1px solid var(--site-line-strong);
    }

    .product {
      transform: translateX(-150px);
    }

    .system {
      transform: translateX(150px);
    }

    .word {
      font-size: clamp(40px, 7vw, 84px);
      line-height: 1;
      visibility: hidden;
    }
  `,
})
export class Consistency implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = scrubScene(host, (tl) => {
      const product = host.querySelector('.product');
      const system = host.querySelector('.system');
      const word = host.querySelector('.word');
      gsap.set(product, { x: -150 });
      gsap.set(system, { x: 150 });
      gsap.set(word, { autoAlpha: 0 });
      tl.to([product, system], { x: 0, duration: 1, ease: 'power2.inOut' }, 0);
      tl.to([product, system], { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.95);
      tl.to(word, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 1.15);
    });
  }
}
