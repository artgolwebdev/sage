# SAGE Tattoo Studio — Landing Page

Static site for **SAGE Tattoo Studio** (Tel Aviv-Yaffo), deployed on GitHub Pages at https://sagetattoo.shop.

## Pages

- `index.html` — landing page (hero, gallery, artists, reviews, booking form, contact)
- `artists/{groc,sunches,gosha,lion,sean}.html` — static per-artist portfolio pages
- `blog/tattoos-in-tel-aviv.html` — blog article
- `privacy.html` — privacy policy (analytics consent, WhatsApp handoff, embeds)
- `404.html` — custom 404 with recovery links

## Key files

- `styles.css` — global styles (home, 404, privacy)
- `script.js` — homepage behaviour (hero video, gallery, booking form, consent, map)
- `artists/artist.css` / `artists/artist.js` — artist pages
- `blog/blog.css` — blog
- `assets/artists/{slug}/` — per-artist photos (`1.jpg`, ... plus `profile.png`)
- `assets/images/<name>-<width>.webp` — responsive gallery variants (generated)
- `assets/videos/hero/` — compressed 8s hero loops (generated from `assets/videos/random/`)
- `assets/og/` — 1200×630 social cards (generated)
- `assets/media-manifest.json` — natural dimensions for every processed image
- `tools/` — media + markup pipelines

## Media pipeline

Requires Node 20+ (see `package.json`). `npm install` then:

```bash
npm run media          # images (WebP 480/960/1440) + hero video + OG cards
npm run media:video    # re-encode hero loops only
npm run markup         # rewrite gallery <img> tags from the manifest
```

Hero loops are capped at 8s / 720p / ~300 KB. `assets/videos/random/` and
`assets/videos/*.mp4` remain as sources but are never served — the page loads
`assets/videos/hero/*.mp4`.

After adding or replacing photos, run `npm run media` (and `npm run markup` if
you added new files to a gallery page).

## Adding a new artist

1. Add photos to `assets/artists/{slug}/` and run `npm run media`
2. Copy an existing artist page (e.g. `artists/sean.html`) to `artists/{slug}.html`
3. Update in the new file: title, meta description, canonical, og/twitter tags (use
   `assets/og/{slug}.jpg` — add the card in `tools/optimize-media.mjs`), JSON-LD
   (name/description/url/image), h1, tagline, SEO paragraph, gallery images
   (`src`/`srcset`/`data-full` + unique alt), booking links
4. Add their card to `ARTISTS` in `script.js`
5. Add them to the footer Artists submenu on every page
6. Add their page to `sitemap.xml` and bump `?v=` on the css/js links
7. Update the artist list in this README

## Conventions

- **Name:** the canonical entity is “SAGE Tattoo Studio” (schema, footer, titles);
  “SAGE” is the wordmark only.
- **Analytics** loads only after consent (`sage_cookie_consent` in localStorage).
  Add conversion events with the `track()` helper in `script.js`.
- **Map** in the contact section is a standard Google Maps embed.
- **Assets** are versioned with `?v=YYYYMMDD` on the css/js links in every page.

## Business data

- Address: Eilat Street 22, Tel Aviv-Yaffo, Israel
- Phone / WhatsApp: +972 52 650 4348
- Instagram: `@sage.tattooshop` (studio), `@groc08` (artist)
- Google Place ID: `ChIJ_4lpuhJNHRURtDYa6DsDadI`

## Run locally

```bash
npm run serve      # http://127.0.0.1:8123
```

Static files only — no build step for the HTML.
