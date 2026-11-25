#!/usr/bin/env node
/**
 * Rewrites gallery markup to responsive WebP <img> tags using the manifest
 * produced by tools/optimize-media.mjs.
 *
 *   node tools/build-markup.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'assets/media-manifest.json'), 'utf8')
);

const dims = (rel) => {
  const m = manifest[rel];
  if (!m) throw new Error(`missing manifest entry: ${rel}`);
  return m;
};

const srcset = (base, widths) =>
  widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ');

const largest = (base, widths) => `${base}-${widths[widths.length - 1]}.webp`;

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? decode(m[1]) : '';
};

const clean = (alt) => escapeHtml(alt.trim().replace(/\s+/g, ' '));

function galleryImg({ rel, alt, sizes, eager, extraClass, prefix = '' }) {
  const meta = dims(rel);
  const base = prefix + rel.slice(0, -path.extname(rel).length);
  return `<img src="${base}-${meta.widths[0]}.webp"
                    srcset="${srcset(base, meta.widths)}"
                    sizes="${sizes}"
                    width="${meta.width}" height="${meta.height}"
                    alt="${clean(alt)}"
                    loading="${eager ? 'eager' : 'lazy'}" decoding="async"
                    data-full="${largest(base, meta.widths)}"
                    class="lazy${extraClass ? ' ' + extraClass : ''}">`;
}

/* ---------- homepage marquee ---------- */
let indexHtml = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
const marqueeRe = /(<div class="marquee-content">)([\s\S]*?)(\n\s*<\/div>\s*<\/div>\s*<\/section>)/;
const marqueeMatch = indexHtml.match(marqueeRe);
if (!marqueeMatch) throw new Error('marquee block not found');

const seen = new Map();
for (const tag of marqueeMatch[2].match(/<img[^>]*>/g) || []) {
  const src = attr(tag, 'data-src');
  if (!src || seen.has(src)) continue;
  seen.set(src, attr(tag, 'alt'));
}

const indexImgs = [...seen.entries()]
  .map(([src, alt], i) =>
    galleryImg({
      rel: src,
      alt,
      sizes: '(max-width: 767px) 78vw, 320px',
      eager: i < 4,
    })
  )
  .join('\n                ');

indexHtml = indexHtml.replace(
  marqueeRe,
  (_m, open, _body, close) => `${open}\n                ${indexImgs}${close.replace(/\n\s*/, '\n                ')}`
);
await fs.writeFile(path.join(ROOT, 'index.html'), indexHtml);
console.log(`index.html: ${seen.size} gallery images rewritten`);

/* ---------- artist galleries ---------- */
const artistDir = path.join(ROOT, 'artists');
for (const file of (await fs.readdir(artistDir)).filter((f) => f.endsWith('.html'))) {
  const abs = path.join(artistDir, file);
  let html = await fs.readFile(abs, 'utf8');
  let count = 0;
  html = html.replace(/<img class="lazy distort"[^>]*>/g, (tag) => {
    const src = attr(tag, 'src').replace(/^\.\.\//, '');
    const alt = attr(tag, 'alt');
    count++;
    return galleryImg({
      rel: src,
      alt,
      sizes: '(max-width: 600px) 100vw, (max-width: 1024px) 46vw, 30vw',
      extraClass: 'distort',
      prefix: '../',
    });
  });
  await fs.writeFile(abs, html);
  console.log(`${file}: ${count} gallery images rewritten`);
}
