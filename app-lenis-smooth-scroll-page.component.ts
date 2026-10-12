// @ts-nocheck
// External libraries loaded via CDN in the original snippet. Add these to your
// host HTML (e.g. public/index.html) or install the npm equivalents:
//   https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js

// Note: vanilla JS DOM manipulation is preserved as-is inside ngAfterViewInit().
// For idiomatic Angular, replace document.getElementById() with @ViewChild() refs
// and move state into component properties with two-way binding.
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lenis-smooth-scroll-page',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="lss-progress"><i id="lssBar"></i></div>
    
    <nav class="lss-nav">
      <b>Lenis</b>
      <div class="lss-links">
        <a href="#lssOne" class="lss-link">Inertia</a>
        <a href="#lssTwo" class="lss-link">Parallax</a>
        <a href="#lssThree" class="lss-link">Anchors</a>
      </div>
      <button class="lss-toggle" id="lssToggle">Smooth: on</button>
    </nav>
    
    <main>
      <section class="lss-hero">
        <div class="lss-inner">
          <span class="lss-tag">lenis · virtual scroll</span>
          <h1 data-parallax="-0.18">Scroll with weight.</h1>
          <p data-parallax="-0.08">Lenis intercepts the wheel and eases the page toward its target, so momentum carries instead of snapping.</p>
          <div class="lss-metrics">
            <div><b id="lssPos">0</b><small>scroll px</small></div>
            <div><b id="lssVel">0.0</b><small>velocity</small></div>
            <div><b id="lssPct">0%</b><small>progress</small></div>
          </div>
        </div>
      </section>
    
      <section class="lss-band" id="lssOne">
        <h2 data-parallax="-0.12">Inertia, not animation</h2>
        <p>Every frame Lenis moves the page a fraction of the remaining distance to the target. That exponential approach is why it decelerates naturally rather than following a fixed curve.</p>
      </section>
    
      <section class="lss-band alt" id="lssTwo">
        <h2 data-parallax="-0.12">Parallax for free</h2>
        <p>Because scroll position is emitted on every frame, layers can be offset by a multiplier of it. The heading above is drifting against the page as you read this.</p>
      </section>
    
      <section class="lss-band" id="lssThree">
        <h2 data-parallax="-0.12">Anchors that glide</h2>
        <p>Native anchor jumps would teleport past all of this. Lenis intercepts them and eases to the target instead — try the navigation links.</p>
      </section>
    
      <footer class="lss-foot">End of the page. Scroll back up.</footer>
    </main>
  `,
  styles: [`
    *{box-sizing:border-box;margin:0;padding:0}
    /* Lenis drives scrolling itself; native smooth behavior fights it. */
    html.lenis,html.lenis body{height:auto}
    .lenis.lenis-smooth{scroll-behavior:auto!important}
    html{scroll-behavior:auto}
    
    body{font-family:system-ui,-apple-system,sans-serif;background:#080a16;color:#fff}
    
    .lss-progress{position:fixed;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,.08);z-index:40}
    .lss-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#818cf8,#22d3ee)}
    
    .lss-nav{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:40;display:flex;align-items:center;gap:18px;padding:9px 9px 9px 18px;border-radius:99px;background:rgba(15,19,38,.72);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1)}
    .lss-nav b{font-size:13.5px;letter-spacing:-.01em}
    .lss-links{display:flex;gap:14px}
    .lss-link{font-size:12.5px;color:#98a2c6;text-decoration:none;transition:color .16s}
    .lss-link:hover{color:#fff}
    .lss-toggle{padding:7px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#dbe3fb;font:600 11.5px system-ui;cursor:pointer;white-space:nowrap}
    @media (max-width:560px){.lss-links{display:none}}
    
    .lss-hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:96px 24px 48px;background:radial-gradient(110% 70% at 50% 0%,rgba(129,140,248,.2),transparent 62%)}
    .lss-inner{max-width:660px;text-align:center}
    .lss-tag{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7dd3fc;background:rgba(125,211,252,.11);border:1px solid rgba(125,211,252,.3);padding:5px 12px;border-radius:99px;margin-bottom:22px}
    .lss-hero h1{font-size:clamp(34px,8vw,74px);font-weight:800;letter-spacing:-.035em;line-height:1.02}
    .lss-hero p{font-size:clamp(14px,2.4vw,17px);color:#96a0c4;margin-top:18px;line-height:1.7}
    
    .lss-metrics{display:flex;gap:14px;justify-content:center;margin-top:38px;flex-wrap:wrap}
    .lss-metrics div{min-width:104px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09)}
    .lss-metrics b{display:block;font-size:20px;font-variant-numeric:tabular-nums}
    .lss-metrics small{font-size:10.5px;color:#7f89ad;letter-spacing:.06em;text-transform:uppercase}
    
    .lss-band{min-height:76vh;display:flex;flex-direction:column;justify-content:center;padding:80px 24px;max-width:720px;margin:0 auto}
    .lss-band.alt{background:linear-gradient(180deg,transparent,rgba(34,211,238,.05),transparent)}
    .lss-band h2{font-size:clamp(24px,4.6vw,40px);font-weight:800;letter-spacing:-.025em}
    .lss-band p{font-size:clamp(14px,2.3vw,16.5px);color:#96a0c4;margin-top:14px;line-height:1.8;max-width:560px}
    
    .lss-foot{text-align:center;padding:80px 24px 120px;color:#5f688a;font-size:13px}
  `]
})
export class LenisSmoothScrollPageComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    var lenis = new Lenis({
      // Lower = snappier. 1.15 keeps momentum readable without feeling laggy.
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6
    });
    
    // Lenis does not run its own loop — you drive it, which is what lets it share
    // one rAF with GSAP, Three.js or anything else on the page.
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    var bar = document.getElementById('lssBar');
    var posEl = document.getElementById('lssPos');
    var velEl = document.getElementById('lssVel');
    var pctEl = document.getElementById('lssPct');
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    
    lenis.on('scroll', function (e) {
      var pct = Math.max(0, Math.min(1, e.progress || 0));
      bar.style.width = (pct * 100) + '%';
      posEl.textContent = Math.round(e.scroll);
      velEl.textContent = e.velocity.toFixed(1);
      pctEl.textContent = Math.round(pct * 100) + '%';
    
      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var speed = parseFloat(el.dataset.parallax);
        el.style.transform = 'translate3d(0,' + (e.scroll * speed) + 'px,0)';
      }
    });
    
    document.querySelectorAll('.lss-link').forEach(function (link) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        lenis.scrollTo(link.getAttribute('href'), { offset: -70, duration: 1.4 });
      });
    });
    
    var on = true;
    document.getElementById('lssToggle').addEventListener('click', function () {
      on = !on;
      if (on) lenis.start(); else lenis.stop();
      this.textContent = 'Smooth: ' + (on ? 'on' : 'off');
    });

    // Bind inline-handler functions to the component so the template can call them
    Object.assign(this, { raf });
  }
}