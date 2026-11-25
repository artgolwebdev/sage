# SAGE Tattoo Studio — SEO / Performance / UX Audit & Improvement Plan

**Site:** https://sagetattoo.shop (static HTML, GitHub Pages, `CNAME` → apex domain)
**Audited:** 2026-11-25 · 7 HTML pages · 177 files · 89 MB repo
**Method:** source review of all pages + local server on `http://127.0.0.1:8123` measured with the browser Performance API (Chromium, desktop viewport, cold cache), asset inventory, and scripted checks for metadata, links, and JSON-LD.

Severity: **P0** = blocking revenue/ranking · **P1** = high impact, do next · **P2** = polish/scale.
Effort: **S** <1h · **M** half-day · **L** multi-day.

---

## 1. Executive summary

The site is visually distinctive and technically clean in ways many small-business sites are not: every page has a unique title, description, canonical, OG/Twitter tags and valid JSON-LD; there are zero broken internal links; images have alt text; artist pages get real crawlable HTML. That foundation is worth keeping.

The losses are concentrated in three places:

1. **Weight.** One homepage load transfers **8.37 MB / 46 requests** (5.2 MB images, 2.9 MB video). The repo ships **68 MB of video** and a **21 MB hero clip** in rotation. Real-world mobile LCP is dominated by a preloader that waits for three videos (`script.js:30-56`).
2. **Findability.** The homepage body is ~600 words, the H1 is the word "SAGE", artist cards and all six reviews exist **only after JS runs**, and there are no pages targeting the queries people actually type ("tattoo price Tel Aviv", "piercing Tel Aviv", "fine line tattoo Tel Aviv"). Local-business schema lacks hours, price range, and review markup.
3. **Conversion + trust.** The funnel is a 4-step quiz that ends in a WhatsApp hand-off with no email fallback and no date/style/reference input; there is **no site navigation on the homepage at all**; no privacy/terms pages; Google Analytics loads **before** cookie consent.

Expected outcomes from the plan: **~8.4 MB → <1.2 MB** initial homepage weight, LCP from ~2.7 s (desktop, warm server) / 5 s+ (mobile floor, by design) to **<2.0 s**, and roughly **2–3× more organic landing pages** (7 → 20+).

---

## 2. Where the site is today (measured)

| Metric | Value |
|---|---|
| Homepage transfer | **8.37 MB**, 46 requests |
| — images | 5.27 MB (74 `<img>`, 37 unique files, duplicated for the marquee) |
| — video | 2.94 MB in 6 s (browser stops buffering; files are far larger) |
| — CSS / JS | 293 KB / 27 KB |
| FCP | 532 ms |
| load event | 2 691 ms (3 videos trigger it) |
| Images missing `width`/`height` | **83 of 84** on the homepage → layout shift |
| Homepage text | ~599 words including nav/footer |
| Largest assets | `random/4.mp4` **21.1 MB**, `videos/2.mp4` 13.2 MB, `videos/3.mp4` 9.1 MB, `about-strip.png` 300 KB |
| Per-page image payload | groc 5.8 MB · sunches 4.8 MB · gosha 2.7 MB · sean 1.5 MB · blog 1.3 MB · **lion 0.6 MB (WebP — the model to copy)** |
| Pages indexed | 7 (5 artist, 1 blog, 1 home) |

---

## 3. SEO audit

### 3.1 Crawlability & indexation — mostly healthy

| # | Sev | Finding | Fix |
|---|---|---|---|
| 1 | P2 | `robots.txt` is minimal but valid; sitemap declared. No AI-crawler policy. | Add explicit allow blocks for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` if AI visibility is desired (see §7). |
| 2 | P2 | `sitemap.xml` lists 7 URLs, all `changefreq/monthly` (ignored by Google) and a single `lastmod`. No image entries. | Add `<image:image>` for key gallery shots; set real `lastmod` per page; keep as-is otherwise. |
| 3 | P2 | `404.html` is correct (`noindex`) but has no structured data and no path back to artists/blog. | Add quick links to Artists / Booking / Blog + `TattooParlor` JSON-LD (helps brand queries landing on stale URLs). |
| 4 | — | All internal links resolve; no 404s found across 7 pages. | Keep. Add this check to a script (§9). |

### 3.2 Metadata — good bones, weak social previews

| # | Sev | Finding | Fix |
|---|---|---|---|
| 5 | **P0** | **OG image is a 1170×1554 portrait** (`assets/images/4.jpg`, declared 1170×1560). Facebook/WhatsApp/LinkedIn crop 1.91:1 → the tattoo work is cut to a strip. Instagram/WhatsApp shares are a primary channel for this business. | Generate a branded 1200×630 OG image per page (home, 5 artists, blog). Add `og:image:alt`. |
| 6 | P1 | No `theme-color`, no `manifest.webmanifest`, no `apple-touch-icon`, no SVG favicon; `favicon.ico` is 15.4 KB. | Add `theme-color` (`#0a0a0a`), 180/192/512 PNG icons, `favicon.svg`, `manifest.webmanifest` with `display: standalone`. |
| 7 | P2 | No `article:published_time` / `article:author` on the blog; `og:type=article` without article metadata. | Add the four `article:*` tags and a visible author/date line. |
| 8 | P1 | Index title (57 chars) and descriptions are near-optimal but repetitive: every artist page opens with "Get a tattoo in Tel Aviv with X". | Differentiate intent per page: style-led ("Blackwork & Freehand Tattoos by Groc — Tel Aviv"), price/booking ("Tattoo Prices in Tel Aviv"), piercing, FAQ. |

