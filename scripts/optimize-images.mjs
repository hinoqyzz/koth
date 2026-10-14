import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = join(root, 'src/assets/img/raw/hero-bg.jpg');
const outDir = join(root, 'src/assets/img');
const AVIF_LIMIT = 250 * 1024;

mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, 'public'), { recursive: true });

async function writeGrain() {
  const size = 160;
  const data = Buffer.alloc(size * size);
  let seed = 20260314;
  for (let i = 0; i < data.length; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    data[i] = 108 + (seed % 90);
  }
  await sharp(data, { raw: { width: size, height: size, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(join(root, 'public/grain.png'));
}

async function writeAvif(input, dest) {
  let quality = 50;
  let last = dest;
  while (quality >= 24) {
    await input.clone().avif({ quality, effort: 6 }).toFile(dest);
    const size = statSync(dest).size;
    last = dest;
    if (size <= AVIF_LIMIT) {
      console.log(`[koth] ${dest.split('/').pop()} ${(size / 1024).toFixed(0)}kb q${quality}`);
      return;
    }
    quality -= 6;
  }
  console.warn(`[koth] ${last.split('/').pop()} still above 250kb`);
}

async function main() {
  await writeGrain();
  if (!existsSync(rawPath)) {
    console.log('[koth] src/assets/img/raw/hero-bg.jpg missing — hero uses the CSS placeholder');
    return;
  }

  const widths = [960, 1600, 2560];
  for (const width of widths) {
    const height = Math.round((width * 9) / 16);
    const base = sharp(rawPath).rotate().resize(width, height, { fit: 'cover', position: 'centre' });
    await writeAvif(base, join(outDir, `hero-bg-${width}.avif`));
    await base.clone().webp({ quality: 72 }).toFile(join(outDir, `hero-bg-${width}.webp`));
    await base.clone().jpeg({ quality: 74, mozjpeg: true }).toFile(join(outDir, `hero-bg-${width}.jpg`));
  }

  const lqip = await sharp(rawPath)
    .rotate()
    .resize(32, 18, { fit: 'cover' })
    .webp({ quality: 28 })
    .toBuffer();
  const dataUri = `data:image/webp;base64,${lqip.toString('base64')}`;
  writeFileSync(join(outDir, 'lqip.js'), `export const lqip = ${JSON.stringify(dataUri)};\n`);
  console.log('[koth] lqip written');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
