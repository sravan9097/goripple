import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { NORTH_STAR } from '../content';
import { scrubScene } from './scrub';

gsap.registerPlugin(SplitText);

/**
 * Chapter 1 close, "Coherent by design. Human by default.": pinned, so the lines
 * rise out of their masks with the scroll and hold in view; only then does the
 * page move on to the pager.
 */
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
      align-content: center;
      gap: 24px var(--pad);
      height: 100%;
      padding: clamp(24px, 5vh, 56px) var(--pad);
      color: var(--navy);
    }

    .onward-title {
      grid-column: 1 / -1;
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(40px, 6.6vw, 96px);
      line-height: 1.04;
      letter-spacing: -0.048em;
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
    this.mm = scrubScene(host, (tl, reduce) => {
      if (reduce) return;
      const title = SplitText.create(host.querySelector('.onward-title'), {
        type: 'lines',
        mask: 'lines',
      });
      const body = SplitText.create(host.querySelector('.onward-body'), {
        type: 'lines',
        mask: 'lines',
      });
      // A line mask is the line box, which at 1.04 clips descenders (the g of "design"): pad it.
      gsap.set(title.masks, { paddingBottom: '0.14em', marginBottom: '-0.14em' });
      tl.from(title.lines, { yPercent: 110, duration: 1, stagger: 0.25, ease: 'power3.out' })
        .from(
          body.lines,
          { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
          '-=0.4',
        )
        .to({}, { duration: 1.2 }); // hold, fully in view, before the pager scrolls in
      return () => {
        title.revert();
        body.revert();
      };
    });
  }
}
