# SAGE Tattoo Studio — Landing Page

Static single-page site for **SAGE Tattoo Studio** (Tel Aviv-Yaffo), deployed on GitHub Pages at https://sagetattoo.shop.

## Pages

| Path | Description |
| --- | --- |
| `index.html` | Landing page: hero (random video), about strip, gallery marquee + lightbox, Google Reviews slider, booking form (WhatsApp), contact + map, floating WhatsApp CTA. |
| `artists/groc.html`, `artists/sunches.html`, `artists/gosha.html`, `artists/lion.html`, `artists/sean.html` | Fully static, hand-written per-artist portfolio pages, each one SEO-complete on its own (unique `<title>`, meta description, canonical, og/twitter tags, JSON-LD, static bio, real `<img src>` gallery). One file per artist, edited directly — no build step. |
| `blog/tattoos-in-tel-aviv.html` | Blog article: "Tattoos in Tel Aviv" — editorial typography, HTML/CSS only, no JS. |
| `404.html` | Custom 404 (noindex). |

## Files

- `styles.css` — global styles (CSS variables: `--accent-color: #8a9a86`, `--font-display: Bebas Neue`, `--font-body: Inter`).
- `script.js` — homepage logic: random hero video, preloader, marquee drag/auto-scroll, lightbox, multi-step booking form, reviews slider, WhatsApp CTA visibility, cookie banner.
- `artists/artist.css`, `artists/artist.js` — shared styles / runtime polish for artist pages (lazy gallery reveal, WhatsApp CTA, scroll distortion). All SEO content lives directly in each static HTML file.
- `assets/artists/` — per-artist photo folders (`assets/artists/{slug}/` with numbered gallery images + `profile.png`).
- `assets/images/` — tattoo gallery photos (1170px wide, used for gallery, lightbox, OG image).
- `assets/fonts/bebas-neue-latin.woff2` — self-hosted Bebas Neue (display font), served via `@font-face` with `font-display: block` and `<link rel="preload">` so display titles render in their final font with no fallback-font "jump".
- `assets/videos/random/` (1–12.mp4) — random hero background videos (homepage picks one at random).
- `assets/videos/` (2.mp4, 3.mp4) — chaotic overlay videos on the hero.

## SEO / metadata

- `robots.txt`, `sitemap.xml` (7 URLs), canonical tags, Open Graph / Twitter cards, JSON-LD (`TattooParlor`, `WebSite`, `BlogPosting`, `Person`, `BreadcrumbList`).
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

Static HTML/CSS/JS only — no build script, no template engine, no dependencies. Serve the repo root (e.g. via XAMPP or `python -m http.server`) and open `index.html`.

Artist pages are plain, hand-written static HTML so search engines and social crawlers see every artist without JavaScript. Each page is self-contained and SEO-complete on its own.

### Adding a new artist

1. Add photos to `assets/artists/{slug}/`.
2. Copy an existing artist page (e.g. `artists/sean.html`) to `artists/{slug}.html`.
3. Update in the new file: `title`, meta description, canonical, og/twitter tags, JSON-LD (name/description/url/image), `h1`, tagline (check it's on separate lines, not run-together), SEO paragraph, gallery images (src + unique alt/title per image), booking link.
4. Add their card to "OUR ARTISTS" in `index.html`.
5. Add them to the footer Artists submenu on every page.
6. Add their page to `sitemap.xml`.
7. Update the artist list in README.md.

Note: always link to static `/artists/{slug}.html` URLs. No query-string artist pages.

## Recent changes

- Removed the artist-page generator system (the Node build script, its HTML template, and the JSON data file) and the associated `npm` script. Artist pages are now fully hand-maintained static HTML, edited directly and copied by hand for new artists — no build step, no template engine, no dependencies.
- Verified and fixed SEO completeness on each of the 5 artist pages individually: unique title, meta description, canonical, og/twitter tags, JSON-LD, h1, separated tagline lines, SEO paragraph, and unique gallery alt/title text.
- Confirmed no stale references to the old generator tooling, a removed artist folder, or query-string artist page routing remain anywhere in the repo.
- Added new artist **Sean Misiuk** (ornamental, blackwork, calligraphy): added to the home page ARTISTS grid (5th card), footer links (index, blog, and artist pages), and `sitemap.xml`. Static `artists/sean.html` with unique title/meta/canonical/og/twitter, JSON-LD Person with `jobTitle` "Ornamental Tattoo Artist", real `<img src>` gallery of 14 `.jpg` images with descriptive alt/title targeting "tattoo tel aviv". Hero shows his specialty list (Blackwork / Calligraphy / Ornaments) plus a personal "Book with Sean" CTA linking to his own booking link (`https://wa.link/lg8i0r`) instead of the shared studio WhatsApp button.
- Added new artist **Lion** (dark organic, engraved black): added to the home page ARTISTS grid, footer links (index, blog, and artist pages), and `sitemap.xml`. Static `artists/lion.html` with the same SEO architecture as Groc/Sunches/Gosha (unique title/meta/canonical/og-twitter, JSON-LD Person, real `<img src>` gallery of 9 `.webp` images with descriptive alt/title targeting "tattoo tel aviv"). Bio page shows Lion's style lines plus a videography credit link to `@neon10.lens` on Instagram.
- Restored `blog/tattoos-in-tel-aviv.html` from git history (was deleted). All original SEO metadata, article content, and image alt text preserved.
- Simplified blog design: editorial/brutalist typography, HTML + CSS only. Removed GSAP, ScrollTrigger, `blog.js`, and all animation code.
- Improved footer navigation across Home, Artist, and Blog pages — added artist links, blog link, contact link, sitemap link.
- Updated `sitemap.xml` with blog URL. Sitemap now contains 4 indexable URLs.
- Added new artist **Gosha** (American Traditional style): added to the home page ARTISTS grid, footer links (index + artist pages), and `sitemap.xml`. SEO alt/title image text targets "tattoo tel aviv".
- Improved artist-card profile rendering: profile images now lazy-load with the logo as an instant placeholder (IntersectionObserver + `.loaded` swap), so the artist section never shows empty boxes while images load.
- Eliminated font "jump" on load: self-hosted Bebas Neue (`assets/fonts/bebas-neue-latin.woff2`) with `font-display: block` + `<link rel="preload">` across Home, Artist, and Blog pages, so the SAGE display title always renders in its correct font from the first frame.
- Simplified the hero + preloader title to a clean, classic presentation (removed animation, shadow, and large oversizing).
- Project audit cleanup: removed the unused `.fallback-input` CSS class, removed an orphaned `assets/images/6.webp`, and corrected the random-video count in these docs (1–12).
- Artist-page architecture cleanup: removed all leftover query-string (`?name=`) rendering code and the no-longer-needed per-artist data file, and deleted the legacy `artists/artist.html` redirect stub. The static per-artist-page files are the sole architecture.
