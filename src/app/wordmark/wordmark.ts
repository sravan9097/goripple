import { Component, input } from '@angular/core';

/** The five letters of the wordmark (R i p p l) in its 488 x 250 viewBox. */
export const WORDMARK_LETTERS = [
  'M21 61.0078C29.06 55.7081 38.7079 53.57 47.8564 54.0713C60.3678 54.7571 73.2551 60.4376 81.3223 71.501C86.4174 78.4886 89.768 87.418 90 98.3848L70.002 98.8066C69.8554 91.8809 67.8168 86.9222 65.1562 83.2734C61.2058 77.8558 54.3288 74.445 46.7607 74.0303C39.2025 73.6161 32.2643 76.2486 28.0254 81.1914C23.1185 86.9132 21.241 94.2398 21 98.7393V190H0V54H21V61.0078Z',
  'M102 54H123V190H102V54Z',
  'M157 72.8574C169.211 61.1759 185.767 54 204 54C241.555 54 272 84.4446 272 122C272 159.555 241.555 190 204 190C185.767 190 169.211 182.823 157 171.142V250H136V54H157V72.8574ZM204 75C178.043 75 157 96.0426 157 122C157 147.957 178.043 169 204 169C229.957 169 251 147.957 251 122C251 96.0426 229.957 75 204 75Z',
  'M305 72.8574C317.211 61.1759 333.767 54 352 54C389.555 54 420 84.4446 420 122C420 159.555 389.555 190 352 190C333.767 190 317.211 182.823 305 171.142V250H284V54H305V72.8574ZM352 75C326.043 75 305 96.0426 305 122C305 147.957 326.043 169 352 169C377.957 169 399 147.957 399 122C399 96.0426 377.957 75 352 75Z',
  'M433 0H454V190H433V0Z',
];

/**
 * Official Rippl wordmark. Geometry matches public/brand/ripplLogo*.svg.
 * `redDot` switches the tip square to Stolt red (ripplLogoRedDot).
 */
@Component({
  selector: 'app-wordmark',
  standalone: true,
  template: `
    <svg
      class="wordmark"
      viewBox="0 0 488 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Rippl"
    >
      @for (d of letters; track $index) {
        <path fill="currentColor" [attr.d]="d" />
      }
      <rect
        class="wordmark-dot"
        [attr.fill]="redDot() ? 'var(--site-dot)' : 'currentColor'"
        x="467"
        y="169"
        width="21"
        height="21"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 0;
        color: inherit;
      }

      .wordmark {
        display: block;
        height: 1em;
        width: auto;
        overflow: visible;
      }
    `,
  ],
})
export class Wordmark {
  /** When true, the tip square is Stolt red (default for site chrome). */
  readonly redDot = input(true);
  readonly letters = WORDMARK_LETTERS;
}
