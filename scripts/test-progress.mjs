import assert from 'node:assert/strict';
import test from 'node:test';
import { easeInOut, stepDisplayed } from '../src/js/preloader/progress.js';

test('easeInOut endpoints', () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.ok(Math.abs(easeInOut(0.5) - 0.5) < 1e-9);
});

test('displayed never reaches 1 before the minimum duration', () => {
  let displayed = 0;
  for (let elapsed = 0; elapsed < 2400; elapsed += 16) {
    displayed = stepDisplayed({ displayed, real: 1, elapsed, minMs: 2400 }, 0.016);
    assert.ok(displayed < 1);
  }
});

test('displayed never moves backwards', () => {
  let displayed = 0;
  let previous = 0;
  for (let step = 0; step < 400; step += 1) {
    const elapsed = step * 16;
    const real = Math.min(1, elapsed / 1800);
    displayed = stepDisplayed({ displayed, real, elapsed, minMs: 2400 }, 0.016);
    assert.ok(displayed + 1e-9 >= previous);
    previous = displayed;
  }
});

test('displayed settles at 1 only after real is 1 and min time has elapsed', () => {
  let displayed = 0.2;
  displayed = stepDisplayed({ displayed, real: 1, elapsed: 2400, minMs: 2400 }, 0.5);
  assert.ok(displayed > 0.2);
  let guard = 0;
  while (displayed < 1 && guard < 80) {
    displayed = stepDisplayed({ displayed, real: 1, elapsed: 3000, minMs: 2400 }, 0.05);
    guard += 1;
  }
  assert.equal(displayed, 1);
});
