import './styles/main.css';
import { initHero } from './js/hero.js';
import { initMotion } from './js/motion.js';
import { initNav } from './js/nav.js';
import { initPreloader } from './js/preloader/index.js';
import { bindAnchors, initSmooth } from './js/smooth.js';

const app = document.getElementById('app');
app.inert = true;
app.setAttribute('aria-hidden', 'true');

initMotion();
window.addEventListener('keydown', () => {
  document.documentElement.dataset.keyboard = 'true';
}, { once: true });
initSmooth();
const hero = initHero();
const nav = initNav();
bindAnchors(() => nav);

initPreloader({ hero, nav }).catch((error) => {
  console.warn('[koth] preloader interrompido', error);
  document.documentElement.dataset.state = 'ready';
  app.inert = false;
  app.removeAttribute('aria-hidden');
  document.getElementById('preloader')?.remove();
});
