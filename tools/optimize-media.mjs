#!/usr/bin/env node
/**
 * Media pipeline for the SAGE site.
 *
 *   node tools/optimize-media.mjs            # images + video + og
 *   node tools/optimize-media.mjs --images   # images + og only
 *   node tools/optimize-media.mjs --video    # video only
 *
 * Outputs:
 *   assets/images/<name>-<w>.webp                responsive gallery variants
 *   assets/artists/<artist>/<name>-<w>.webp
 *   assets/og/<slug>.jpg                         1200x630 social cards
 *   assets/videos/hero/<n>.mp4                   720p / 8s / muted hero loops
 *   assets/videos/overlay/<n>.mp4                480p overlay clips
 *   assets/media-manifest.json                   natural dimensions per source
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const WIDTHS = [480, 960, 1440];
const args = new Set(process.argv.slice(2));
const doVideo = !args.has('--images');
const doImages = !args.has('--video');

const exists = async (p) => fs.access(p).then(() => true, () => false);
const list = async (dir) =>
  (await fs.readdir(dir, { withFileTypes: true })).flatMap((e) =>
    e.isDirectory() ? [] : [path.join(dir, e.name)]
  );

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

/** Generate WebP variants for one source image and return its natural size. */
async function processImage(abs, manifest) {
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  const ext = path.extname(rel);
  const base = rel.slice(0, -ext.length);
  const { width, height } = await sharp(abs).metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.includes(widths[widths.length - 1]) && width > 1440) widths.push(1440);

  for (const w of widths) {
    const out = path.join(ROOT, `${base}-${w}.webp`);
    if (await exists(out)) continue;
    await sharp(abs)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(out);
  }
  manifest[rel] = { width, height, widths };
  return widths;
}

async function generateOg() {
  const dir = path.join(ROOT, 'assets/og');
  await ensureDir(dir);
  const cards = {
    'home.jpg': 'assets/images/4.jpg',
    'groc.jpg': 'assets/artists/groc/1.jpg',
    'sunches.jpg': 'assets/artists/sunches/2.jpg',
    'gosha.jpg': 'assets/artists/gosha/1.jpg',
    'lion.jpg': 'assets/artists/lion/1.webp',
    'sean.jpg': 'assets/artists/sean/1.jpg',
    'blog-tattoos-in-tel-aviv.jpg': 'assets/images/1.jpg',
  };
  for (const [out, src] of Object.entries(cards)) {
    await sharp(path.join(ROOT, src))
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(dir, out));
    console.log('og  ', out);
  }
}

async function transcode(input, output, { height, seconds }) {
  await run(ffmpeg.path, [
    '-y',
    '-i', input,
    '-t', String(seconds),
    '-vf', `scale=-2:${height}:flags=lanczos,fps=30`,
    '-c:v', 'libx264',
    '-profile:v', 'main',
    '-crf', '31',
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    output,
  ]);
  const { size } = await fs.stat(output);
  console.log('video', path.relative(ROOT, output), `${Math.round(size / 1024)} KB`);
}

async function processVideo() {
  const heroDir = path.join(ROOT, 'assets/videos/hero');
  const overlayDir = path.join(ROOT, 'assets/videos/overlay');
  await ensureDir(heroDir);
  await ensureDir(overlayDir);

  const random = path.join(ROOT, 'assets/videos/random');
  const names = (await fs.readdir(random)).filter((f) => f.endsWith('.mp4'));
  for (const name of names) {
    await transcode(path.join(random, name), path.join(heroDir, name), {
      height: 720,
      seconds: 8,
    });
  }
  for (const name of ['2.mp4', '3.mp4']) {
    await transcode(path.join(ROOT, 'assets/videos', name), path.join(overlayDir, name), {
      height: 480,
      seconds: 6,
    });
  }
}

async function main() {
  if (doImages) {
    const manifest = {};
    const galleryFiles = (await list(path.join(ROOT, 'assets/images'))).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f)
    );
    for (const f of galleryFiles) await processImage(f, manifest);
    console.log(`images: ${galleryFiles.length} sources`);

    const artistRoot = path.join(ROOT, 'assets/artists');
    for (const artist of await fs.readdir(artistRoot)) {
      const dir = path.join(artistRoot, artist);
      for (const f of await list(dir)) {
        if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
        await processImage(f, manifest);
      }
    }
    await fs.writeFile(
      path.join(ROOT, 'assets/media-manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n'
    );
    await generateOg();
  }
  if (doVideo) await processVideo();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
