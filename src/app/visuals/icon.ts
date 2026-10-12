import { Component, input } from '@angular/core';

/** Small stroke icons for the principle and foundation cards. */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      @switch (name()) {
        @case ('clarity') {
          <circle cx="16" cy="16" r="3.2" stroke="currentColor" stroke-width="1.6" />
          <path d="M4 16s4.2-7 12-7 12 7 12 7-4.2 7-12 7S4 16 4 16z" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('consistency') {
          <rect x="5" y="9" width="13" height="13" rx="1.5" stroke="currentColor" stroke-width="1.6" />
          <rect x="14" y="10" width="13" height="13" rx="1.5" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('humanity') {
          <circle cx="16" cy="10" r="3.4" stroke="currentColor" stroke-width="1.6" />
          <path d="M8 26c1.1-5 3.8-7.5 8-7.5s6.9 2.5 8 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        }
        @case ('access') {
          <circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1.6" />
          <circle cx="16" cy="12" r="1.7" fill="currentColor" />
          <path d="M16 14.2V20M12.5 17h7M13.2 25.5 16 20l2.8 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('efficiency') {
          <path d="M6 16h18M18 10l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('scale') {
          <circle cx="16" cy="16" r="2" fill="currentColor" />
          <circle cx="16" cy="16" r="6.5" stroke="currentColor" stroke-width="1.6" />
          <circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('colour') {
          <circle cx="16" cy="16" r="9" stroke="currentColor" stroke-width="1.6" />
          <path d="M16 7a9 9 0 0 1 0 18" fill="currentColor" />
        }
        @case ('type') {
          <path d="M7 25 16 7l9 18M11 18.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('space') {
          <path d="M7 8v16M25 8v16M10 16h12M10 16l3-3M10 16l3 3M22 16l-3-3M22 16l-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('grid') {
          <path d="M6 6h8v8H6zM18 6h8v8h-8zM6 18h8v8H6zM18 18h8v8h-8z" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('layout') {
          <rect x="5" y="6" width="22" height="6" stroke="currentColor" stroke-width="1.6" />
          <rect x="5" y="16" width="10" height="10" stroke="currentColor" stroke-width="1.6" />
          <rect x="17" y="16" width="10" height="10" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('elevation') {
          <rect x="9" y="11" width="16" height="13" stroke="currentColor" stroke-width="1.6" />
          <rect x="6" y="7" width="16" height="13" stroke="currentColor" stroke-width="1.6" />
        }
        @case ('pattern') {
          <circle cx="8" cy="8" r="1.6" fill="currentColor" />
          <circle cx="16" cy="8" r="1.6" fill="currentColor" />
          <circle cx="24" cy="8" r="1.6" fill="currentColor" />
          <circle cx="8" cy="16" r="1.6" fill="currentColor" />
          <circle cx="16" cy="16" r="1.6" fill="currentColor" />
          <circle cx="24" cy="16" r="1.6" fill="currentColor" />
          <circle cx="8" cy="24" r="1.6" fill="currentColor" />
          <circle cx="16" cy="24" r="1.6" fill="currentColor" />
          <circle cx="24" cy="24" r="1.6" fill="currentColor" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-grid;
    }
    svg {
      width: 32px;
      height: 32px;
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
}
