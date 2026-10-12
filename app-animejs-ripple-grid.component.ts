// @ts-nocheck
// External libraries loaded via CDN in the original snippet. Add these to your
// host HTML (e.g. public/index.html) or install the npm equivalents:
//   https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js

// Note: vanilla JS DOM manipulation is preserved as-is inside ngAfterViewInit().
// For idiomatic Angular, replace document.getElementById() with @ViewChild() refs
// and move state into component properties with two-way binding.
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animejs-ripple-grid',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="arg-stage">
      <div class="arg-head">
        <span class="arg-tag">anime.js · stagger</span>
        <h2>Ripple Grid</h2>
        <p>Click any tile — the wave radiates outward from exactly where you hit.</p>
      </div>
      <div class="arg-grid" id="argGrid"></div>
      <div class="arg-modes">
        <button class="arg-btn is-on" data-from="index">From click</button>
        <button class="arg-btn" data-from="center">Center</button>
        <button class="arg-btn" data-from="first">First</button>
        <button class="arg-btn" data-from="last">Last</button>
      </div>
    </div>
  `,
  styles: [`
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:radial-gradient(120% 100% at 50% 0%,#161d38,#080a14);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .arg-stage{width:min(660px,94vw);display:flex;flex-direction:column;align-items:center;gap:20px}
    .arg-head{text-align:center}
    .arg-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#818cf8;background:rgba(129,140,248,.12);border:1px solid rgba(129,140,248,.3);padding:5px 12px;border-radius:99px;margin-bottom:12px}
    .arg-head h2{font-size:clamp(26px,5vw,38px);font-weight:800;letter-spacing:-.02em}
    .arg-head p{font-size:14px;color:#8e97b8;margin-top:7px}
    
    .arg-grid{display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:6px;width:100%;padding:20px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 60px -24px rgba(0,0,0,.8);cursor:crosshair}
    .arg-tile{aspect-ratio:1;background:#1e2440;border-radius:4px;will-change:transform;transform-origin:center}
    
    .arg-modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    .arg-btn{padding:9px 18px;border-radius:99px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#c3cbe8;font:600 12.5px system-ui;cursor:pointer;transition:background .18s,border-color .18s,color .18s}
    .arg-btn:hover{background:rgba(255,255,255,.09);color:#fff}
    .arg-btn.is-on{border-color:#818cf8;background:rgba(129,140,248,.16);color:#c7d0ff}
  `]
})
export class AnimejsRippleGridComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    var COLS = 16, ROWS = 10;
    var grid = document.getElementById('argGrid');
    grid.style.setProperty('--cols', COLS);
    
    var frag = document.createDocumentFragment();
    for (var i = 0; i < COLS * ROWS; i++) {
      var tile = document.createElement('span');
      tile.className = 'arg-tile';
      frag.appendChild(tile);
    }
    grid.appendChild(frag);
    
    var tiles = grid.querySelectorAll('.arg-tile');
    var mode = 'index';
    
    function ripple(from) {
      // Kill in-flight tweens first, or a fast second click leaves tiles mid-scale forever.
      anime.remove(tiles);
      anime({
        targets: tiles,
        scale: [
          { value: 0.18, duration: 380, easing: 'easeOutSine' },
          { value: 1, duration: 1150, easing: 'easeInOutQuad' }
        ],
        backgroundColor: [
          { value: '#818cf8', duration: 380 },
          { value: '#1e2440', duration: 1150 }
        ],
        borderRadius: [
          { value: '50%', duration: 380 },
          { value: '4px', duration: 1150 }
        ],
        delay: anime.stagger(58, { grid: [COLS, ROWS], from: from })
      });
    }
    
    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.arg-tile');
      if (!tile) return;
      ripple(mode === 'index' ? Array.prototype.indexOf.call(tiles, tile) : mode);
    });
    
    document.querySelectorAll('.arg-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.arg-btn').forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        mode = btn.dataset.from;
        if (mode !== 'index') ripple(mode);
      });
    });
    
    ripple('center');

    // Bind inline-handler functions to the component so the template can call them
    Object.assign(this, { ripple });
  }
}