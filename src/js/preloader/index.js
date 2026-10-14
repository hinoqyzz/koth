import { gsap, isFullPreloader, prefersReducedMotion, preloaderMinMs } from '../motion.js';
import { pad3 } from '../utils.js';
import { applyHeroSources, applyLqip, fetchWithProgress, getHeroAssets, pickHeroUrl } from '../assets.js';
import { createAssembly } from './assemble.js';
import { playHandoff } from './handoff.js';
import { createProgress } from './progress.js';

const FONT_FACES = [
  '500 16px "Space Grotesk Variable"',
  '700 16px "Space Grotesk Variable"',
  '400 16px "Manrope Variable"',
  '600 16px "Manrope Variable"',
  '400 16px "Space Mono"',
];

const STAGES = [
  { id: 'fonts', label: 'FONTES' },
  { id: 'image', label: 'IMAGENS' },
  { id: 'rest', label: 'MONTANDO' },
];

function withTimeout(promise, ms, label) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      console.warn(`[koth] ${label} excedeu ${ms}ms — seguindo com o que já carregou`);
      resolve();
    }, ms);
    promise.then(() => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    }, (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      console.warn(`[koth] ${label} falhou`, error);
      resolve();
    });
  });
}

async function loadFonts(onProgress) {
  let done = 0;
  await Promise.all(FONT_FACES.map(async (face) => {
    try {
      await document.fonts.load(face);
    } catch (error) {
      console.warn('[koth] fonte indisponível', face, error);
    }
    done += 1;
    onProgress(done / FONT_FACES.length);
  }));
  await document.fonts.ready;
  onProgress(1);
}

async function loadHero(onProgress) {
  const assets = getHeroAssets();
  if (assets.lqip) applyLqip(assets.lqip);
  if (!assets.hasImage) {
    onProgress(1);
    return;
  }
  const choice = pickHeroUrl(assets.formats);
  if (!choice) {
    onProgress(1);
    return;
  }
  try {
    const blob = await fetchWithProgress(choice.url, (value) => onProgress(Math.min(0.92, value)));
    const objectUrl = URL.createObjectURL(blob);
    const probe = new Image();
    probe.src = objectUrl;
    if (probe.decode) await probe.decode();
    URL.revokeObjectURL(objectUrl);
    applyHeroSources(assets.formats, choice.url);
    const img = document.querySelector('[data-hero-img]');
    if (img?.decode) await img.decode();
    onProgress(1);
  } catch (error) {
    console.warn('[koth] imagem do hero indisponível — placeholder permanece', error);
    onProgress(1);
  }
}

function stageLabel(tasks, displayed) {
  if (displayed >= 1) return 'PRONTO';
  if (tasks.fonts < 1) return STAGES[0].label;
  if (tasks.image < 1) return STAGES[1].label;
  return STAGES[2].label;
}

function doubleFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export function initPreloader({ hero, nav }) {
  const root = document.getElementById('preloader');
  const counter = root.querySelector('[data-counter]');
  const stage = root.querySelector('[data-stage]');
  const live = root.querySelector('[data-live]');
  const reduced = prefersReducedMotion();
  const full = isFullPreloader();
  const minMs = preloaderMinMs();
  let announced = -1;
  const marks = [25, 50, 75, 100];

  const assembly = createAssembly(root, { reduced });
  const progress = createProgress({
    minMs,
    onProgress(displayed, snapshot) {
      const pct = Math.round(displayed * 100);
      const label = `${pad3(pct)}%`;
      if (counter.textContent !== label) counter.textContent = label;
      const nextStage = stageLabel(snapshot.tasks, displayed);
      if (stage.textContent !== nextStage) stage.textContent = nextStage;
      const hit = marks.findIndex((mark, index) => index > announced && pct >= mark);
      if (hit !== -1) {
        announced = hit;
        live.textContent = `Carregamento em ${marks[hit]}%`;
      }
    },
  });

  const onTick = (time, deltaMs) => {
    progress.tick((deltaMs || 0) / 1000);
    assembly.update(progress.displayed, time);
  };
  gsap.ticker.add(onTick);

  const failsafe = window.setTimeout(() => {
    console.warn('[koth] preloader passou de 12s — seguindo com o que existe');
    progress.force();
  }, 12000);

  progress.setTask('js', 1);

  const fontsPromise = withTimeout(loadFonts((value) => progress.setTask('fonts', value)), 8000, 'fontes');
  const imagePromise = withTimeout(loadHero((value) => progress.setTask('image', value)), 8000, 'imagem');

  Promise.all([fontsPromise, imagePromise]).then(async () => {
    hero.ensureGap();
    await doubleFrame();
    progress.setTask('frame', 1);
  });

  return progress.ready.then(() => {
    window.clearTimeout(failsafe);
    gsap.ticker.remove(onTick);
    assembly.lock();
    playHandoff({ root, hero, nav, full, reduced });
    return new Promise((resolve) => {
      const watch = () => {
        if (document.documentElement.dataset.state === 'ready') {
          assembly.destroy();
          resolve();
          return;
        }
        requestAnimationFrame(watch);
      };
      watch();
    });
  });
}
