import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CYCLE } from '../content';
import { scrubScene } from './scrub';

gsap.registerPlugin(SplitText);

/** Think, ideate, create, repeat. One word at a time, letters rising. */
@Component({
  selector: 'app-word-cycle',
  standalone: true,
  template: `
    <div class="cycle">
      @for (word of words; track word) {
        <p class="word">{{ word }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
    }

    :host:not(.is-ready) .word {
      opacity: 0;
    }

    .cycle {
      position: relative;
      width: min(16ch, 90vw);
      height: 1.05em;
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(64px, 12vw, 148px);
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--amber);
    }

    .word {
      position: absolute;
      inset: 0 auto auto 0;
      margin: 0;
    }

    :host.is-open {
      height: auto;
    }

    :host.is-open .cycle {
      display: grid;
      height: auto;
      gap: 4px;
    }

    :host.is-open .word {
      position: relative;
      opacity: 1;
    }
  `,
})
export class WordCycle implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly words = CYCLE;

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
        host.classList.add('is-ready', 'is-open');
        return () => host.classList.remove('is-open');
      }
      host.classList.remove('is-open');
      const lines = gsap.utils.toArray<HTMLElement>('.word', host);
      const splits = lines.map((line) => SplitText.create(line, { type: 'chars', mask: 'chars' }));
      lines.forEach((line, i) => {
        const chars = splits[i].chars;
        tl.fromTo(
          chars,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out' },
          i,
        );
        if (i < lines.length - 1) tl.to(line, { autoAlpha: 0, y: -24, duration: 0.25, ease: 'power2.in' }, i + 0.7);
      });
      host.classList.add('is-ready');
      return () => splits.forEach((split) => split.revert());
    });
  }
}
