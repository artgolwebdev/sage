(function () {
    // ===================================================================
    // Static artist page behaviors.
    // All artist content is baked into each static HTML file; this file only
    // adds runtime polish: lazy gallery reveal, WhatsApp CTA scroll visibility,
    // and the scroll stretch/distortion gallery effect.
    // ===================================================================

    var gallery = document.getElementById('artist-gallery-grid');

    // --- Lazy reveal (real <img src> stays in the HTML for SEO; the
    //     .lazy class holds a blurred logo-style placeholder until the
    //     image is near the viewport, then reveals it with .loaded) ---
    // Note: these images use a real <img src> (no data-src swap), so the
    // blur-up placeholder must always be cleared once the image is loaded.
    // If an image is already complete when first observed (cached / loaded
    // before this callback ran), its 'load' event has already fired and the
    // listener below would never run — so mark it sharp immediately instead
    // of leaving it stuck in the blurred .lazy placeholder state.
    var lazyImages = gallery ? gallery.querySelectorAll('img.lazy') : [];
    if ('IntersectionObserver' in window) {
        var lazyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var img = entry.target;
                if (img.complete && img.naturalWidth > 0) {
                    img.classList.add('loaded');
                    lazyObserver.unobserve(img);
                    return;
                }
                img.addEventListener('load', function () {
                    img.classList.add('loaded');
                    lazyObserver.unobserve(img);
                }, { once: true });
                img.addEventListener('error', function () {
                    img.classList.add('loaded');
                    lazyObserver.unobserve(img);
                }, { once: true });
                lazyObserver.unobserve(img);
            });
        }, { rootMargin: '400px' });
        lazyImages.forEach(function (img) { lazyObserver.observe(img); });
    } else {
        lazyImages.forEach(function (img) { img.classList.add('loaded'); });
    }

    // ===================================================================
    // WhatsApp button: scroll-direction visibility (artist pages only)
    // - Hidden by default on page load
    // - Scroll down → button appears
    // - Scroll up → button hides
    // - Near top of page (scrollY < 80) → always hidden
    // - RAF-throttled, delta threshold prevents trackpad jitter flicker
    // ===================================================================
    var cta = document.querySelector('.global-cta');

    if (cta) {
        cta.classList.remove('visible');

        var ctaPrevY = window.scrollY;
        var ctaRafPending = false;
        var ctaDirection = 0;
        var ctaThreshold = 10;
        var ctaShown = false;

        function ctaTick() {
            ctaRafPending = false;

            var y = window.scrollY;
            var delta = y - ctaPrevY;
            ctaPrevY = y;

            if (Math.abs(delta) < 2) return;

            if (y < 80) {
                if (ctaShown) {
                    cta.classList.remove('visible');
                    ctaShown = false;
                }
                ctaDirection = 0;
                return;
            }

            if (Math.abs(delta) >= ctaThreshold) {
                ctaDirection = delta > 0 ? 1 : -1;
            }

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
    var allDistortImages = gallery ? gallery.querySelectorAll('img.distort') : [];
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

        var stiffness = 0.14;
        var damping = 0.72;
        var velSmooth = 0.18;
        var maxSkew = 7;
        var maxScaleY = 1.06;
        var maxBrightness = 1.18;
        var maxContrast = 1.12;
        var skewGain = 0.55;
        var scaleGain = 0.006;
        var brightGain = 0.004;
        var contrastGain = 0.003;
        var settleEps = 0.008;

        function distortTick() {
            var y = window.scrollY;
            var delta = y - distortPrevY;
            distortPrevY = y;

            globalVel = globalVel * damping + delta * velSmooth;

            visibleImages.forEach(function (img) {
                var d = imgState.get(img);
                if (!d) return;

                var rect = img.getBoundingClientRect();
                var viewH = window.innerHeight;
                var imgMid = rect.top + rect.height * 0.5;
                var normDist = (imgMid - viewH * 0.5) / (viewH * 0.5);
                var posFactor = 1.0 - Math.abs(normDist) * 0.5;
                posFactor = Math.max(0.25, Math.min(1.0, posFactor));

                var vel = globalVel * posFactor;

                d.velocity = d.velocity * damping + vel * (1 - damping);

                var tSkew = Math.max(-maxSkew, Math.min(maxSkew, d.velocity * skewGain));
                var tScale = 1 + Math.min(Math.abs(d.velocity) * scaleGain, maxScaleY - 1);
                var tBright = 1 + Math.min(Math.abs(d.velocity) * brightGain, maxBrightness - 1);
                var tContrast = 1 + Math.min(Math.abs(d.velocity) * contrastGain, maxContrast - 1);

                d.skew += (tSkew - d.skew) * stiffness;
                d.scaleY += (tScale - d.scaleY) * stiffness;
                d.brightness += (tBright - d.brightness) * stiffness;
                d.contrast += (tContrast - d.contrast) * stiffness;

                if (Math.abs(d.skew) < settleEps && Math.abs(d.scaleY - 1) < 0.0008) {
                    d.skew = 0;
                    d.scaleY = 1;
                    d.brightness = 1;
                    d.contrast = 1;
                }

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
