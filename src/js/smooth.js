import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion.js';

let lenis;
const listeners = new Set();

export function initSmooth() {
  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    autoRaf: false,
    anchors: false,
    respectReducedMotion: true,
  });

  lenis.on('scroll', (instance) => {
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(instance));
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  if (prefersReducedMotion()) {
    lenis.options.lerp = 1;
  }

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function onLenisScroll(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function startScroll() {
  lenis?.start();
}

export function stopScroll() {
  lenis?.stop();
}

export function bindAnchors(getMenu) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const menu = getMenu?.();
    if (menu?.isOpen()) menu.close();
    if (hash === '#main') target.focus({ preventScroll: true });
    lenis?.scrollTo(target, { offset: 0 });
  });
}
