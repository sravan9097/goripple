// @ts-nocheck
// External libraries loaded via CDN in the original snippet. Add these to your
// host HTML (e.g. public/index.html) or install the npm equivalents:
//   https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js
//   https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js
//   https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js

// Note: vanilla JS DOM manipulation is preserved as-is inside ngAfterViewInit().
// For idiomatic Angular, replace document.getElementById() with @ViewChild() refs
// and move state into component properties with two-way binding.
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-threejs-scroll-text-particles',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="txg-top"><p>Scroll ↓ to form the word</p></section>
    <section class="txg-stage" id="txgStage">
      <canvas id="txgCanvas"></canvas>
    </section>
    <section class="txg-bottom"><p>Every particle knew its letter.</p></section>
  `,
  styles: [`
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#04060e;color:#fff;font-family:system-ui,-apple-system,sans-serif}
    .txg-top,.txg-bottom{min-height:70vh;display:flex;justify-content:center;align-items:center;color:#6f7aa0;font-size:15px;letter-spacing:.08em;text-transform:uppercase}
    .txg-stage{height:100vh;position:relative;overflow:hidden;background:radial-gradient(60% 60% at 50% 45%,#0c1226,#04060e)}
    #txgCanvas{display:block;width:100%;height:100%}
  `]
})
export class ThreejsScrollTextParticlesComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const canvas = document.getElementById('txgCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 13);
    
    // Sample a word drawn to an offscreen 2D canvas: every lit pixel becomes a
    // target position for one particle. This turns any text or logo into a
    // particle target field with no font loader or 3D text geometry needed.
    const WORD = 'HELLO';
    const tc = document.createElement('canvas');
    tc.width = 360; tc.height = 120;
    const ctx = tc.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 96px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(WORD, tc.width / 2, tc.height / 2 + 4);
    const img = ctx.getImageData(0, 0, tc.width, tc.height).data;
    
    const targets = [];
    const step = 3; // sampling stride — smaller = denser text
    for (let y = 0; y < tc.height; y += step) {
      for (let x = 0; x < tc.width; x += step) {
        if (img[(y * tc.width + x) * 4 + 3] > 128) {
          targets.push(
            (x - tc.width / 2) * 0.035,
            -(y - tc.height / 2) * 0.035,
            (Math.random() - 0.5) * 0.4
          );
        }
      }
    }
    const COUNT = targets.length / 3;
    
    const scattered = new Float32Array(COUNT * 3);
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      scattered[i3]     = (Math.random() - 0.5) * 22;
      scattered[i3 + 1] = (Math.random() - 0.5) * 14;
      scattered[i3 + 2] = (Math.random() - 0.5) * 10;
      const c = new THREE.Color().setHSL(0.55 + (targets[i3] * 0.03), 0.8, 0.62);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
    }
    positions.set(scattered);
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.08, vertexColors: true, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(points);
    
    gsap.registerPlugin(ScrollTrigger);
    
    const state = { p: 0 };
    gsap.to(state, {
      p: 1, ease: 'none',
      scrollTrigger: {
        trigger: '#txgStage', start: 'top top', end: '+=380%', scrub: 0.5, pin: true,
      },
    });
    
    const posAttr = geo.getAttribute('position');
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    
    function animate() {
      requestAnimationFrame(animate);
      const p = state.p * state.p * (3 - 2 * state.p);
      const arr = posAttr.array;
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        arr[i3]     = scattered[i3]     + (targets[i3]     - scattered[i3])     * p;
        arr[i3 + 1] = scattered[i3 + 1] + (targets[i3 + 1] - scattered[i3 + 1]) * p;
        arr[i3 + 2] = scattered[i3 + 2] + (targets[i3 + 2] - scattered[i3 + 2]) * p;
      }
      posAttr.needsUpdate = true;
      // A gentle sway once formed, so the word floats rather than sits rigid.
      points.rotation.y = Math.sin(performance.now() * 0.0004) * 0.12 * p;
      renderer.render(scene, camera);
    }
    
    resize();
    window.addEventListener('resize', resize);
    animate();

    // Bind inline-handler functions to the component so the template can call them
    Object.assign(this, { resize, animate });
  }
}