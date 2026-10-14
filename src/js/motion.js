import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

/** Swap the preloader microtext to Manrope 600 uppercase when false. */
export const USE_MONO = true;

/** Multiplies the handoff timeline. 1 keeps the timings in the brief. */
export const MASTER_TIME_SCALE = 1;

export const EASE = 'koth';

let ready = false;

export function initMotion() {
  if (ready) return;
  CustomEase.create('koth', '0.22,1,0.36,1');
  if (!USE_MONO) document.documentElement.dataset.mono = 'off';
  ready = true;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

export function isFullPreloader() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('preloader') === 'full') return true;
  try {
    return window.sessionStorage.getItem('koth:preloaded') !== '1';
  } catch {
    return true;
  }
}

export function preloaderMinMs() {
  return isFullPreloader() ? 2400 : 900;
}

export function markPreloaded() {
  try {
    window.sessionStorage.setItem('koth:preloaded', '1');
  } catch {
    /* private mode */
  }
}

export function kothEase(amount) {
  return gsap.parseEase('koth')(amount);
}

export { gsap, ScrollTrigger, SplitText };
