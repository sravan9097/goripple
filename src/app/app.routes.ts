import type { Routes } from '@angular/router';
import { TILES } from './content';
import { Landing } from './landing/landing';
import { SectionPage } from './section-page/section-page';

export const routes: Routes = [
  { path: '', component: Landing, title: 'Rippl. One drop. Every product.' },
  ...TILES.map((tile) => ({
    path: tile.id,
    component: SectionPage,
    title: `${tile.title} · Rippl.`,
  })),
  { path: '**', redirectTo: '' },
];