### 3.3 Structured data — valid but under-built

Current: `TattooParlor` + `WebSite` (home), `Person` + `BreadcrumbList` (artists), `BlogPosting` + `BreadcrumbList` (blog). All parse cleanly.

| # | Sev | Finding | Fix |
|---|---|---|---|
| 9 | **P0** | `TattooParlor` (`index.html:48`) is missing `openingHoursSpecification`, `priceRange`, `currenciesAccepted`, `paymentAccepted`, `image` (array), `logo`, `@id`, `potentialAction` (ReserveAction), and `hasOfferCatalog` for services/artists. Business hours are not published anywhere on the site at all. | Publish hours on the page **and** in schema; add `@id` (`https://sagetattoo.shop/#studio`) so `Person.worksFor` can reference it instead of duplicating a partial business object. |
| 10 | P1 | `sameAs` contains only Instagram. No Google Business Profile / Maps place URL even though the Place ID (`ChIJ_4lpuhJNHRURtDYa6DsDadI`) is known. | Add GBP place URL, Facebook, TikTok if they exist. This is the strongest local-entity signal available. |
| 11 | P1 | No `Review`/`AggregateRating` markup, and the six 5★ reviews are injected by JS (`script.js:570`) so crawlers never see them. | Render reviews as static HTML (first 3 at minimum) and attach `Review` + `AggregateRating` — only if ratings are genuinely collected on-site or verifiably sourced from GBP (Google's policy: self-serving reviews on LocalBusiness are not eligible for stars, so treat this as **content + entity** value, not a rich-result bet). |
| 12 | P1 | No `FAQPage`, no `Service`/`Offer`, no `Person.sameAs` (artist Instagrams) or `knowsAbout` for styles. | Add an FAQ block with schema (price, walk-ins, aftercare, pain, age, deposit); add `sameAs`/`knowsAbout` per artist. |
| 13 | P2 | `Person` nodes repeat the full business object; no `@id` graph linking. | Move to a single `@graph` per page with `#studio`, `#artist-name`, `#webpage`, `#breadcrumb` nodes. |

### 3.4 On-page content & keyword coverage — the biggest organic gap

| # | Sev | Finding | Fix |
|---|---|---|---|
| 14 | **P0** | Homepage H1 is **"SAGE"** with a visually hidden "Tattoo Studio in Tel Aviv" (`index.html:120-121`). The single strongest on-page signal is the brand name only. | `H1: Tattoo Studio in Tel Aviv — SAGE` (keep the display treatment via CSS; the `<h1>` can contain visually-hidden qualifier text, but say it once, not as a fragment). |
| 15 | P1 | Gallery section has **no heading at all** (`index.html:145`) — a ~37-image block that contributes zero headings/text. About-strip h2 lists three services but no supporting copy. | Add `<h2>Our Work — Tattoos & Piercings in Tel Aviv</h2>` + a 60–80 word intro naming styles (fine line, blackwork, ornamental, American traditional, calligraphy, freehand) and neighbourhood. |
| 16 | **P0** | Only 7 indexable URLs. Nothing targets: `tattoo price tel aviv`, `piercing tel aviv`, `fine line tattoo tel aviv`, `walk in tattoo tel aviv`, `tattoo removal?`, `best tattoo studio tel aviv`, Hebrew queries. | Build a hub page per intent: **/piercing/**, **/tattoo-prices/**, **/styles/fine-line/**, **/styles/blackwork/**, **/faq/**, plus a **/neve-tzedek/**-style neighborhood page if local pack competition warrants. Each needs 400–800 words, real photos, internal links from home + artists. |
| 17 | P1 | Artist pages are 292–500 words of bio + a gallery with **near-identical alt/title patterns** per image ("… by Groc — tattoo in Tel Aviv" repeated 39×). Thin, template-y, low semantic value. | Add per-artist: styles, booking lead time, Instagram, guest-spot status, 2–3 signature project paragraphs (with 3–5 real captions describing the design). Vary image alts meaningfully (subject + style + placement), and drop `title` attributes (redundant tooltips hurt mobile UX). |
| 18 | P1 | One blog post (734 words), no internal links from the post body to artist pages, no publish cadence. | Ship 1 post/month answering a real question (aftercare, first-tattoo prep, price anatomy, choosing an artist). Link every post to ≥2 artist pages and the booking form. |
| 19 | P2 | No `hreflang` and no Hebrew/Russian version, despite Israeli + oleh + tourist audiences and Hebrew reviews displayed. | Either add `he` pages with `hreflang` pairs, or add a bilingual FAQ/pricing block. Do not machine-translate thin content. |
| 20 | P2 | Review names contain Hebrew with `dir="auto"` (good) but cards sit in an `ltr` container. Mixed-direction rendering is fragile. | Let the container inherit `dir="auto"` per card; keep Latin text inside `dir="ltr"` spans. |

### 3.5 Local SEO / entity consistency

| # | Sev | Finding | Fix |
|---|---|---|---|
| 21 | **P0** | Business naming is inconsistent: site says **SAGE**, schema `name: "SAGE"`, title says "SAGE Tattoo Studio", reviews name **"German"** repeatedly as the artist, but the team list is Groc/Sunches/Gosha/Lion/Sean. A visitor (and Google's entity matcher) cannot tell who "German" is. | Confirm the canonical GBP name ("SAGE Tattoo Studio"?) and use it identically in: `<title>`, schema `name`, footer, GBP, Instagram bio, NAP citations. If "German" is an owner/artist, add them to the artist roster (or note the lineage: "formerly German"). |
| 22 | P1 | No hours, no price signal, no "how to get here" (Neve Tzedek/Florentin context), no parking/transit note, no deposit policy. Map iframe is the only location content. | A `Visit` block: hours table, deposit policy, transit/parking, "2 min from …" landmark, wheelchair access answer. All of it mirrors GBP and feeds the local pack. |
| 23 | P1 | No `LocalBusiness` sub-type breadth: `TattooParlor` is right, but services (piercing, fine art gallery) are unmodeled. | Add `makesOffer`/`hasOfferCatalog` with `Service` nodes for Tattoo, Piercing, Art Gallery. |
| 24 | P2 | No citations/canonical NAP page, no press or "as seen in" trust row. | Add a `/about/` page with the studio story, team, hygiene/sterilization standards, and awards. |

### 3.6 Analytics & measurement

| # | Sev | Finding | Fix |
|---|---|---|---|
| 25 | P1 | GA4 is installed, but **zero custom events** in `script.js`. You cannot see form starts, step drop-off, WhatsApp taps, `tel:` taps, gallery opens, or artist-page exits. | Instrument: `booking_start`, `booking_step_2/3/4`, `booking_submit_whatsapp`, `whatsapp_floating_cta`, `tel_click`, `instagram_click`, `artist_card_click`, `gallery_open`. |
| 26 | P1 | No Search Console verification tag/file in the repo; no Bing/IndexNow; no `preconnect` to GA. | Add `google-site-verification` meta, submit sitemap in GSC + Bing, add `<link rel="preconnect" href="https://www.googletagmanager.com">`. |

### 3.7 Compliance (affects trust + rankings indirectly)

| # | Sev | Finding | Fix |
|---|---|---|---|
| 27 | **P0** | **GA4 loads unconditionally** (`index.html:39-46`) before any consent; the banner only records a click in `localStorage` (`script.js:551`). No reject option, no policy link. | Gate GA behind consent (Consent Mode v2: `analytics_storage` denied by default), add "Accept" **and** "Decline" buttons, link `/privacy/`. |
| 28 | P1 | No privacy policy, terms, or accessibility statement. Ad platforms and some local directories require them. | Add `/privacy/`, `/terms/`, `/accessibility/` (short, plain language). |

---

## 4. Performance audit

### 4.1 Video (the dominant cost)

The hero plays a **random** clip from `assets/videos/random/` (12 files, 47 MB total, up to **21 MB**), plus two "chaotic" overlay videos (13 MB + 9 MB). `script.js:30-56` dismisses the preloader only after all three report `canplaythrough` — or after a 5 s fallback. On 4G that means a multi-second blank screen on the most important page, paid for in mobile data.

| # | Sev | Fix | Expected |
|---|---|---|---|
| 29 | **P0** | Remove the preloader entirely, or time-box it to 400 ms with a CSS-only fade. Nothing on the page requires 3 videos to paint. | LCP −2 to −5 s on mobile |
| 30 | **P0** | Transcode hero clips: 720p max, 6–10 s loops, CRF 30, `-an`, faststart, target **≤800 KB** each; delete `random/4.mp4` from rotation or replace it. Offer WebM/VP9 or AV1 with MP4 fallback. | 68 MB → ~6 MB |
| 31 | P1 | `preload="none"` + `poster` everywhere; start playback only after `DOMContentLoaded` and only when `matchMedia('(prefers-reduced-motion: no-preference)')` and not `navigator.connection.saveData`. Skip overlay videos under 768 px. | Mobile data −90% |
| 32 | P1 | Add a visible mute/pause control for background video (WCAG 2.2.2). | Compliance + UX |

### 4.2 Images

| # | Sev | Fix | Expected |
|---|---|---|---|
| 33 | **P0** | 37 unique JPGs (5.4 MB) are set eagerly at `DOMContentLoaded` (`script.js:351-358`) because CSS-transform scrolling breaks IntersectionObserver. Generate **480/960/1440 px WebP** variants; serve with `<picture>`/`srcset`; keep the marquee but lazy-load by loading only the first viewport's worth, then the rest after `load`. | 5.4 MB → <900 KB |
| 34 | P1 | Add intrinsic `width`/`height` (or `aspect-ratio`) to all 74 gallery tiles and all artist-gallery images — currently 83/84 homepage images and every artist gallery image lack them. | CLS → ~0 |
| 35 | P1 | Stop duplicating 37 `<img>` nodes in HTML for the loop; clone once in JS or use a CSS-only duplicate track. | DOM halved, LCP faster |
| 36 | P2 | `about-strip.png` (300 KB) → WebP ~60 KB. Artist `profile.png` files are 290–304 KB for a 36 px avatar and a card — resize to 480 px WebP. | −700 KB |
| 37 | P2 | Lion's page is WebP and 10× lighter than Groc's — standardize on WebP/AVIF with a build script (see §9). | Consistency |

### 4.3 CSS/JS/fonts

| # | Sev | Fix |
|---|---|---|
| 38 | P1 | **Inter is loaded from Google Fonts** (two extra connections + a render-blocking CSS chain) while Bebas Neue is self-hosted. Self-host a subset of Inter (400/600/700, latin + hebrew as needed) and drop both preconnects. |
| 39 | P1 | Three stylesheets repeat the same `:root` tokens, CTA, footer and button rules (`styles.css`, `artists/artist.css`, `blog/blog.css`). Extract `base.css`, keep page-specific files. Prevents the drift already visible (footer headings are `<h3>` on home, `<h2>` on artist pages). |
| 40 | P2 | No minification or cache-busting (`styles.css?v=…`). GH Pages can't set headers — put **Cloudflare in front** for Brotli, HTTP/3, cache-control and a free WAF, and keep the apex domain. |
| 41 | P2 | Infinite `requestAnimationFrame` marquee runs even when the section is offscreen; add IntersectionObserver pause + `document.hidden` pause. | CPU/battery |

---

## 5. UX audit

### 5.1 Navigation & orientation — **P0**

- The homepage has **no header nav**. Visitors land at the hero and can only scroll ~6 900 px, or use the footer, to reach Artists / Booking / Contact. Add a slim sticky header: logo, `Work`, `Artists`, `Pricing`, `Book`, phone. It must not cover the hero composition — use a transparent-to-solid transition after the hero.
- Artist pages have a single "Back" link and no link to booking or to sibling artists ("Next artist →"). Add a persistent in-page "Book with {Name}" button and prev/next artist links — this is direct revenue.
- No breadcrumbs visually (schema only). Add visible breadcrumbs on artist/blog pages.
- No active-section indication while scrolling.

### 5.2 The booking funnel — **P0/P1**

Current: placement → size → name → "I'm 18" → WhatsApp. Problems:

1. **No date, no style, no idea description, no reference upload.** The artist receives "Placement: Arm / Size: Small / Name: X" — the studio still has to ask everything. Add a textarea ("describe your idea") and optional style chips; include it in the WhatsApp message.
2. **No email/phone capture.** If the visitor has no WhatsApp (or no account), the lead is lost. Offer a `mailto:` fallback and a "copy message" option, or add a Formspree/Netlify-style endpoint. *(If you want a real backend, use the Gravity Index to pick a form/email provider rather than hand-rolling.)*
3. **Artist intent is dropped.** Pass `?artist=Groc` from artist pages into step 1 and prefill the message.
4. **No progress affordance beyond "1/4".** Add step labels and a "Back" that never discards answers (it already keeps state — good).
5. **No time estimate** ("takes 30 seconds"), no trust line (deposit, response time), no confirmation screen before the WhatsApp redirect (users lose context when another app opens).
6. **No inline validation messaging**; the Next button is simply disabled with no explanation.

### 5.3 Trust & reassurance — P1

- Add hours, "responds within X hours", deposit policy, sterilization/hygiene claims, age policy, and the studio's real address with a "Get directions" button (the map iframe alone doesn't drive action on mobile).
- Add a "Meet the team" line above the artist grid explaining the styles and guest spots.
- Show review count + average from Google ("5.0 ★ · 42 Google reviews") with a link — currently the section just says "WHAT CLIENTS SAY".
- Hebrew reviews shown in an English page without context; add a language note or translate them.

### 5.4 Mobile specifics — P1

- `body { padding-bottom: 70px }` + a full-width fixed WhatsApp bar overlays the last content block and fights the cookie banner (it repositions via `body.cta-visible`). Consider a **compact pill** bottom-right on mobile instead of a full-width bar, and reduce to 56–60 px.
- Marquee tiles are `height: 300px` (fixed) — on a 360 px-wide phone a single tile fills the screen, so the "gallery" reads as a slideshow; scale height with viewport (`clamp(180px, 42vw, 320px)`).
- Hero: two overlay videos + logo + title on mobile is visually busy and expensive; drop the overlays below 768 px (already sized with `clamp`, but they still download 22 MB).
- Tap targets: chips (`.chip`, ~44 px) and review arrows (48 px) are fine, but footer links are bare 0.9 rem text with no padding (~17 px hit area) and the age checkbox is 20×20 px — both below the 24 px WCAG 2.5.8 minimum. Add padding to footer links and enlarge the checkbox to 24 px.
- Lightbox arrows sit directly on top of the photo with no scrim; on bright tattoo photos they disappear. Add a subtle backdrop/gradient.

### 5.5 Motion & attention — P1

- Auto-scrolling marquee + auto-advancing reviews (every 4 s) + scroll-distortion on artist galleries + 3 looping videos = no rest state anywhere. This hurts readability and vestibular comfort.
- No `prefers-reduced-motion` handling in `styles.css` at all (artist.css handles only the distortion). Add: disable marquee animation, disable review autoplay, stop video autoplay, keep fades short.
- Provide pause controls for the marquee and reviews slider (WCAG 2.2.2).

### 5.6 Empty/loading/error states — P2

- Every gallery image renders `assets/logo.png` (160 KB) as its placeholder — the same 160 KB logo is used 74 times. Use a 1–2 KB inline SVG or a 20 px blurred data-URI.
- Artist cards, reviews, and lightbox have no loading skeletons; a slow connection shows an empty white-ish block ("OUR ARTISTS" with nothing under it).
- Lightbox has no caption or artist credit — add the image's `alt` as a caption, plus a counter (3/37).

---

## 6. UI audit

| Area | Finding | Recommendation |
|---|---|---|
| Type scale | Bebas Neue at 11–16 vw for section titles creates a strong voice. Contrast is healthy: `#f4f4f4` on `#0a0a0a` ≈ 17:1, `--accent-color:#8a9a86` on `#0a0a0a` ≈ 6.6:1, footer `#999` ≈ 7:1 — all pass AA | Keep colours. Spend the effort on hierarchy (below) rather than palette |
| Hierarchy | Section titles are identical in weight/size so the page reads as one long poster; there is no visual "you are here" | Establish H2 vs H3 sizes, add section eyebrows/numbering, add generous spacing between sections |
| Gallery readability | 37 tiles at 300 px with `grayscale(20%)` hover-to-color is a nice idea, but no captions, no filtering, no categories | Add style filter chips (All / Fine line / Blackwork / Colour / Ornamental) and captions on hover/tap |
| Reviews | Cards are truncated by a horizontal scroller; no aggregate number; long quotes | Show avg rating + count, star row, "Read all on Google"; trim quotes to 2–3 lines with "more" |
| Booking | 4 steps with a thin progress bar; visually inconsistent with the brutalist gallery | Unify progress (step dots + labels), show selections as removable summary chips, add a final review screen |
| Footer | Strong brand block but `Sitemap.xml` as a user-facing link is developer-facing; no hours, no email, no privacy links | Replace with Hours / Privacy / Accessibility / Instagram / Google |
| 404 | Bare, one button | Add hero-ish 404 with logo, search of key sections (Artists, Work, Book), and the WhatsApp CTA |
| Cookie banner | Bottom-left card that shifts when the CTA appears; single "OK" | Two clear actions, link to policy, small dismiss; don't cover the CTA |
| Consistency | `h2`/`h3` footer headings differ across page types; three CSS files | Shared component layer (§4.3) |

---

## 7. Accessibility (WCAG 2.2 AA) — quick pass

| # | Sev | Issue | Fix |
|---|---|---|---|
| 42 | **P0** | **No visible focus indicator** anywhere except `.text-input:focus`. Keyboard users cannot see where they are. | Global `:focus-visible { outline: 2px solid #a3b29e; outline-offset: 3px }` |
| 43 | P1 | No skip link; hero and marquee come before main content in tab order. | Add "Skip to content" as the first focusable element. |
| 44 | P1 | Booking form inputs use **placeholder-only** labels (`#client-name`, `#placement-other`), and step headings aren't associated with their groups. | Real `<label>` (visually hidden if needed), `fieldset`/`legend` per step, `autocomplete="name"`. |
| 45 | P1 | Chips have no `aria-pressed`; step changes are not announced; `#progress-text` isn't `aria-live`. | `aria-pressed` on chips, `aria-live="polite"` on step status, move focus to the new step heading. |
| 46 | P1 | Lightbox is not a dialog: no `role="dialog"`, `aria-modal`, focus trap, or focus restore; `#lightbox-close` is just "×" with no `aria-label`; arrows have no labels. | Proper dialog pattern; Escape already works, keep it. |
| 47 | P1 | Infinite marquee + autoplaying carousels + autoplay video without pause (WCAG 2.2.2, 2.2.1). | Pause buttons; stop on `prefers-reduced-motion`. |
| 48 | P2 | 37 gallery images are in a non-lazy, continuously moving container — screen-reader users get a wall of images. | Mark the duplicated track `aria-hidden="true"` (already done) and wrap the first track in `<ul>` with a heading + link to the artist pages. |
| 49 | P2 | Map iframe has no `title`. | `title="Map showing SAGE Tattoo Studio, Eilat Street 22, Tel Aviv-Yafo"` |

---

## 8. Prioritized roadmap

### Phase 0 — This week (highest revenue + ranking impact, ~1 day total)

1. **Kill the video preloader** (`script.js:30-56`) → CSS fade only. *(P0, S)*
2. **Compress video**: hero loops ≤800 KB, drop the 21 MB clip, `preload="none"`, poster, no overlays <768 px. *(P0, M)*
3. **WebP + `srcset` + width/height** for the 37 homepage images and all artist galleries (script in §9). *(P0, M)*
4. **H1 + gallery heading + 150 words of real homepage copy** (styles, neighbourhood, walk-ins, hours). *(P0, S)*
5. **OG images 1200×630 per page** + `og:image:alt`. *(P0, S)*
6. **Sticky header nav** on all pages + "Book with {Artist}" on artist pages. *(P0, M)*
7. **Consent-gated GA4 + Decline button + privacy page.** *(P0, S)*
8. **Global `:focus-visible`, skip link, form labels.** *(P0, S)*
9. **Confirm the canonical business name** (SAGE vs "German") across site + GBP. *(P0, S — needs the owner)*

### Phase 1 — Next 2–3 weeks

10. Enrich JSON-LD to a single `@graph` with hours, priceRange, offers, `sameAs` (GBP), FAQ, artist `knowsAbout`/`sameAs`. *(P1, M)*
11. `openingHours`, price signal, deposit policy, directions block; mirror in GBP. *(P1, S)*
12. New pages: **/piercing/**, **/tattoo-prices/**, **/faq/**, and one style page (start with fine-line). Update sitemap + footer + internal links. *(P1, L)*
13. Booking v2: idea textarea, style chips, artist passthrough, review screen, email fallback, GA4 funnel events. *(P1, M)*
14. Static render reviews (first 3) + rating summary; pause + reduced-motion controls for marquee/reviews. *(P1, M)*
15. Self-host Inter subset; extract `base.css`; minify + cache-bust. *(P1, M)*
16. GSC + Bing verification, submit sitemap, add Image sitemap entries. *(P1, S)*

### Phase 2 — Month 2+

17. Artist page depth: signature projects, varied captions, Instagram embeds/links, prev/next navigation, per-artist booking. *(P1, L)*
18. Two more style pages (blackwork, ornamental) + a neighborhood/“first tattoo in Tel Aviv” post, then a monthly cadence. *(P2, ongoing)*
19. Hebrew version with `hreflang` (or bilingual FAQ/pricing block first). *(P2, L)*
20. Move to **Cloudflare** in front of GH Pages for Brotli/HTTP3/cache headers/image resizing; add Lighthouse CI on PRs. *(P2, M)*
21. Studio/About page with team story, hygiene standards, awards, press. *(P2, M)*

---

## 9. Reusable snippets & scripts

### 9.1 Enriched business schema (single graph)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TattooParlor",
      "@id": "https://sagetattoo.shop/#studio",
      "name": "SAGE Tattoo Studio",
      "url": "https://sagetattoo.shop/",
      "image": ["https://sagetattoo.shop/assets/images/1.jpg", "https://sagetattoo.shop/assets/images/4.jpg"],
      "logo": "https://sagetattoo.shop/assets/logo.png",
      "telephone": "+972526504348",
      "priceRange": "₪₪",
      "currenciesAccepted": "ILS",
      "paymentAccepted": "Cash, Credit Card, Bit",
      "address": { "@type": "PostalAddress", "streetAddress": "Eilat Street 22", "addressLocality": "Tel Aviv-Yafo", "addressRegion": "Tel Aviv District", "postalCode": "6608202", "addressCountry": "IL" },
      "geo": { "@type": "GeoCoordinates", "latitude": 32.057106, "longitude": 34.762143 },
      "hasMap": "https://maps.google.com/?cid=…",
      "sameAs": ["https://www.instagram.com/sage.tattooshop/", "https://maps.google.com/?cid=…"],
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Sunday","Monday","Tuesday","Wednesday","Thursday"], "opens": "11:00", "closes": "20:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "10:00", "closes": "15:00" }
      ],
      "makesOffer": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Custom Tattoo" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Piercing" } }
      ],
      "potentialAction": { "@type": "ReserveAction", "target": "https://wa.me/972526504348" }
    },
    { "@type": "WebSite", "@id": "https://sagetattoo.shop/#website", "url": "https://sagetattoo.shop/", "name": "SAGE Tattoo Studio Tel Aviv", "publisher": { "@id": "https://sagetattoo.shop/#studio" } }
  ]
}
</script>
```

### 9.2 Image pipeline (sharp, run manually or in CI)

```bash
npm i -D sharp-cli
# WebP at 3 widths for homepage + artist galleries
for f in assets/images/*.jpg assets/artists/*/*.jpg; do
  for w in 480 960 1440; do
    npx sharp -i "$f" -o "${f%.jpg}-${w}.webp" resize $w webp quality 72
  done
done
```

Then in markup:

```html
<img src="assets/images/1-960.webp"
     srcset="assets/images/1-480.webp 480w, assets/images/1-960.webp 960w, assets/images/1-1440.webp 1440w"
     sizes="(max-width: 767px) 60vw, 300px"
     width="1170" height="1560" loading="lazy" decoding="async"
     alt="Fine line floral tattoo on the forearm — SAGE Tel Aviv">
```

### 9.3 Video transcode target

```bash
ffmpeg -i in.mp4 -vf "scale=-2:720,fps=30" -c:v libx264 -crf 30 -preset slow \
  -movflags +faststart -an out.mp4   # aim ≤800 KB for a 8s loop
```

### 9.4 Preloader replacement

```js
// remove assetsToLoad / progress logic entirely
window.addEventListener('load', () => {
  const p = document.getElementById('preloader');
  if (!p) return;
  p.classList.add('fade-out');
  setTimeout(() => p.remove(), 600);
});
```

Plus a `<noscript>` style that hides `#preloader` so no-JS visitors are never blocked.

### 9.5 Link/SEO check to add to CI

```bash
# fails the build on broken internal links, missing meta, duplicate titles
npx html-validate "**/*.html"
npx --yes broken-link-checker -r http://127.0.0.1:8123
```

---

## 10. How to know it worked

| Metric | Now | Target (30 days) |
|---|---|---|
| Homepage transfer | 8.37 MB | < 1.2 MB |
| LCP (mobile field) | unknown — install CrUX via GSC | < 2.5 s (p75) |
| CLS | > 0.1 likely (83 images without dims) | < 0.05 |
| Indexable landing pages | 7 | 12 (then 20) |
| GSC impressions / clicks | baseline needed | +30% clicks |
| Booking funnel completion | unmeasured | instrument, then +20% |
| WhatsApp taps / week | unmeasured | instrument, then +25% |

Set up GSC **before** Phase 0 so the baseline exists, and add CrUX/Lighthouse runs after each phase.

---

## 11. Implementation log — Phase 0 (2026-11-25)

Phase 0 is implemented in the working tree. Measured on the same local server, cold cache, Chromium Performance API:

| Metric | Before | After |
|---|---|---|
| Homepage transfer | **8.37 MB** | **0.70 MB** (−92%) |
| Requests | 46 | 17 |
| LCP | 532 ms paint, load 2 691 ms (preloader up to 5 s) | **443 ms** LCP, load 602 ms |
| Video shipped | 68 MB repo, 21 MB clip in rotation | **3.8 MB** of 8 s / 720p loops (~300 KB each) |
| Homepage images | 5.4 MB JPG, 84 `<img>`, none sized | 163 KB WebP served, 36 images in HTML, intrinsic dimensions |
| Images missing `width` | 83 | 0 (except the dynamic lightbox image) |
| Artist page (Groc) | 5.8 MB of images | **0.27 MB** first load, images stream in on scroll |
| Social card | 1170×1554 portrait | 1200×630 per page + `og:image:alt` |

What changed:

- **Preloader removed** (`index.html`, `script.js`, `styles.css`); content paints immediately. Hero clip now starts from `requestIdleCallback` with `preload="none"` and a 30 KB poster, and is skipped for `prefers-reduced-motion`, `save-data` or 2G.
- **Video pipeline** (`tools/optimize-media.mjs`): 12 hero loops at 720p/8 s/CRF 31 (193–400 KB) and two 480p overlay clips (150 KB).
- **Image pipeline**: WebP at 480/960 from every gallery source, `<img srcset sizes width height loading=decoding>` markup generated by `tools/build-markup.mjs`. Duplicate marquee track is now cloned at runtime, so crawlers see each image once.
- **Logo / about-strip / artist profiles** converted to WebP (157 KB → 43 KB, 293 KB → 65 KB, 300 KB → 22 KB).
- **H1** is now “SAGE — Tattoo Studio in Tel Aviv” (visually unchanged); the gallery gained a short visible `h2` only — the explanatory paragraph was removed at the owner's request.
- **Sticky site navigation** on the homepage and a “Book” / “Book with {Artist}” CTA (pre-filled WhatsApp message) on every artist page.
- **Consent Mode v2**: GA4 is not fetched until Accept; Decline is a real option; both write `sage_cookie_consent`. Conversion events added: `booking_request`, `whatsapp_cta_click`, `tel_click`, `artist_card_click`, `nav_click`.
- **Google Map** is a direct embed again (owner's call) with a “Get directions” link and an iframe `title`.
- **Google reviews link** now points at `search.google.com/local/reviews?placeid=…` instead of a session-tracked search URL, so it opens the studio's review list in the visitor's own language and no Arabic/other localized query text appears.
- **Hero video** is restored to the previous behaviour: autoplay, muted, looping, a random clip per visit, plus a fallback chain (compressed loop → the original small tracked clip) and an auto-resume guard if a mobile browser pauses it. There is no play/pause control — the owner asked for it to be removed — so the WCAG 2.2.2 pause affordance does **not** apply here and would need revisiting if that changes.
- **Schema**: single `@graph` with `@id`, `alternateName`, `priceRange`, `currenciesAccepted`, `paymentAccepted`, `makesOffer` (tattoo/piercing/gallery), `ReserveAction`, and a linked `WebSite` node. Artist pages reference the same studio `@id` and use “SAGE Tattoo Studio”.
- **Accessibility**: global `:focus-visible`, skip link, real (visually hidden) form labels, `autocomplete`, `aria-pressed` chips, `aria-live` step status, dialog semantics + labelled controls in the lightbox, marquee/review autoplay respect reduced motion, marquee pauses off-screen and in background tabs.
- **Housekeeping**: `privacy.html`, enhanced `404.html`, privacy links in every footer, `?v=` cache-busting on css/js, image-sitemap entry, `theme-color`, `docs/` + `tools/` + `.gitignore`.

Still open from this document (needs owner input or a follow-up phase):

- Business hours, deposit policy and `openingHoursSpecification` — no hours are published anywhere yet (§3.3 #9, §3.5 #22).
- Whether “German” (named in the reviews) is still on the team (§3.5 #21).
- Google Business Profile URL for `sameAs`; Search Console verification.
- Pricing / piercing / FAQ / style pages (§3.4 #16) and static review rendering.
- Self-hosting Inter, splitting `base.css`, Cloudflare in front of Pages.
