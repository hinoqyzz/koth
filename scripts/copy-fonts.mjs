import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/fonts');
mkdirSync(out, { recursive: true });

const files = [
  [
    'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
    'space-grotesk-latin-wght-normal.woff2',
  ],
  [
    'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
    'manrope-latin-wght-normal.woff2',
  ],
  [
    'node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff2',
    'space-mono-latin-400-normal.woff2',
  ],
  ['node_modules/@fontsource-variable/space-grotesk/LICENSE', 'LICENSE-space-grotesk.txt'],
  ['node_modules/@fontsource-variable/manrope/LICENSE', 'LICENSE-manrope.txt'],
  ['node_modules/@fontsource/space-mono/LICENSE', 'LICENSE-space-mono.txt'],
];

for (const [from, name] of files) {
  copyFileSync(join(root, from), join(out, name));
}

console.log('[koth] fonts copied to public/fonts');
