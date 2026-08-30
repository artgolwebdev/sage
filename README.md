# SAGE Tattoo Studio — Landing Page

Static site for **SAGE Tattoo Studio** (Tel Aviv-Yaffo), deployed on GitHub Pages at https://sagetattoo.shop.

## Pages

- `index.html` — landing page (hero, gallery, reviews, booking form, contact)
- `artists/{groc,sunches,gosha,lion,sean}.html` — static per-artist portfolio pages
- `blog/tattoos-in-tel-aviv.html` — blog article
- `404.html` — custom 404

## Key files

- `styles.css` — global styles
- `script.js` — homepage behavior (hero video, gallery, booking form)
- `assets/artists/{slug}/` — per-artist photos (`1.jpg`, ... plus `profile.png`)
- `assets/` — shared images, fonts, videos

## Adding a new artist

1. Add photos to `assets/artists/{slug}/`
2. Copy an existing artist page (e.g. `artists/sean.html`) to `artists/{slug}.html`
3. Update in the new file: title, meta description, canonical, og/twitter tags, JSON-LD (name/description/url/image), h1, tagline (separate lines), SEO paragraph, gallery images (src + unique alt/title each), booking link
4. Add their card to "OUR ARTISTS" in `index.html`
5. Add them to the footer Artists submenu on every page
6. Add their page to `sitemap.xml`
7. Update the artist list in this README

## Business data

- Address: Eilat Street 22, Tel Aviv-Yaffo, Israel
- Phone / WhatsApp: +972 52 650 4348
- Instagram: `@sage.tattooshop` (studio), `@groc08` (artist)
- Google Place ID: `ChIJ_4lpuhJNHRURtDYa6DsDadI`

## Run locally

Serve the repo root (e.g. `python -m http.server` or XAMPP) and open `index.html`. Static files only — no build step.
