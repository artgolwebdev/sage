# SAGE Tattoo Studio — Landing Page & Blog

Static single-page site for **SAGE Tattoo Studio** (Tel Aviv-Yaffo), deployed on GitHub Pages at https://sagetattoo.shop.

## Pages

| Path | Description |
| --- | --- |
| `index.html` | Landing page: hero (random video), about strip, gallery marquee + lightbox, Google Reviews slider, booking form (WhatsApp), contact + map, floating WhatsApp CTA. |
| `blog/tattoos-in-tel-aviv.html` | Long-form scroll-animated blog post "Tattoos in Tel Aviv". |
| `404.html` | Custom 404 (noindex). |

## Files

- `styles.css` — global styles (CSS variables: `--accent-color: #8a9a86`, `--font-display: Bebas Neue`, `--font-body: Inter`).
- `script.js` — homepage logic: random hero video, preloader, marquee drag/auto-scroll, lightbox, multi-step booking form, reviews slider, WhatsApp CTA visibility, cookie banner.
- `blog/blog.css`, `blog/blog.js` — blog styles + GSAP/ScrollTrigger reveals (opacity/transform only; all text is hard-coded in the HTML).
- `assets/images/` — tattoo gallery photos (1170px wide, used for gallery, lightbox, blog, OG image).
- `assets/videos/random/` (1–9.mp4) — random hero background videos (homepage picks one at random).
- `assets/videos/` (2.mp4, 3.mp4) — chaotic overlay videos on the hero.

## SEO / metadata

- `robots.txt`, `sitemap.xml` (homepage + blog), canonical tags, Open Graph / Twitter cards, JSON-LD (`TattooParlor` on the homepage, `BlogPosting` on the blog).
- Google Analytics `G-N3FE88WPKJ` (gtag).

## Key business data

- Address: Eilat Street 22, Tel Aviv-Yaffo, Israel
- Phone / WhatsApp: +972 52 650 4348
- Booking link: `https://wa.me/972526504348?text=...`
- Instagram: `@sage.tattooshop` (studio), `@groc08` (artist)
- Google reviews (write): `https://www.google.com/search?q=google+reviews+sage+tatto#lrd=0x151d4d12ba6989ff:0xd269033be81a36b4,3,,,,`
- Google reviews (view all): same URL with `,1,,,,`

## Development

Static HTML/CSS/JS — no build step. Serve the repo root (e.g. via XAMPP or `python -m http.server`) and open `index.html`. Blog page lives at `/blog/tattoos-in-tel-aviv.html`.
