import gsap from 'gsap';
import { kothEase, prefersFinePointer } from '../motion.js';
import { clamp01, smoothstep } from '../utils.js';

const MODULES = [
  { id: 'superior', x: 18, y: -14, rot: 18, scale: 0.85, delay: 0, strength: 1 },
  { id: 'esquerdo', x: -20, y: 6, rot: -14, scale: 1.1, delay: 0.14, strength: 1.4 },
  { id: 'inferior', x: 10, y: 20, rot: 24, scale: 0.8, delay: 0.28, strength: 0.8 },
];

const FLOAT_AMP = [10, 14, 8];
const MAGNET_CAP = 56;

function floatNoise(index, time) {
  const amp = FLOAT_AMP[index];
  return {
    x: Math.sin(time * 0.85 + index * 1.7) * amp + Math.sin(time * 1.65 + index) * amp * 0.35,
    y: Math.cos(time * 0.62 + index * 2.15) * amp * 0.9,
    r: Math.sin(time * 0.5 + index * 2.4) * 3,
  };
}

export function createAssembly(root, { reduced }) {
  const element = root.querySelector('[data-pl-k]');
  const fine = prefersFinePointer();
  const pointer = { x: 0, y: 0, active: false };
  let locked = false;
  let magnetMix = 1;

  const modules = MODULES.map((config) => {
    const el = root.querySelector(`[data-module="${config.id}"]`);
    const path = el.querySelector('path');
    return { ...config, el, path, origin: { x: 0, y: 0 } };
  });

  const quick = {
    x: modules.map((mod) => gsap.quickTo(mod.el, 'x', { duration: 0.9, ease: 'power3.out' })),
    y: modules.map((mod) => gsap.quickTo(mod.el, 'y', { duration: 0.9, ease: 'power3.out' })),
    r: modules.map((mod) => gsap.quickTo(mod.el, 'rotation', { duration: 0.9, ease: 'power3.out' })),
    sx: modules.map((mod) => gsap.quickTo(mod.el, 'scaleX', { duration: 0.6, ease: 'power3.out' })),
    sy: modules.map((mod) => gsap.quickTo(mod.el, 'scaleY', { duration: 0.6, ease: 'power3.out' })),
  };

  function vmin() {
    return Math.min(window.innerWidth, window.innerHeight) / 100;
  }

  function measureOrigins() {
    modules.forEach((mod) => {
      const rect = mod.path.getBoundingClientRect();
      const x = Number(gsap.getProperty(mod.el, 'x')) || 0;
      const y = Number(gsap.getProperty(mod.el, 'y')) || 0;
      mod.origin = {
        x: rect.left + rect.width / 2 - x,
        y: rect.top + rect.height / 2 - y,
      };
    });
  }

  function placePivot(mod) {
    gsap.set(mod.el, { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' });
    const path = mod.path.getBoundingClientRect();
    const box = mod.el.getBoundingClientRect();
    const ox = path.left + path.width / 2 - box.left;
    const oy = path.top + path.height / 2 - box.top;
    gsap.set(mod.el, { transformOrigin: `${ox}px ${oy}px` });
  }

  gsap.set(element, { x: 0, y: 0, xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

  if (!reduced) {
    modules.forEach((mod) => {
      placePivot(mod);
      const unit = vmin();
      gsap.set(mod.el, {
        x: mod.x * unit,
        y: mod.y * unit,
        rotation: mod.rot,
        scaleX: mod.scale,
        scaleY: mod.scale,
      });
    });
    measureOrigins();
  } else {
    modules.forEach((mod) => {
      gsap.set(mod.el, { x: 0, y: 0, rotation: 0, scale: 1, clearProps: 'transform' });
    });
  }

  function onPointerMove(event) {
    if (reduced || locked) return;
    if (!fine && event.pointerType !== 'touch') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function onPointerUp(event) {
    if (!fine || event.pointerType === 'touch') pointer.active = false;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });

  function update(displayed, time) {
    if (reduced || locked) return;
    const unit = vmin();
    const radius = 0.42 * Math.min(window.innerWidth, window.innerHeight);
    modules.forEach((mod, index) => {
      const progress = clamp01((displayed - mod.delay) / (1 - mod.delay - 0.06));
      const eased = kothEase(progress);
      const idle = floatNoise(index, time);
      const base = {
        x: mod.x * unit * (1 - eased),
        y: mod.y * unit * (1 - eased),
      };
      const float = {
        x: idle.x * (1 - eased),
        y: idle.y * (1 - eased),
        r: idle.r * (1 - eased),
      };
      const restX = mod.origin.x + base.x + float.x;
      const restY = mod.origin.y + base.y + float.y;
      let magnetX = 0;
      let magnetY = 0;
      if (pointer.active && magnetMix > 0) {
        const dx = pointer.x - restX;
        const dy = pointer.y - restY;
        const dist = Math.hypot(dx, dy);
        const falloff = 1 - smoothstep(0, radius, dist);
        const influence = mod.strength * falloff * (1 - 0.85 * eased) * magnetMix;
        magnetX = dx * influence;
        magnetY = dy * influence;
        const mag = Math.hypot(magnetX, magnetY);
        if (mag > MAGNET_CAP) {
          magnetX = (magnetX / mag) * MAGNET_CAP;
          magnetY = (magnetY / mag) * MAGNET_CAP;
        }
      }
      const scale = mod.scale + (1 - mod.scale) * eased;
      quick.x[index](base.x + float.x + magnetX);
      quick.y[index](base.y + float.y + magnetY);
      quick.r[index](mod.rot * (1 - eased) + float.r + magnetX * 0.02);
      quick.sx[index](scale);
      quick.sy[index](scale);
    });
  }

  function lock() {
    if (locked) return;
    locked = true;
    pointer.active = false;
    if (reduced) return;
    gsap.to({ mix: 1 }, {
      mix: 0,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate() {
        magnetMix = this.targets()[0].mix;
      },
    });
    modules.forEach((mod, index) => {
      gsap.to(mod.el, {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.5,
        delay: index * 0.06,
        ease: 'koth',
        overwrite: true,
      });
    });
  }

  function destroy() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  return { element, update, lock, destroy, measureOrigins };
}
