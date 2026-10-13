import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { NORTH_STAR } from '../content';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Chapter 1 close, "Coherent by design. Human by default.": the lines rise out of their masks as the section arrives. */
@Component({
  selector: 'app-onward',
  standalone: true,
  template: `
    <!-- SplitText keeps <br>, not pre-line newlines, so the title's break is a tag. -->
    <h2 class="onward-title">
      @for (line of titleLines; track $index) {
        {{ line }}
        @if (!$last) {
          <br />
        }
      }
    </h2>
    <p class="onward-body">{{ copy.body }}</p>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 24px var(--pad);
      width: 100%;
      color: var(--navy);
    }

    .onward-title {
      grid-column: 1 / -1;
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(40px, 6.6vw, 96px);
      line-height: 1.04;
      letter-spacing: -0.04em;
    }

    .onward-body {
      grid-column: 2;
      max-width: 44ch;
      font-weight: 300;
      font-size: clamp(16px, 1.4vw, 20px);
      line-height: 1.5;
    }

    @media (max-width: 719px) {
      :host {
        grid-template-columns: 1fr;
      }

      .onward-body {
        grid-column: 1;
      }
    }
  `,
})
export class Onward implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly copy = NORTH_STAR.onward;
  readonly titleLines = NORTH_STAR.onward.title.split('\n');

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    this.mm = gsap.matchMedia(host);
    this.mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create(Array.from(host.children), { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 110,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: host, start: 'top 70%', toggleActions: 'play none none reverse' },
      });
      return () => split.revert();
    });
  }
}
