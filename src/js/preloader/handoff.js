import { gsap, MASTER_TIME_SCALE, markPreloaded, ScrollTrigger } from '../motion.js';
import { startScroll } from '../smooth.js';
import { unionRect } from '../utils.js';

function revealApp() {
  document.documentElement.dataset.state = 'revealing';
}

function finish({ hero, nav }) {
  document.documentElement.dataset.state = 'ready';
  const app = document.getElementById('app');
  app.inert = false;
  app.removeAttribute('aria-hidden');
  markPreloaded();
  document.getElementById('preloader')?.remove();
  nav.enable();
  startScroll();
  hero.mountCurtain();
  hero.startIdle();
  hero.startNudge();
  ScrollTrigger.refresh();
  window.scrollTo(0, 0);
  const skip = document.querySelector('.skip-link');
  if (skip) {
    try {
      skip.focus({ preventScroll: true });
    } catch {
      skip.focus({ preventScroll: true });
    }
  }
}

function flightTo(plK, target) {
  const from = unionRect(plK.querySelectorAll('path')) || plK.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from?.width || !to.width) return null;
  const scale = to.width / from.width;
  const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
  const x = (Number(gsap.getProperty(plK, 'x')) || 0) + dx;
  const y = (Number(gsap.getProperty(plK, 'y')) || 0) + dy;
  return { x, y, scale };
}

export function playHandoff({ root, hero, nav, full, reduced }) {
  const preloader = root;
  const bg = root.querySelector('[data-pl-bg]');
  const meta = root.querySelectorAll('[data-pl-meta]');
  const plK = root.querySelector('[data-pl-k]');
  const { elements } = hero;
  const liveLayers = hero.layers.filter((layer) => getComputedStyle(layer.el).display !== 'none');

  if (reduced || !full) {
    hero.setFinal();
    gsap.set(nav.element, { yPercent: 0 });
    revealApp();
    gsap.to(preloader, {
      opacity: 0,
      duration: reduced ? 0.6 : 0.45,
      ease: 'power2.out',
      delay: full ? 0 : 0.12,
      onComplete: () => finish({ hero, nav }),
    });
    return;
  }

  hero.setIntroFrom();
  gsap.set(nav.element, { yPercent: -100 });
  gsap.set(plK, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

  const tl = gsap.timeline({
    onComplete: () => finish({ hero, nav }),
  });
  tl.timeScale(1 / MASTER_TIME_SCALE);

  tl.to(meta, { y: -8, opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.35);
  tl.call(() => revealApp(), null, 0.9);

  tl.add(() => {
    const fit = flightTo(plK, elements.front);
    if (!fit) return;
    gsap.to(plK, {
      x: fit.x,
      y: fit.y,
      scale: fit.scale,
      xPercent: -50,
      yPercent: -50,
      duration: 1.25 * MASTER_TIME_SCALE,
      ease: 'power4.inOut',
      overwrite: 'auto',
    });
  }, 0.7);

  tl.to(bg, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.95);
  tl.to(elements.bgScroll, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' }, 0.95);

  tl.set(preloader, { pointerEvents: 'none' }, 1.9);
  tl.add(() => {
    gsap.set(plK, { opacity: 0 });
    let depth = 0;
    liveLayers.forEach((layer) => {
      gsap.set(layer.el, { opacity: 1 });
      if (layer.layer === '0') {
        layer.model.x = 0;
        layer.model.y = 0;
        layer.model.rot = 0;
        hero.applyLayer(layer);
        return;
      }
      layer.model.x = 0;
      layer.model.y = 0;
      layer.model.rot = 0;
      hero.applyLayer(layer);
      gsap.to(layer.model, {
        x: layer.ox,
        y: layer.oy,
        duration: 0.9 * MASTER_TIME_SCALE,
        delay: depth * 0.08 * MASTER_TIME_SCALE,
        ease: 'expo.out',
        onUpdate: () => hero.applyLayer(layer),
      });
      depth += 1;
    });
  }, 1.9);

  const lines = hero.splitTitle();
  if (lines.length) {
    tl.to(lines, {
      yPercent: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.1,
    }, 1.95);
  }

  tl.to(nav.element, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 2.1);
  tl.to(elements.sub, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 2.2);
  tl.to(elements.actions, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'expo.out',
    stagger: 0.08,
  }, 2.2);
  tl.to(elements.spoiler, { y: 0, duration: 0.8, ease: 'expo.out' }, 2.5);
}
