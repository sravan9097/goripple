import { AfterViewInit, Directive, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { clamp01 } from './hero-grid/choreography';

/**
 * Pinned scenes run 0 to 1 while their sticky frame holds the viewport.
 * Pass-through scenes run 0 to 1 from entering the bottom edge to leaving the top.
 */
export function sceneProgress(
  scroll: number,
  top: number,
  height: number,
  vh: number,
  pinned: boolean,
): number {
  return pinned
    ? clamp01((scroll - top) / Math.max(1, height - vh))
    : clamp01((scroll - top + vh) / (height + vh));
}

/**
 * Writes the host's scroll progress to `--p` (0..1) so its styles can scrub
 * off it. `data-pin` marks a scene whose inner `.pin` is sticky for `--len`.
 * Reduced motion holds every scene at rest (`--p: 1`) with no pinning.
 */
@Directive({
  selector: '[scene]',
  standalone: true,
})
export class Scene implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private raf = 0;

  ngAfterViewInit(): void {
    this.el.classList.add('scene');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.classList.add('at-rest');
      this.el.style.setProperty('--p', '1');
      return;
    }
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.wake, { passive: true });
      window.addEventListener('resize', this.wake);
      this.paint();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('scroll', this.wake);
    window.removeEventListener('resize', this.wake);
  }

  private readonly wake = (): void => {
    if (!this.raf) this.raf = requestAnimationFrame(this.paint);
  };

  private readonly paint = (): void => {
    this.raf = 0;
    const r = this.el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = sceneProgress(0, r.top, r.height, vh, this.el.hasAttribute('data-pin'));
    this.el.style.setProperty('--p', p.toFixed(4));
  };
}
