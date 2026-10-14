import { clamp01 } from '../utils.js';

export const WEIGHTS = {
  fonts: 0.25,
  image: 0.45,
  js: 0.15,
  frame: 0.15,
};

export function easeInOut(amount) {
  const t = clamp01(amount);
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

/**
 * Frame step for the displayed counter.
 * Reaches 1 only when real progress is complete and the minimum duration has elapsed.
 */
export function stepDisplayed(state, dt) {
  const safeDt = Math.max(0, dt);
  let displayed = state.displayed;
  if (state.real >= 1 && state.elapsed >= state.minMs) {
    displayed += (1 - displayed) * (1 - Math.exp(-safeDt * 6));
    if (displayed > 0.997) displayed = 1;
  } else {
    const capByTime = easeInOut(clamp01(state.elapsed / state.minMs));
    const target = Math.min(state.real, capByTime);
    displayed += (target - displayed) * (1 - Math.exp(-safeDt * 6));
    displayed = Math.min(displayed, 0.999);
  }
  if (displayed < state.displayed) displayed = state.displayed;
  return displayed;
}

export function createProgress({ minMs, onProgress }) {
  const tasks = { fonts: 0, image: 0, js: 0, frame: 0 };
  let real = 0;
  let displayed = 0;
  let elapsed = 0;
  let settled = false;
  let resolveReady = () => {};
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  function recompute() {
    real = tasks.fonts * WEIGHTS.fonts
      + tasks.image * WEIGHTS.image
      + tasks.js * WEIGHTS.js
      + tasks.frame * WEIGHTS.frame;
  }

  function emit() {
    onProgress?.(displayed, { real, elapsed, tasks: { ...tasks } });
  }

  return {
    ready,
    get displayed() {
      return displayed;
    },
    get real() {
      return real;
    },
    setTask(name, value) {
      if (!(name in tasks) || settled) return;
      tasks[name] = clamp01(value);
      recompute();
    },
    tick(dtSeconds) {
      if (settled) return;
      const dtReal = Number.isFinite(dtSeconds) ? Math.max(0, dtSeconds) : 0;
      const dt = Math.min(0.064, dtReal);
      elapsed += dtReal * 1000;
      displayed = stepDisplayed({ displayed, real, elapsed, minMs }, dt);
      emit();
      if (displayed >= 1) {
        settled = true;
        displayed = 1;
        emit();
        resolveReady();
      }
    },
    force() {
      if (settled) return;
      Object.keys(tasks).forEach((name) => {
        tasks[name] = 1;
      });
      recompute();
      elapsed = Math.max(elapsed, minMs);
      displayed = 1;
      settled = true;
      emit();
      resolveReady();
    },
  };
}
