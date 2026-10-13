import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NORTH_STAR } from '../content';

gsap.registerPlugin(ScrollTrigger);

/** Which side each slide wipes in from: +1 right (the copy sits right), -1 left (the title sits left). */
export const SLIDE_DIR = [1, -1, 1];

/**
 * Chapter 1, "Less excess. More effect.", after cassie-codes' ScrollTrigger
 * swipe gallery: each slide wipes over the last (outer wrapper slides in while
 * the inner slides the opposite way, so the copy holds still under a moving
 * edge) and the new piece eases in from the side. Slide 1 wipes in as the
 * section arrives; slides 2 and 3 are scrubbed across the pin and snap to a slide.
 */
@Component({
  selector: 'app-slide-text',
  standalone: true,
  template: `
    @for (n of [0, 1, 2]; track n) {
      <div class="slide">
        <div class="slide-outer">
          <div class="slide-inner">
            <div class="slide-content">
              <p class="piece lead" [class.hero]="n === 0">{{ copy.lead }}</p>
              @if (n >= 1) {
                <h2 class="piece title" [class.hero]="n === 1">{{ copy.title }}</h2>
              }
              @if (n >= 2) {
                <p class="piece note p-large" [class.hero]="n === 2">{{ copy.note }}</p>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      height: calc(100vh - var(--bar));
      overflow: hidden;
      color: var(--navy);
    }

    .slide,
    .slide-outer,
    .slide-inner,
    .slide-content {
      position: absolute;
      inset: 0;
    }

    .slide-outer,
    .slide-inner {
      overflow: hidden;
    }

    .slide-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr auto 1fr;
      gap: 24px;
      padding: clamp(32px, 7vh, 72px) var(--pad);
      background: var(--white);
    }

    .lead {
      grid-column: 2;
      grid-row: 1;
      align-self: start;
      max-width: 44ch;
      font-weight: 700;
      font-size: clamp(16px, 1.7vw, 24px);
      line-height: 1.4;
    }

    .title {
      grid-column: 1 / -1;
      grid-row: 2;
      font-family: var(--site-font-display);
      font-weight: 700;
      font-size: clamp(48px, 9vw, 128px);
      line-height: 1.04;
      letter-spacing: -0.016em;
      white-space: pre-line;
    }

    .note {
      grid-column: 2;
      grid-row: 3;
      align-self: end;
      justify-self: end;
      max-width: 52ch;
      text-align: right;
      opacity: 0.85;
    }

    @media (max-width: 719px) {
      .slide-content {
        grid-template-columns: 1fr;
      }

      .lead,
      .note {
        grid-column: 1;
      }

      .note {
        justify-self: start;
        text-align: left;
      }
    }
  `,
})
export class SlideText implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private mm?: gsap.MatchMedia;

  readonly copy = NORTH_STAR.slides;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }

  private build(): void {
    const host = this.el.nativeElement;
    const scene = host.closest<HTMLElement>('[data-pin]') ?? host;
    const outer = gsap.utils.toArray<HTMLElement>('.slide-outer', host);
    const inner = gsap.utils.toArray<HTMLElement>('.slide-inner', host);
    const hero = gsap.utils.toArray<HTMLElement>('.hero', host);

    /** The codepen's wipe for slide n, as scrubbable tweens at `at` on `tl`. */
    const wipe = (tl: gsap.core.Timeline, n: number, at: gsap.Position) =>
      tl
        .fromTo(outer[n], { xPercent: 100 * SLIDE_DIR[n] }, { xPercent: 0 }, at)
        .fromTo(inner[n], { xPercent: -100 * SLIDE_DIR[n] }, { xPercent: 0 }, at)
        .fromTo(hero[n], { xPercent: -30 * SLIDE_DIR[n] }, { xPercent: 0 }, at);

    this.mm = gsap.matchMedia(host);
    this.mm.add({ reduce: '(prefers-reduced-motion: reduce)', screen: 'screen' }, (context) => {
      if (context.conditions?.['reduce']) return;
      const defaults = { ease: 'none', duration: 1 };

      // Slide 1 wipes in while the section scrolls up into place.
      wipe(
        gsap.timeline({
          defaults,
          scrollTrigger: { trigger: scene, start: 'top bottom', end: 'top top', scrub: true },
        }),
        0,
        0,
      );

      // Slides 2 and 3 across the pin; a flick snaps to the next slide with the codepen's ease.
      const tl = gsap.timeline({ defaults }).addLabel('s0');
      wipe(tl, 1, 's0').addLabel('s1', '>');
      wipe(tl, 2, 's1').addLabel('s2', '>');
      ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        animation: tl,
        snap: { snapTo: 'labels', duration: { min: 0.5, max: 1 }, delay: 0, ease: 'expo.inOut' },
      });
    });
  }
}
