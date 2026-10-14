import { gsap, prefersFinePointer, prefersReducedMotion, ScrollTrigger } from './motion.js';
import { onLenisScroll, startScroll, stopScroll } from './smooth.js';
import { clamp } from './utils.js';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = nav.querySelector('.nav-toggle');
  const menu = document.querySelector('#nav-menu');
  const cta = nav.querySelector('.nav-cta');
  const reduced = prefersReducedMotion();
  const fine = prefersFinePointer();
  let open = false;
  let hidden = false;
  let enabled = false;

  function setHidden(next) {
    if (next === hidden || open) return;
    hidden = next;
    gsap.to(nav, {
      yPercent: next ? -100 : 0,
      duration: reduced ? 0 : 0.45,
      ease: 'koth',
      overwrite: 'auto',
    });
    if (next) nav.setAttribute('inert', '');
    else nav.removeAttribute('inert');
  }

  function trap(event) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = [toggle, ...menu.querySelectorAll(FOCUSABLE)];
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openMenu() {
    if (open) return;
    open = true;
    hidden = false;
    gsap.set(nav, { yPercent: 0 });
    nav.removeAttribute('inert');
    nav.classList.add('is-menu-open');
    menu.classList.add('is-open');
    menu.removeAttribute('inert');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.sr-only').textContent = 'Fechar menu';
    stopScroll();
    const links = menu.querySelectorAll('a');
    if (reduced) {
      gsap.set(links, { y: 0, opacity: 1 });
    } else {
      gsap.fromTo(links, { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'koth',
        stagger: 0.06,
        overwrite: true,
      });
    }
    window.addEventListener('keydown', trap);
    const first = menu.querySelector('a');
    first?.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    nav.classList.remove('is-menu-open');
    menu.classList.remove('is-open');
    menu.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menu';
    window.removeEventListener('keydown', trap);
    toggle.focus();
    if (enabled) startScroll();
  }

  toggle.addEventListener('click', () => {
    if (open) close();
    else openMenu();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  if (fine && !reduced && cta) {
    const xTo = gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3.out' });
    cta.addEventListener('pointermove', (event) => {
      const rect = cta.getBoundingClientRect();
      const rx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ry = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      xTo(clamp(rx * 6, -6, 6));
      yTo(clamp(ry * 6, -6, 6));
    });
    cta.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  }

  ScrollTrigger.create({
    trigger: '#projetos',
    start: 'top 80px',
    onEnter: () => {
      nav.dataset.theme = 'paper';
    },
    onLeaveBack: () => {
      nav.dataset.theme = 'dark';
    },
  });

  onLenisScroll((instance) => {
    if (!enabled || open) return;
    if (instance.scroll < 120) {
      setHidden(false);
      return;
    }
    if (instance.direction === 1) setHidden(true);
    else if (instance.direction === -1) setHidden(false);
  });

  return {
    element: nav,
    isOpen: () => open,
    close,
    enable() {
      enabled = true;
      gsap.set(nav, { yPercent: 0 });
    },
    setTheme(theme) {
      nav.dataset.theme = theme;
    },
  };
}
