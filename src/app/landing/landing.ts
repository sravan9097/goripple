import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TILES } from '../content';
import { HeroGrid } from '../hero-grid/hero-grid';
import { Story } from '../story/story';

/**
 * The landing route is the scroll story. The tile grid now lives only behind
 * the corner menu (`?menu`), where every tile still leads to its own page.
 */
@Component({
  selector: 'app-landing',
  imports: [HeroGrid, RouterLink, Story],
  template: `
    <!--
      The grid tiles only take focus once they have flown into place, so the
      chapters also live here as plain links that surface on the first Tab.
    -->
    <nav class="skip-nav" aria-label="Chapters">
      @for (tile of tiles; track tile.id) {
        <a class="skip-link" [routerLink]="'/' + tile.id">Skip to {{ tile.title }}</a>
      }
    </nav>

    @if (fromMenu()) {
      <app-hero-grid [returnMode]="true" (jumpTo)="open($event)" (closeMenu)="back()" />
    } @else {
      <app-story />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .skip-link {
      position: fixed;
      left: -999px;
      top: 16px;
      z-index: 200;
      padding: 12px 18px;
      background: var(--site-ink);
      color: #fff;
      text-decoration: none;
    }

    .skip-link:focus-visible {
      left: 16px;
    }
  `,
})
export class Landing {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly tiles = TILES;
  readonly fromMenu = toSignal(
    this.route.queryParamMap.pipe(map((query) => query.has('menu'))),
    { initialValue: this.route.snapshot.queryParamMap.has('menu') },
  );

  open(id: string): void {
    void this.router.navigate([id]);
  }

  /** The corner menu pushed this grid on top of a section, so close returns there. */
  back(): void {
    if (history.length > 1) this.location.back();
    else void this.router.navigateByUrl('/');
  }
}
