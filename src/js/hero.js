import { projects } from '../data/projects.js';
import { gsap, prefersFinePointer, prefersReducedMotion, SplitText } from './motion.js';
import { rafThrottle, readPxVar, unionRect } from './utils.js';

const LAYER_SPEC = [
  { layer: '0', ox: 0, oy: 0, scrollRot: 0, depth: 1, sign: 1 },
  { layer: '1', ox: 28, oy: 34, scrollRot: 2, depth: 1.6, sign: -1 },
  { layer: '2', ox: 56, oy: 68, scrollRot: -3, depth: 2.4, sign: 1 },
];

function layerHidden(el) {
  return getComputedStyle(el).display === 'none';
}

export function initHero() {
  const reduced = prefersReducedMotion();
  const fine = prefersFinePointer();
  const root = document.querySelector('#hero');
  const bg = root.querySelector('[data-hero-bg]');
  const bgScroll = root.querySelector('[data-bg-scroll]');
  const bgShift = root.querySelector('[data-bg-shift]');
  const bgBreathe = root.querySelector('[data-bg-breathe]');
  const veil = root.querySelector('[data-bg-veil]');
  const svg = root.querySelector('[data-hero-k]');
  const slot = root.querySelector('[data-hero-k-slot]');
  const rise = root.querySelector('[data-hero-k-rise]');
  const title = root.querySelector('[data-hero-title]');
  const sub = root.querySelector('[data-hero-sub]');
  const actions = [...root.querySelectorAll('[data-hero-actions] .btn')];
  const follow = root.querySelector('[data-hero-follow]');
  const spoiler = document.querySelector('#projetos');
  const cards = document.querySelector('[data-project-cards]');

  cards.innerHTML = projects.map((project) => `
    <article class="project-card">
      <div class="project-card-bar" aria-hidden="true"></div>
      <p class="project-kicker">${project.kicker}</p>
      <h3>${project.title}</h3>
    </article>
  `).join('');

  const reference = svg.querySelector('[data-k-layer="0"]');
  let box = { x: 200, y: 80, width: 820, height: 940 };
  try {
    const measured = reference.getBBox();
    if (measured?.width) box = measured;
  } catch {
    /* visibility:hidden can throw in Firefox; the fallback is the symbol's rough bounds */
  }
  const sharedBBox = { cx: box.x + box.width / 2, cy: box.y + box.height / 2 };

  const layers = LAYER_SPEC.map((spec) => {
    const el = svg.querySelector(`[data-k-layer="${spec.layer}"]`);
    const parallax = el.querySelector('[data-k-parallax]');
    return {
      ...spec,
      el,
      parallax,
      bbox: sharedBBox,
      model: { x: spec.ox, y: spec.oy, rot: 0 },
      proxy: { x: 0, y: 0 },
    };
  }).filter((layer) => layer.el);

  function pxToUser(px) {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox?.baseVal?.height || 1100.67;
    if (!rect.height) return px;
    return px / (rect.height / vb);
  }

  function applyLayer(layer) {
    const { x, y, rot } = layer.model;
    const { cx, cy } = layer.bbox;
    layer.el.setAttribute('transform', `translate(${x} ${y}) rotate(${rot} ${cx} ${cy})`);
  }

  layers.forEach(applyLayer);

  const splitInners = [];
  function splitTitle() {
    if (splitInners.length) return splitInners;
    title.querySelectorAll('.hero-line').forEach((line) => {
      const split = SplitText.create(line, {
        type: 'lines',
        mask: 'lines',
        tag: 'span',
        linesClass: 'hero-line-inner',
        aria: 'auto',
        reduceWhiteSpace: true,
      });
      splitInners.push(...split.lines);
    });
    return splitInners;
  }

  function setFinal() {
    layers.forEach((layer) => {
      layer.model.x = layer.ox;
      layer.model.y = layer.oy;
      layer.model.rot = 0;
      applyLayer(layer);
      gsap.set(layer.el, { opacity: 1 });
    });
    gsap.set(bgScroll, { scale: 1, opacity: 1 });
    gsap.set(bgBreathe, { scale: 1 });
    gsap.set([sub, ...actions, follow, rise], { y: 0, opacity: 1, clearProps: 'transform' });
    gsap.set(title, { y: 0, opacity: 1 });
    gsap.set(spoiler, { y: 0 });
    const lines = splitTitle();
    if (lines.length) gsap.set(lines, { yPercent: 0 });
  }

  function setIntroFrom() {
    const lines = splitTitle();
    layers.forEach((layer) => {
      layer.model.x = 0;
      layer.model.y = 0;
      layer.model.rot = 0;
      applyLayer(layer);
      gsap.set(layer.el, { opacity: 0 });
    });
    gsap.set(bgScroll, { scale: 1.14, opacity: 0 });
    if (lines.length) gsap.set(lines, { yPercent: 105 });
    gsap.set(sub, { y: 20, opacity: 0 });
    gsap.set(actions, { y: 20, opacity: 0 });
    gsap.set(spoiler, { y: 40 });
    gsap.set(title, { opacity: 1, y: 0 });
  }

  function orangeBounds() {
    const nodes = [...svg.querySelectorAll('[data-k-layer="0"], [data-k-layer="1"]')]
      .filter((el) => getComputedStyle(el).display !== 'none');
    return unionRect(nodes);
  }

  function ensureGap() {
    const front = svg.querySelector('[data-hero-k-front]');
    if (!front) return;

    for (let pass = 0; pass < 8; pass += 1) {
      const copy = unionRect([title, sub, ...actions]);
      const kBox = window.innerWidth < 768 ? orangeBounds() : unionRect([front]);
      if (!copy || !kBox) return;
      const copyRight = copy.left + copy.width;
      const copyTop = copy.top;
      const kRight = kBox.left + kBox.width;
      const kBottom = kBox.top + kBox.height;
      const overlapsX = copyRight > kBox.left + 4 && copy.left < kRight - 4;
      const overlapsY = copy.top + copy.height > kBox.top + 4 && copyTop < kBottom - 4;
      if (!overlapsX || !overlapsY) return;

      const current = slot.getBoundingClientRect().height;
      let next;
      if (window.innerWidth < 768) {
        const overflow = kBottom - (copyTop - 16);
        next = Math.max(112, current - overflow);
      } else {
        const gap = kBox.left - copyRight;
        const minGap = window.innerWidth * 0.05;
        if (gap >= minGap) return;
        const deficit = minGap - gap;
        const aspect = 1209.67 / 1100.67;
        next = Math.max(220, current - (deficit / (aspect * 0.92)));
      }
      if (!Number.isFinite(next) || next >= current - 1) return;
      slot.style.height = `${next}px`;
    }
  }

  window.addEventListener('resize', rafThrottle(() => {
    slot.style.height = '';
    ensureGap();
  }));

  let curtain;
  function mountCurtain() {
    if (reduced || curtain) return;
    const visibleLayers = layers.filter((layer) => !layerHidden(layer.el));
    curtain = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#hero-wrap',
        start: 'top top',
        end: () => `+=${window.innerHeight - readPxVar('--peek', 112)}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    visibleLayers.forEach((layer) => {
      curtain.to(layer.model, {
        x: layer.ox * 2.4,
        y: layer.oy * 2.4,
        rot: layer.scrollRot,
        onUpdate: () => applyLayer(layer),
      }, 0);
    });
    curtain.to(rise, { y: '-6vh' }, 0);
    curtain.to(title, { y: '-10vh', opacity: 0.35 }, 0);
    curtain.to(follow, { y: '-4vh' }, 0);
    curtain.to(bgScroll, { scale: 1.08 }, 0);
    curtain.to(veil, { opacity: 0.55 }, 0);
  }

  let breatheTween;
  function startIdle() {
    if (reduced || breatheTween) return;
    breatheTween = gsap.to(bgBreathe, {
      scale: 1.04,
      duration: 18,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  let nudge;
  function stopNudge() {
    if (!nudge) return;
    nudge.kill();
    nudge = null;
    gsap.set(spoiler, { y: 0 });
  }

  function startNudge() {
    if (reduced || nudge) return;
    const play = () => {
      if (nudge) return;
      nudge = gsap.timeline({ repeat: -1, repeatDelay: 3.3 });
      nudge.to(spoiler, { y: -8, duration: 0.35, ease: 'koth' })
        .to(spoiler, { y: 0, duration: 0.35, ease: 'koth' });
    };
    gsap.delayedCall(4, play);
    const halt = () => stopNudge();
    window.addEventListener('wheel', halt, { passive: true, once: true });
    window.addEventListener('touchstart', halt, { passive: true, once: true });
    window.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'PageDown', 'Space', ' '].includes(event.key)) halt();
    }, { once: true });
  }

  function bindParallax() {
    if (reduced || !fine) return;
    const shiftX = gsap.quickTo(bgShift, 'x', { duration: 0.8, ease: 'power3.out' });
    const shiftY = gsap.quickTo(bgShift, 'y', { duration: 0.8, ease: 'power3.out' });
    const layerTo = layers.map((layer) => ({
      x: gsap.quickTo(layer.proxy, 'x', { duration: 0.8, ease: 'power3.out', onUpdate: () => {
        const ux = pxToUser(layer.proxy.x);
        const uy = pxToUser(layer.proxy.y);
        layer.parallax.setAttribute('transform', `translate(${ux} ${uy})`);
      } }),
      y: gsap.quickTo(layer.proxy, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));

    root.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const rect = bg.getBoundingClientRect();
      const rx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ry = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      const max = Math.min(rect.width, rect.height) * 0.012;
      shiftX(rx * max);
      shiftY(ry * max);
      layers.forEach((layer, index) => {
        const amount = layer.depth * 6 * layer.sign;
        layerTo[index].x(rx * amount);
        layerTo[index].y(ry * amount);
      });
    }, { passive: true });
  }

  bindParallax();

  return {
    reduced,
    layers,
    applyLayer,
    splitTitle,
    setFinal,
    setIntroFrom,
    ensureGap,
    mountCurtain,
    startIdle,
    startNudge,
    stopNudge,
    elements: {
      bgScroll,
      veil,
      title,
      sub,
      actions,
      follow,
      spoiler,
      rise,
      svg,
      front: svg.querySelector('[data-hero-k-front]'),
    },
  };
}
