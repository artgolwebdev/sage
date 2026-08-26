(function () {
    // --- Resolve artist from URL ---
    var slug = new URLSearchParams(window.location.search).get('name');
    var artist = slug && ARTISTS_DATA[slug] ? ARTISTS_DATA[slug] : null;

    if (!artist) {
        document.body.innerHTML = '<div style="padding:4rem;text-align:center;color:#f4f4f4;font-family:Inter,sans-serif">' +
            '<h2 style="margin-bottom:1rem">Artist not found</h2>' +
            '<a href="../index.html" style="color:#8a9a86">Go back home</a></div>';
        return;
    }

    // --- Update page meta ---
    document.title = artist.name + ' - Tattoo Artist - Sage Tattoo Studio Tel Aviv';
    document.querySelector('meta[name="description"]')
        .setAttribute('content', artist.name + ' is a tattoo artist at Sage Tattoo Studio in Tel Aviv. View portfolio and book an appointment.');
    document.querySelector('link[rel="canonical"]')
        .setAttribute('href', 'https://sagetattoo.shop/artists/artist.html?name=' + slug);
    document.querySelector('meta[property="og:title"]')
        .setAttribute('content', artist.name + ' - Sage Tattoo Studio Tel Aviv');
    document.querySelector('meta[property="og:description"]')
        .setAttribute('content', artist.name + ' is a tattoo artist at Sage Tattoo Studio in Tel Aviv.');
    document.querySelector('meta[property="og:url"]')
        .setAttribute('content', 'https://sagetattoo.shop/artists/artist.html?name=' + slug);
    document.querySelector('meta[name="twitter:title"]')
        .setAttribute('content', artist.name + ' - Sage Tattoo Studio Tel Aviv');
    document.querySelector('meta[name="twitter:description"]')
        .setAttribute('content', artist.name + ' is a tattoo artist at Sage Tattoo Studio in Tel Aviv.');

    // --- Structured data (JSON-LD) for artist ---
    var artistJsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": artist.name,
        "jobTitle": "Tattoo Artist",
        "description": artist.bio,
        "image": "https://sagetattoo.shop/assets/artists/" + artist.slug + "/profile.png",
        "url": "https://sagetattoo.shop/artists/artist.html?name=" + slug,
        "worksFor": {
            "@type": "TattooParlor",
            "name": "SAGE",
            "url": "https://sagetattoo.shop/",
            "telephone": "+972526504348",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Eilat Street 22",
                "addressLocality": "Tel Aviv-Yaffo",
                "addressRegion": "Tel Aviv District",
                "addressCountry": "IL"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 32.05710607396655,
                "longitude": 34.76214307559135
            }
        }
    };
    var jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.textContent = JSON.stringify(artistJsonLd);
    document.head.appendChild(jsonLdScript);

    // --- BreadcrumbList structured data ---
    var breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sagetattoo.shop/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": artist.name + " - Tattoo Artist"
            }
        ]
    };
    var breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbJsonLd);
    document.head.appendChild(breadcrumbScript);

    // --- Populate header ---
    var headerImg = document.getElementById('artist-header-img');
    headerImg.src = artist.profileImage;
    headerImg.alt = artist.name + ', tattoo artist at Sage Tattoo Studio Tel Aviv';
    document.getElementById('artist-header-name').textContent = artist.name;

    // --- Populate hero ---
    document.getElementById('artist-hero-name').textContent = artist.name;
    document.getElementById('artist-hero-bio').textContent = artist.bio;

    // --- Build gallery ---
    var grid = document.getElementById('artist-gallery-grid');
    var fragment = document.createDocumentFragment();

    artist.galleryImages.forEach(function (img, i) {
        var item = document.createElement('div');
        item.className = 'artist-gallery-item';

        var altText = artist.altTemplates[i] || artist.name + ' tattoo work at Sage Tattoo Studio Tel Aviv';
        var titleText = artist.name + ' - Tel Aviv Tattoo Artist Work';

        item.innerHTML =
            '<img class="lazy distort" src="../assets/logo.png" data-src="../assets/artists/' +
            artist.slug + '/' + img + '" alt="' + altText + '" title="' + titleText +
            '" loading="lazy">';

        fragment.appendChild(item);
    });

    grid.appendChild(fragment);

    // --- Lazy loading ---
    var lazyImages = grid.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window) {
        var lazyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src;
                    img.addEventListener('load', function () {
                        img.classList.add('loaded');
                    }, { once: true });
                    img.addEventListener('error', function () {
                        img.classList.add('loaded');
                    }, { once: true });
                    lazyObserver.unobserve(img);
                }
            });
        }, { rootMargin: '400px' });
        lazyImages.forEach(function (img) { lazyObserver.observe(img); });
    } else {
        lazyImages.forEach(function (img) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }

    // ===================================================================
    // WhatsApp button: scroll-direction visibility (artist page only)
    // - Hidden by default on page load
    // - Scroll down → button appears
    // - Scroll up → button hides
    // - Near top of page (scrollY < 80) → always hidden
    // - RAF-throttled, delta threshold prevents trackpad jitter flicker
    // ===================================================================
    var cta = document.querySelector('.global-cta');

    if (cta) {
        // Ensure hidden on load (CSS default handles this, but be explicit)
        cta.classList.remove('visible');

        var ctaPrevY = window.scrollY;
        var ctaRafPending = false;
        var ctaDirection = 0; // 1 = down, -1 = up, 0 = neutral
        var ctaThreshold = 10; // minimum px delta before direction registers
        var ctaShown = false;

        function ctaTick() {
            ctaRafPending = false;

            var y = window.scrollY;
            var delta = y - ctaPrevY;
            ctaPrevY = y;

            // Ignore tiny deltas (trackpad jitter / momentum easing)
            if (Math.abs(delta) < 2) return;

            // Near top of page: always hidden
            if (y < 80) {
                if (ctaShown) {
                    cta.classList.remove('visible');
                    ctaShown = false;
                }
                ctaDirection = 0;
                return;
            }

            // Determine direction once threshold is crossed
            if (Math.abs(delta) >= ctaThreshold) {
                ctaDirection = delta > 0 ? 1 : -1;
            }

            // Apply: scroll down → show, scroll up → hide
            if (ctaDirection === 1 && !ctaShown) {
                cta.classList.add('visible');
                ctaShown = true;
            } else if (ctaDirection === -1 && ctaShown) {
                cta.classList.remove('visible');
                ctaShown = false;
            }
        }

        window.addEventListener('scroll', function () {
            if (!ctaRafPending) {
                ctaRafPending = true;
                requestAnimationFrame(ctaTick);
            }
        }, { passive: true });
    }

    // ===================================================================
    // Scroll distortion effect — BRUTALIST VERSION
    // Per-image, viewport-position-weighted, with filter punch
    // ===================================================================
    var allDistortImages = grid.querySelectorAll('img.distort');
    var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isReducedMotion && allDistortImages.length > 0) {
        var visibleImages = new Set();
        var imgState = new Map();

        allDistortImages.forEach(function (img) {
            imgState.set(img, {
                skew: 0,
                scaleY: 1,
                brightness: 1,
                contrast: 1,
                velocity: 0
            });
        });

        // Track which images are near viewport
        var imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visibleImages.add(entry.target);
                } else {
                    visibleImages.delete(entry.target);
                    var d = imgState.get(entry.target);
                    if (d) {
                        d.skew = 0;
                        d.scaleY = 1;
                        d.brightness = 1;
                        d.contrast = 1;
                        d.velocity = 0;
                        entry.target.style.transform = '';
                        entry.target.style.filter = '';
                    }
                }
            });
        }, { rootMargin: '300px 0px' });

        allDistortImages.forEach(function (img) { imgObserver.observe(img); });

        var distortPrevY = window.scrollY;
        var globalVel = 0;
        var distortRaf = null;

        // --- Tuning knobs ---
        var stiffness = 0.14;      // snappy onset
        var damping = 0.72;        // punchy spring-back
        var velSmooth = 0.18;      // velocity tracking responsiveness
        var maxSkew = 7;           // deg — big brutalist stretch
        var maxScaleY = 1.06;      // vertical stretch ceiling
        var maxBrightness = 1.18;  // filter punch at high velocity
        var maxContrast = 1.12;
        var skewGain = 0.55;       // how much velocity maps to skew
        var scaleGain = 0.006;     // how much velocity maps to scaleY
        var brightGain = 0.004;
        var contrastGain = 0.003;
        var settleEps = 0.008;     // snap-to-rest threshold

        function distortTick() {
            var y = window.scrollY;
            var delta = y - distortPrevY;
            distortPrevY = y;

            // Smooth global velocity
            globalVel = globalVel * damping + delta * velSmooth;

            visibleImages.forEach(function (img) {
                var d = imgState.get(img);
                if (!d) return;

                // --- Per-image position factor ---
                // Images near viewport center distort most, edges less
                var rect = img.getBoundingClientRect();
                var viewH = window.innerHeight;
                var imgMid = rect.top + rect.height * 0.5;
                var normDist = (imgMid - viewH * 0.5) / (viewH * 0.5); // -1..1
                var posFactor = 1.0 - Math.abs(normDist) * 0.5;
                posFactor = Math.max(0.25, Math.min(1.0, posFactor));

                var vel = globalVel * posFactor;

                // --- Per-image velocity tracking (own spring) ---
                d.velocity = d.velocity * damping + vel * (1 - damping);

                // --- Target transforms from velocity ---
                var tSkew = Math.max(-maxSkew, Math.min(maxSkew, d.velocity * skewGain));
                var tScale = 1 + Math.min(Math.abs(d.velocity) * scaleGain, maxScaleY - 1);
                var tBright = 1 + Math.min(Math.abs(d.velocity) * brightGain, maxBrightness - 1);
                var tContrast = 1 + Math.min(Math.abs(d.velocity) * contrastGain, maxContrast - 1);

                // --- Spring towards targets (snappy) ---
                d.skew += (tSkew - d.skew) * stiffness;
                d.scaleY += (tScale - d.scaleY) * stiffness;
                d.brightness += (tBright - d.brightness) * stiffness;
                d.contrast += (tContrast - d.contrast) * stiffness;

                // --- Snap to rest ---
                if (Math.abs(d.skew) < settleEps && Math.abs(d.scaleY - 1) < 0.0008) {
                    d.skew = 0;
                    d.scaleY = 1;
                    d.brightness = 1;
                    d.contrast = 1;
                }

                // --- Apply ---
                img.style.transform =
                    'skewY(' + d.skew.toFixed(3) + 'deg) scaleY(' + d.scaleY.toFixed(5) + ')';

                if (d.brightness > 1.01 || d.contrast > 1.01) {
                    img.style.filter =
                        'brightness(' + d.brightness.toFixed(4) + ') contrast(' + d.contrast.toFixed(4) + ')';
                } else {
                    img.style.filter = '';
                }
            });

            distortRaf = requestAnimationFrame(distortTick);
        }

        distortRaf = requestAnimationFrame(distortTick);

        // Pause when tab hidden
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(distortRaf);
                distortRaf = null;
            } else if (!distortRaf) {
                distortPrevY = window.scrollY;
                distortRaf = requestAnimationFrame(distortTick);
            }
        });
    }
})();
