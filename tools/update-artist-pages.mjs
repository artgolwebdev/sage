#!/usr/bin/env node
/**
 * One-off pass that brings the five static artist pages in line with the
 * homepage: canonical business name in JSON-LD, 1200x630 social cards,
 * theme-color, a Book CTA in the sticky header and hero, and the privacy link.
 *
 *   node tools/update-artist-pages.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const artists = {
  groc: { name: 'Groc', file: 'groc.html' },
  sunches: { name: 'Sunches', file: 'sunches.html' },
  gosha: { name: 'Gosha', file: 'gosha.html' },
  lion: { name: 'Lion', file: 'lion.html' },
  sean: { name: 'Sean Misiuk', file: 'sean.html' },
};

const whatsapp = (name) =>
  `https://wa.me/972526504348?text=${encodeURIComponent(`Hi, I'd like to book with ${name}`)}`;

for (const [slug, { name, file }] of Object.entries(artists)) {
  const abs = path.join(ROOT, 'artists', file);
  let html = await fs.readFile(abs, 'utf8');

  // Social card: dedicated 1200x630 image instead of a portrait photo.
  html = html.replace(
    /<meta property="og:image" content="https:\/\/sagetattoo\.shop\/assets\/artists\/[^"]+">/,
    `<meta property="og:image" content="https://sagetattoo.shop/assets/og/${slug}.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Tattoo work by ${name} at SAGE Tattoo Studio, Tel Aviv">`
  );
  html = html.replace(
    /<meta name="twitter:image" content="https:\/\/sagetattoo\.shop\/assets\/artists\/[^"]+">/,
    `<meta name="twitter:image" content="https://sagetattoo.shop/assets/og/${slug}.jpg">
    <meta name="twitter:image:alt" content="Tattoo work by ${name} at SAGE Tattoo Studio, Tel Aviv">
    <meta name="theme-color" content="#0a0a0a">`
  );

  // Canonical entity name + shared @id so the studio node is one entity.
  html = html.replace(
    /"@type": "TattooParlor",\s*\n(\s*)"name": "SAGE",/,
    `"@type": "TattooParlor",\n$1"@id": "https://sagetattoo.shop/#studio",\n$1"name": "SAGE Tattoo Studio",`
  );

  // Header booking shortcut.
  html = html.replace(
    /(<div class="artist-header-info">[\s\S]*?<\/div>\s*)<\/header>/,
    `$1<a href="${whatsapp(name)}" class="artist-header-book" target="_blank"
            rel="noopener noreferrer">Book</a>
    </header>`
  );

  // Hero booking CTA, right under the bio.
  html = html.replace(
    /(<p class="artist-hero-bio">[\s\S]*?<\/p>)/,
    `$1
            <a href="${whatsapp(name)}" class="artist-hero-book" target="_blank"
                rel="noopener noreferrer">Book with ${name} <span aria-hidden="true">→</span></a>`
  );

  // Privacy link in the footer.
  html = html.replace(
    /(<a href="\.\.\/index\.html#contact" class="footer-link">Contact<\/a>)/,
    `$1\n                    <a href="../privacy.html" class="footer-link">Privacy</a>`
  );

  await fs.writeFile(abs, html);
  console.log(`${file} updated`);
}
