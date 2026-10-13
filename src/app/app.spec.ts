import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('routes every tile to its own page', () => {
    const paths = routes.map((r) => r.path);
    for (const id of ['north-star', 'what', 'how', 'foundations', 'components', 'patterns', 'who', 'resources']) {
      expect(paths).withContext(`route for ${id}`).toContain(id);
    }
  });
});
