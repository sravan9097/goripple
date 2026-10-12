import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrub a timeline across the pinned scene that wraps `host`.
 * `screen` always matches, so the callback runs for everyone; `reduce` jumps to the end.
 * The builder may return a cleanup (SplitText revert, class removal).
 */
export function scrubScene(
  host: HTMLElement,
  build: (tl: gsap.core.Timeline, reduce: boolean) => void | (() => void),
): gsap.MatchMedia {
  const scene = host.closest<HTMLElement>('[data-pin]') ?? host;
  const mm = gsap.matchMedia();
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      screen: 'screen',
    },
    (context) => {
      const reduce = !!context.conditions?.['reduce'];
      const tl = gsap.timeline();
      const cleanup = build(tl, reduce);
      if (reduce) tl.progress(1);
      else {
        ScrollTrigger.create({
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: false,
          animation: tl,
        });
      }
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    },
    host,
  );
  return mm;
}
