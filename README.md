# SAGE Tattoo Studio — Landing Page

Static single-page site for **SAGE Tattoo Studio** (Tel Aviv-Yaffo), deployed on GitHub Pages at https://sagetattoo.shop.

## Pages

| Path | Description |
| --- | --- |
| `index.html` | Landing page: hero (random video), about strip, gallery marquee + lightbox, Google Reviews slider, booking form (WhatsApp), contact + map, floating WhatsApp CTA. |
| `artists/artist.html` | Artist portfolio page (query-param routing: `?name=groc`, `?name=sunches`). |
| `blog/tattoos-in-tel-aviv.html` | Blog article: "Tattoos in Tel Aviv" — editorial typography, HTML/CSS only, no JS. |
| `404.html` | Custom 404 (noindex). |

## Files

- `styles.css` — global styles (CSS variables: `--accent-color: #8a9a86`, `--font-display: Bebas Neue`, `--font-body: Inter`).
- `script.js` — homepage logic: random hero video, preloader, marquee drag/auto-scroll, lightbox, multi-step booking form, reviews slider, WhatsApp CTA visibility, cookie banner.
- `assets/images/` — tattoo gallery photos (1170px wide, used for gallery, lightbox, OG image).
- `assets/videos/random/` (1–9.mp4) — random hero background videos (homepage picks one at random).
- `assets/videos/` (2.mp4, 3.mp4) — chaotic overlay videos on the hero.

## SEO / metadata

- `robots.txt`, `sitemap.xml` (4 URLs), canonical tags, Open Graph / Twitter cards, JSON-LD (`TattooParlor`, `WebSite`, `BlogPosting`, `Person`, `BreadcrumbList`).
- Google Analytics `G-N3FE88WPKJ` (gtag).
- SEO target: **"tattoo tel aviv"** — blog supports related **"tattoos in tel aviv"**.

## Key business data

- Address: Eilat Street 22, Tel Aviv-Yaffo, Israel
- Phone / WhatsApp: +972 52 650 4348
- Booking link: `https://wa.me/972526504348?text=...`
- Instagram: `@sage.tattooshop` (studio), `@groc08` (artist)
- Google Place ID: `ChIJ_4lpuhJNHRURtDYa6DsDadI` (SAGE TATTOO SHOP; FID `0x151d4d12ba6989ff:0xd269033be81a36b4`)
- Google reviews (write): `https://search.google.com/local/writereview?placeid=ChIJ_4lpuhJNHRURtDYa6DsDadI`
- Google reviews (view all, mobile-optimized search): Google Search results URL for `sage tattoo shop reviews` with the `si=` business token + `#ebo=1` fragment (see `index.html` → "See all Google Reviews")

## Development

Static HTML/CSS/JS — no build step. Serve the repo root (e.g. via XAMPP or `python -m http.server`) and open `index.html`.

## Recent changes

- Restored `blog/tattoos-in-tel-aviv.html` from git history (was deleted). All original SEO metadata, article content, and image alt text preserved.
- Simplified blog design: editorial/brutalist typography, HTML + CSS only. Removed GSAP, ScrollTrigger, `blog.js`, and all animation code.
- Improved footer navigation across Home, Artist, and Blog pages — added artist links, blog link, contact link, sitemap link.
- Updated `sitemap.xml` with blog URL. Sitemap now contains 4 indexable URLs.
