const imageModules = import.meta.glob('../assets/img/hero-bg-*.{avif,webp,jpg}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const lqipModules = import.meta.glob('../assets/img/lqip.js', { eager: true });

function collect() {
  const formats = { avif: [], webp: [], jpg: [] };
  Object.entries(imageModules).forEach(([path, url]) => {
    const match = path.match(/hero-bg-(\d+)\.(avif|webp|jpg)$/);
    if (!match || typeof url !== 'string') return;
    formats[match[2]].push({ width: Number(match[1]), url });
  });
  Object.values(formats).forEach((list) => list.sort((a, b) => a.width - b.width));
  return formats;
}

export function getHeroAssets() {
  const formats = collect();
  const lqipModule = Object.values(lqipModules)[0];
  return {
    formats,
    lqip: lqipModule?.lqip || '',
    hasImage: formats.jpg.length > 0 || formats.avif.length > 0 || formats.webp.length > 0,
  };
}

export function pickHeroUrl(formats) {
  const need = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  const order = ['avif', 'webp', 'jpg'];
  for (const format of order) {
    const list = formats[format];
    if (!list?.length) continue;
    const chosen = list.find((item) => item.width >= need) || list[list.length - 1];
    return { format, ...chosen, list };
  }
  return null;
}

export function applyHeroSources(formats, src) {
  const picture = document.querySelector('[data-hero-picture]');
  const img = document.querySelector('[data-hero-img]');
  const bg = document.querySelector('[data-hero-bg]');
  if (!picture || !img || !bg) return;

  const avif = picture.querySelector('[data-hero-avif]');
  const webp = picture.querySelector('[data-hero-webp]');
  const set = (node, list) => {
    if (!node || !list?.length) return;
    node.srcset = list.map((item) => `${item.url} ${item.width}w`).join(', ');
    node.sizes = '100vw';
  };
  set(avif, formats.avif);
  set(webp, formats.webp);
  if (formats.jpg?.length) {
    img.srcset = formats.jpg.map((item) => `${item.url} ${item.width}w`).join(', ');
    img.sizes = '100vw';
  }
  if (src) img.src = src;
  bg.classList.remove('is-placeholder');
}

export function applyLqip(dataUri) {
  const picture = document.querySelector('[data-hero-picture]');
  if (picture && dataUri) picture.style.backgroundImage = `url("${dataUri}")`;
}

export async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`hero image ${response.status}`);
  const length = Number(response.headers.get('content-length')) || 0;
  if (!response.body || !length) {
    onProgress?.(0.35);
    const blob = await response.blob();
    onProgress?.(0.8);
    return blob;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(Math.min(0.92, received / length));
  }
  const type = response.headers.get('content-type') || 'image/jpeg';
  return new Blob(chunks, { type });
}
