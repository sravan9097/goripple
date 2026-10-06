// @ts-nocheck
// External libraries loaded via CDN in the original snippet. Add these to your
// host HTML (e.g. public/index.html) or install the npm equivalents:
//   https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js
//   https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js

// Note: vanilla JS DOM manipulation is preserved as-is inside ngAfterViewInit().
// For idiomatic Angular, replace document.getElementById() with @ViewChild() refs
// and move state into component properties with two-way binding.
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-word-wheel',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="sww-top"><p>Scroll ↓</p></section>
    <section class="sww-stage" id="swwStage">
      <h2 class="sww-line">
        <span>Built for</span>
        <span class="sww-wheel">
          <span class="sww-list" id="swwList">
            <em style="--wc:#818cf8">designers</em>
            <em style="--wc:#22d3ee">founders</em>
            <em style="--wc:#34d399">marketers</em>
            <em style="--wc:#f472b6">developers</em>
            <em style="--wc:#fbbf24">everyone</em>
          </span>
        </span>
      </h2>
      <p class="sww-sub">The scrollbar turns the wheel — one notch per scroll segment.</p>
    </section>
    <section class="sww-bottom"><p>Scroll up to spin the wheel back.</p></section>
  `,
  styles: [`
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#07080d;color:#fff}
    .sww-top,.sww-bottom{min-height:70vh;display:flex;justify-content:center;align-items:center;color:#8a90a8;font-size:15px;letter-spacing:.1em;text-transform:uppercase}
    .sww-stage{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;overflow:hidden;background:radial-gradient(75% 65% at 50% 45%,#111631,#07080d);text-align:center;padding:0 20px}
    .sww-line{display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:0 .35em;font-size:clamp(30px,6.4vw,64px);font-weight:800;letter-spacing:-.02em}
    .sww-wheel{position:relative;display:inline-block;height:1.24em;overflow:hidden;vertical-align:bottom}
    .sww-wheel::before,.sww-wheel::after{content:'';position:absolute;left:0;right:0;height:.28em;z-index:2;pointer-events:none}
    .sww-wheel::before{top:0;background:linear-gradient(180deg,#0b1026,transparent)}
    .sww-wheel::after{bottom:0;background:linear-gradient(0deg,#0b1026,transparent)}
    .sww-list{display:flex;flex-direction:column;will-change:transform}
    .sww-list em{font-style:normal;height:1.24em;line-height:1.24em;color:var(--wc);white-space:nowrap;text-align:left}
    .sww-sub{color:#8a90a8;font-size:15px}
  `]
})
export class ScrollWordWheelComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    
    var list = document.getElementById('swwList');
    var words = list.children;
    var COUNT = words.length;
    
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#swwStage',
        start: 'top top',
        end: '+=' + (COUNT * 55) + '%',
        scrub: 0.35,
        pin: true
      }
    });
    
    // One notch per word: hold, then a quick snap to the next line.
    // yPercent moves by one word-height (100 / COUNT of the list) per notch.
    for (var i = 1; i < COUNT; i++) {
      tl.to(list, {
        yPercent: -(100 / COUNT) * i,
        duration: 0.35,
        ease: 'power2.inOut'
      }, i - 0.35);
    }
  }
}