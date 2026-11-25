// --- Hero background video (loaded after paint, never blocks content) ---
// Each slot prefers the compressed loop and falls back to the original clip
// that has always shipped with the site, so a missing file never kills the hero.
const HERO_VIDEO_COUNT = 12;
const heroCandidates = (n) => [
    `assets/videos/hero/${n}.mp4`,
    // Small tracked clip from the original site, used only if the compressed
    // file is missing from the deployment.
    'assets/videos/random/1.mp4'
];
const OVERLAY_CANDIDATES = [
    ['assets/videos/overlay/2.mp4'],
    ['assets/videos/overlay/3.mp4']
];
const heroVideo = document.getElementById('hero-bg-video');
const connection = navigator.connection || {};
const saveData = Boolean(connection.saveData);
const slowConnection = /(^|-)2g$/.test(connection.effectiveType || '');
const allowMotion = !saveData && !slowConnection;

function attemptPlay(video) {
    if (!video) return Promise.resolve(false);
    const p = video.play();
    if (!p || typeof p.catch !== 'function') return Promise.resolve(true);
    return p.then(() => true).catch(() => false);
}

/** Point the element at a file and resolve once it can actually play. */
function loadVideo(video, src) {
    return new Promise((resolve) => {
        let settled = false;
        const finish = (ok) => {
            if (settled) return;
            settled = true;
            video.removeEventListener('canplay', onReady);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('error', onError);
            clearTimeout(timer);
            resolve(ok);
        };
        const onReady = () => finish(true);
        const onError = () => finish(false);
        // Never let a stalled request block the hero forever.
        const timer = setTimeout(() => finish(video.readyState >= 2), 8000);

        video.addEventListener('canplay', onReady);
        video.addEventListener('loadeddata', onReady);
        video.addEventListener('error', onError);

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.preload = 'auto';
        video.src = src;
        video.load();
    });
}

async function playVideoWithFallbacks(video, preferredSrc, fallbacks) {
    const candidates = [preferredSrc, ...fallbacks];
    for (const src of candidates) {
        if (!src) continue;
        // eslint-disable-next-line no-await-in-loop
        const ready = await loadVideo(video, src);
        if (!ready) continue;
        // eslint-disable-next-line no-await-in-loop
        if (await attemptPlay(video)) return true;
    }
    return false;
}

async function startHeroMedia(force) {
    const canPlay = force || allowMotion;
    if (!heroVideo) return;

    if (canPlay && !heroVideo.currentSrc) {
        const pick = Math.floor(Math.random() * HERO_VIDEO_COUNT) + 1;
        const candidates = heroCandidates(pick);
        const ok = await playVideoWithFallbacks(heroVideo, candidates[0], candidates.slice(1));
        if (!ok) console.warn('[hero] video could not start; poster stays visible');
    }

    // Decorative overlay clips: every viewport, but never on save-data.
    if (canPlay) {
        document.querySelectorAll('.chaotic-video').forEach(async (video) => {
            if (video.currentSrc) return;
            const pair = OVERLAY_CANDIDATES[Number(video.dataset.index || 0)] || [];
            const ok = await playVideoWithFallbacks(video, pair[0], pair.slice(1));
            if (!ok) video.hidden = true;
        });
    }
}

// Chrome/Safari sometimes pause a muted loop on their own (power saving, no
// focus, backgrounding). Nudge it back to playing, throttled.
let heroAutoResumes = 0;
let lastHeroResume = 0;

function resumeHeroIfPaused() {
    if (!heroVideo || heroVideo.ended) return;
    if (!heroVideo.paused || !heroVideo.currentSrc) return;
    const now = Date.now();
    if (now - lastHeroResume < 2000 || heroAutoResumes >= 20) return;
    lastHeroResume = now;
    heroAutoResumes += 1;
    attemptPlay(heroVideo);
}

if (heroVideo) {
    heroVideo.addEventListener('pause', () => {
        if (document.hidden) return;
        setTimeout(resumeHeroIfPaused, 250);
    });
}

// One tap/scroll anywhere also starts the hero on browsers that refuse muted
// autoplay (iOS Low Power Mode is the common one).
['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((eventName) => {
    window.addEventListener(eventName, resumeHeroIfPaused, { once: true, passive: true });
});

// Some browsers pause background video on their own when a tab is hidden or
// the page loses the compositor. Resume it when the visitor comes back.
document.addEventListener('visibilitychange', () => {
    if (document.hidden || !allowMotion) return;
    [heroVideo, ...document.querySelectorAll('.chaotic-video')].forEach((video) => {
        if (video && video.currentSrc && video.paused && video.readyState >= 2) {
            attemptPlay(video);
        }
    });
});

/** Start the hero as soon as the markup is parsed (this script sits at the
 *  end of <body>), without waiting on the idle queue. */
startHeroMedia(false);

document.addEventListener('DOMContentLoaded', () => {
    // --- Analytics helper: one place for conversion events ---
    function track(name, params) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params || {});
        }
    }

    // --- Booking Form Logic ---
    const form = document.getElementById('booking-form');
    const steps = document.querySelectorAll('.form-step');
    const progressIndicator = document.getElementById('progress-indicator');
    const progressText = document.getElementById('progress-text');

    let currentStep = 1;
    const totalSteps = steps.length;

    // State object to hold form data
    const formData = {
        placement: '',
        size: '',
        name: ''
    };

    // Update progress UI
    function updateProgress() {
        const percentage = (currentStep / totalSteps) * 100;
        progressIndicator.style.width = `${percentage}%`;
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
    }

    // Show specific step
    function showStep(stepNumber) {
        steps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        updateProgress();
        validateCurrentStep();
    }

    // Next / Prev Button Listeners
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // --- Step 1 & 2: Chip Selection Logic ---
    function setupChips(groupId, dataKey) {
        const group = document.getElementById(groupId);
        const chips = group.querySelectorAll('.chip');
        const nextBtn = group.closest('.form-step').querySelector('.next-btn');

        chips.forEach(chip => {
            chip.setAttribute('aria-pressed', 'false');
            chip.addEventListener('click', () => {
                // Remove selected from all
                chips.forEach(c => {
                    c.classList.remove('selected');
                    c.setAttribute('aria-pressed', 'false');
                });
                // Add to clicked
                chip.classList.add('selected');
                chip.setAttribute('aria-pressed', 'true');

                const val = chip.getAttribute('data-value');
                formData[dataKey] = val;

                // Specific logic for "Other" placement
                if (groupId === 'placement-group') {
                    const otherInput = document.getElementById('placement-other');
                    if (val === 'Other') {
                        otherInput.classList.remove('hidden');
                        otherInput.focus();
                        formData[dataKey] = otherInput.value.trim();
                    } else {
                        otherInput.classList.add('hidden');
                    }
                }

                validateCurrentStep();
            });
        });
    }

    setupChips('placement-group', 'placement');
    setupChips('size-group', 'size');

    // Handle "Other" placement input
    const placementOtherInput = document.getElementById('placement-other');
    placementOtherInput.addEventListener('input', (e) => {
        formData.placement = e.target.value.trim();
        validateCurrentStep();
    });

    // Handle Name Input
    const nameInput = document.getElementById('client-name');
    nameInput.addEventListener('input', (e) => {
        formData.name = e.target.value.trim();
        validateCurrentStep();
    });

    // Handle Checkbox
    const ageVerify = document.getElementById('age-verify');
    ageVerify.addEventListener('change', () => {
        validateCurrentStep();
    });

    // --- Validation Logic ---
    function validateCurrentStep() {
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        const nextBtn = currentStepEl.querySelector('.next-btn');
        const submitBtn = currentStepEl.querySelector('.submit-btn');

        let isValid = false;

        if (currentStep === 1) {
            isValid = formData.placement !== '';
        } else if (currentStep === 2) {
            isValid = formData.size !== '';
        } else if (currentStep === 3) {
            isValid = formData.name !== '';
        } else if (currentStep === 4) {
            isValid = ageVerify.checked;
        }

        if (nextBtn) nextBtn.disabled = !isValid;
        if (submitBtn) submitBtn.disabled = !isValid;
    }

    // --- Form Submit ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Final verification
        if (!ageVerify.checked) return;

        // Construct WhatsApp URL
        const phone = '972526504348';
        const rawMessage = `Hi! I'm interested in a tattoo.\nPlacement: ${formData.placement}\nSize: ${formData.size}\nName: ${formData.name}`;
        const encodedMessage = encodeURIComponent(rawMessage);
        const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

        track('booking_request', {
            placement: formData.placement,
            size: formData.size
        });

        // Redirect
        window.location.href = waUrl;
    });

    // --- Artists Section ---
    const ARTISTS = [
        {
            name: 'Groc',
            imageSrc: 'assets/artists/groc/profile-480.webp',
            pageUrl: 'artists/groc.html',
            alt: 'Groc, tattoo artist at Sage Tattoo Studio, Tel Aviv',
            title: 'Groc - Tattoo Artist - Sage Tattoo Studio Tel Aviv'
        },
        {
            name: 'Sunches',
            imageSrc: 'assets/artists/sunches/profile-480.webp',
            pageUrl: 'artists/sunches.html',
            alt: 'Sunches, tattoo artist in Tel Aviv at Sage Tattoo Studio',
            title: 'Sunches - Tattoo Artist - Sage Tattoo Studio Tel Aviv'
        },
        {
            name: 'Gosha',
            imageSrc: 'assets/artists/gosha/profile-480.webp',
            pageUrl: 'artists/gosha.html',
            alt: 'Gosha, American Traditional tattoo artist in Tel Aviv at Sage Tattoo Studio',
            title: 'Gosha - American Traditional Tattoo Artist Tel Aviv - Sage Tattoo Studio'
        },
        {
            name: 'Lion',
            imageSrc: 'assets/artists/lion/profile-480.webp',
            pageUrl: 'artists/lion.html',
            alt: 'Lion, dark organic and engraved black tattoo artist in Tel Aviv at Sage Tattoo Studio',
            title: 'Lion - Dark Organic Tattoo Artist Tel Aviv - Sage Tattoo Studio'
        },
        {
            name: 'Sean Misiuk',
            imageSrc: 'assets/artists/sean/profile-480.webp',
            pageUrl: 'artists/sean.html',
            alt: 'Sean Misiuk, ornamental tattoo artist in Tel Aviv at Sage Tattoo Studio',
            title: 'Sean Misiuk - Ornamental Tattoo Artist Tel Aviv - Sage Tattoo Studio'
        }
    ];

    const artistsGrid = document.getElementById('artists-grid');
    if (artistsGrid) {
        const fragment = document.createDocumentFragment();
        ARTISTS.forEach((artist, i) => {
            const card = document.createElement('a');
            card.className = 'artist-card';
            card.href = artist.pageUrl;
            card.dataset.index = i;

            card.addEventListener('click', () => track('artist_card_click', { artist: artist.name }));

            card.innerHTML = `
                <span class="artist-card-bigname">${artist.name}</span>
                <div class="artist-card-block"></div>
                <div class="artist-card-image">
                    <img class="artist-profile lazy-profile" src="${artist.imageSrc}" alt="${artist.alt}" width="480" height="480" loading="lazy" decoding="async">
                    <img class="artist-card-logo" src="assets/logo-96.webp" alt="" aria-hidden="true" width="96" height="96" loading="lazy">
                </div>
                <span class="artist-card-name">${artist.name}</span>
                <span class="artist-card-btn">See More</span>
            `;
            fragment.appendChild(card);
        });
        artistsGrid.appendChild(fragment);
    }

    // --- Artist profile reveal ---
    const artistProfiles = artistsGrid
        ? Array.from(artistsGrid.querySelectorAll('img.lazy-profile'))
        : [];
    artistProfiles.forEach((img) => {
        const done = () => img.classList.add('loaded');
        if (img.complete && img.naturalWidth > 0) {
            done();
        } else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        }
    });

    // --- Gallery & Lightbox Logic ---
    const marqueeContainer = document.querySelector('.marquee-container');
    const marqueeContent = document.querySelector('.marquee-content');
    const galleryImages = Array.from(marqueeContent.querySelectorAll('img'));

    // --- Reveal tiles as they decode (CSS blur placeholder until then) ---
    function reveal(img) {
        const done = () => img.classList.add('loaded');
        if (img.complete && img.naturalWidth > 0) {
            done();
            return;
        }
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
    }
    galleryImages.forEach(reveal);

    // --- Duplicate the track once at runtime for the seamless loop.
    //     The HTML only carries one set, so the document stays light and
    //     crawlers never see duplicated images. ---
    galleryImages.forEach((img, i) => {
        const clone = img.cloneNode(true);
        clone.setAttribute('alt', '');
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('loading', 'lazy');
        clone.dataset.cloneOf = String(i);
        marqueeContent.appendChild(clone);
        reveal(clone);
    });

    // --- About-strip background image: lazy load via CSS custom property ---
    const aboutSection = document.querySelector('.about-strip');
    if (aboutSection && 'IntersectionObserver' in window) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.setProperty('--about-bg', 'url(assets/about-strip-960.webp)');
                    entry.target.classList.add('bg-loaded');
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
        aboutObserver.observe(aboutSection);
    } else if (aboutSection) {
        aboutSection.style.setProperty('--about-bg', 'url(assets/about-strip-960.webp)');
        aboutSection.classList.add('bg-loaded');
    }

    let currentTranslate = 0;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    let animationId = null;
    let resumeTimeout = null;
    let autoScrollSpeed = 1; // pixels per frame

    // The width of half the content is the loop point.
    function getHalfWidth() {
        return marqueeContent.scrollWidth / 2;
    }

    let marqueeRunning = false;

    function animateMarquee() {
        if (!marqueeRunning) return;

        if (!isDragging) {
            currentTranslate -= autoScrollSpeed;
        }

        const halfWidth = getHalfWidth();

        // Loop boundary checks
        if (currentTranslate <= -halfWidth) {
            currentTranslate += halfWidth;
        } else if (currentTranslate > 0) {
            currentTranslate -= halfWidth;
        }

        marqueeContent.style.transform = `translateX(${currentTranslate}px)`;
        animationId = requestAnimationFrame(animateMarquee);
    }

    function startMarquee() {
        if (!allowMotion || marqueeRunning) return;
        marqueeRunning = true;
        animationId = requestAnimationFrame(animateMarquee);
    }

    function stopMarquee() {
        marqueeRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Only animate while the strip is on screen and the tab is visible.
    if (allowMotion && 'IntersectionObserver' in window) {
        const marqueeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => (entry.isIntersecting ? startMarquee() : stopMarquee()));
        }, { rootMargin: '150px' });
        marqueeObserver.observe(marqueeContainer);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopMarquee();
        else if (allowMotion) startMarquee();
    });

    function pauseAutoScroll() {
        isDragging = true;
        clearTimeout(resumeTimeout);
    }

    function resumeAutoScroll() {
        // We set dragging to false in the timeout to resume
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            isDragging = false;
        }, 2000);
    }

    // Pointer events for dragging
    let hasDragged = false;
    let clickTarget = null;

    marqueeContainer.addEventListener('pointerdown', (e) => {
        pauseAutoScroll();
        startX = e.clientX;
        prevTranslate = currentTranslate;
        hasDragged = false;
        clickTarget = e.target;
        marqueeContainer.setPointerCapture(e.pointerId);
    });

    marqueeContainer.addEventListener('pointermove', (e) => {
        if (!isDragging || !marqueeContainer.hasPointerCapture(e.pointerId)) return;
        const deltaX = e.clientX - startX;
        currentTranslate = prevTranslate + deltaX;
        // Apply immediately so dragging still works with reduced motion.
        marqueeContent.style.transform = `translateX(${currentTranslate}px)`;

        if (Math.abs(deltaX) > 5) {
            hasDragged = true;
        }
    });

    marqueeContainer.addEventListener('pointerup', (e) => {
        if (isDragging) {
            marqueeContainer.releasePointerCapture(e.pointerId);
            resumeAutoScroll();

            // Handle click/tap here because setPointerCapture suppresses native click events on children
            if (!hasDragged && clickTarget && clickTarget.tagName.toLowerCase() === 'img') {
                const idx = galleryImages.indexOf(clickTarget);
                if (idx > -1) {
                    openLightbox(idx);
                } else if (clickTarget.dataset.cloneOf !== undefined) {
                    openLightbox(Number(clickTarget.dataset.cloneOf));
                }
            }
        }
    });

    marqueeContainer.addEventListener('pointercancel', (e) => {
        if (isDragging) {
            marqueeContainer.releasePointerCapture(e.pointerId);
            resumeAutoScroll();
        }
    });

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentLightboxIndex = 0;
    const uniqueImages = galleryImages;

    function fullSrc(index) {
        const img = uniqueImages[index];
        return img.dataset.full || img.currentSrc || img.src;
    }

    function openLightbox(index) {
        currentLightboxIndex = index;
        lightboxImg.src = fullSrc(currentLightboxIndex);
        lightboxImg.alt = uniqueImages[currentLightboxIndex].alt;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus({ preventScroll: true });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showNextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % uniqueImages.length;
        lightboxImg.src = fullSrc(currentLightboxIndex);
        lightboxImg.alt = uniqueImages[currentLightboxIndex].alt;
    }

    function showPrevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + uniqueImages.length) % uniqueImages.length;
        lightboxImg.src = fullSrc(currentLightboxIndex);
        lightboxImg.alt = uniqueImages[currentLightboxIndex].alt;
    }

    galleryImages.forEach((img) => {
        img.ondragstart = () => false; // Prevent native browser drag
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // --- Global WhatsApp CTA Visibility (Hidden on Hero, Visible on all other sections) ---
    const globalCta = document.querySelector('.global-cta');
    const heroSection = document.getElementById('hero');

    if (globalCta && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // When hero section is intersecting, hide CTA button; show on all other sections
                if (entry.isIntersecting) {
                    globalCta.classList.remove('visible');
                    document.body.classList.remove('cta-visible');
                } else {
                    globalCta.classList.add('visible');
                    document.body.classList.add('cta-visible');
                }
            });
        }, {
            threshold: 0.1
        });

        heroObserver.observe(heroSection);
    }

    // --- Consent banner: analytics only loads after an explicit accept ---
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
    const cookieDeclineBtn = document.getElementById('cookie-decline-btn');

    function readConsent() {
        try {
            return localStorage.getItem('sage_cookie_consent');
        } catch (e) {
            return null;
        }
    }

    function saveConsent(value) {
        try {
            localStorage.setItem('sage_cookie_consent', value);
        } catch (e) { /* private mode */ }
    }

    if (cookieBanner) {
        if (!readConsent()) {
            setTimeout(() => {
                cookieBanner.classList.remove('hidden');
            }, 600);
        }

        if (cookieAcceptBtn) {
            cookieAcceptBtn.addEventListener('click', () => {
                cookieBanner.classList.add('hidden');
                saveConsent('accepted');
                if (typeof window.__sageLoadAnalytics === 'function') {
                    window.__sageLoadAnalytics();
                }
            });
        }

        if (cookieDeclineBtn) {
            cookieDeclineBtn.addEventListener('click', () => {
                cookieBanner.classList.add('hidden');
                saveConsent('declined');
            });
        }
    }

    // --- Conversion tracking ---
    document.querySelectorAll('.global-cta').forEach((link) => {
        link.addEventListener('click', () => track('whatsapp_cta_click', { location: 'floating' }));
    });

    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
        link.addEventListener('click', () => track('tel_click'));
    });

    document.querySelectorAll('a[href="#booking"], a[href="#artists"]').forEach((link) => {
        link.addEventListener('click', () => track('nav_click', { target: link.getAttribute('href') }));
    });

    // --- Reviews Slider Logic ---
    const REVIEWS = [
        { name: 'Sheena Strimling', rating: 5, text: "German is an absolute legend. Top-tier tattoo artist and logo designer with insane attention to detail. Amazing service, great vibes, and a clean, stylish studio. You feel comfortable from the first moment. Highly recommended" },
        { name: 'ofek cohen', rating: 5, text: "The most professional in town. Special styles, pleasant approach, and a reasonable price. Not like all the other artists you're used to! These are real artists from the ground !" },
        { name: 'ביג לידור', rating: 5, text: 'Studio of the highest level. The tattoo artist is simply an artist. He sat with me on the sketch, made sure everything was exactly as I wanted and the hygiene there was simply uncompromising.' },
        { name: 'Concep.t', rating: 5, text: 'I got a tattoo and it came out just perfect 🔥 Rare service, precise work and a killer atmosphere. Thank you for the professional attitude and the result that I can\'t stop looking at, a huge thank you to German for professionalism on a level you don\'t see every day.' },
        { name: 'lin tebul', rating: 5, text: 'A stunning place with people who are above expectations (; Attitude, service and professionalism 10/10 Many studios in Tel Aviv can learn from such service (: I will definitely come back and recommend (: ' },
        { name: 'תומר דבש', rating: 5, text: 'Artistic, fair, talented and invested place. The staff is nice and smiling with a thousand patience. Very happy with the tattoo. I will be back next winter.' }
    ];

    const reviewsSlider = document.getElementById('reviews-slider');
    const reviewsTrack = document.getElementById('reviews-track');
    const reviewsPrev = document.getElementById('reviews-prev');
    const reviewsNext = document.getElementById('reviews-next');

    if (reviewsSlider && reviewsTrack && reviewsPrev && reviewsNext) {
        const fragment = document.createDocumentFragment();

        REVIEWS.forEach((review) => {
            const card = document.createElement('article');
            card.className = 'review-card';
            card.setAttribute('dir', 'ltr');

            const stars = document.createElement('div');
            stars.className = 'review-stars';
            stars.setAttribute('role', 'img');
            stars.setAttribute('aria-label', `Rated ${review.rating} out of 5 stars`);
            stars.textContent = '★'.repeat(review.rating);

            const text = document.createElement('p');
            text.className = 'review-text';
            text.textContent = review.text;

            const meta = document.createElement('footer');
            meta.className = 'review-meta';

            const name = document.createElement('span');
            name.className = 'review-name';
            name.setAttribute('dir', 'auto');
            name.textContent = review.name;

            const source = document.createElement('span');
            source.className = 'review-source';
            source.textContent = 'Google Review';

            meta.appendChild(name);
            meta.appendChild(source);
            card.appendChild(stars);
            card.appendChild(text);
            card.appendChild(meta);
            fragment.appendChild(card);
        });

        reviewsTrack.appendChild(fragment);

        const pageStep = () => reviewsSlider.clientWidth;
        const maxScroll = () => reviewsTrack.scrollWidth - reviewsSlider.clientWidth;

        let autoScrollTimer = null;

        function stopAutoScroll() {
            if (autoScrollTimer) {
                clearInterval(autoScrollTimer);
                autoScrollTimer = null;
            }
        }

        function startAutoScroll() {
            stopAutoScroll();
            autoScrollTimer = setInterval(() => {
                if (reviewsSlider.scrollLeft >= maxScroll() - 2) {
                    reviewsSlider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    reviewsSlider.scrollTo({ left: reviewsSlider.scrollLeft + pageStep(), behavior: 'smooth' });
                }
            }, 4000);
        }

        reviewsPrev.addEventListener('click', () => {
            const target = Math.max(0, reviewsSlider.scrollLeft - pageStep());
            reviewsSlider.scrollTo({ left: Math.min(target, maxScroll()), behavior: 'smooth' });
            startAutoScroll();
        });

        reviewsNext.addEventListener('click', () => {
            const target = Math.min(maxScroll(), reviewsSlider.scrollLeft + pageStep());
            reviewsSlider.scrollTo({ left: target, behavior: 'smooth' });
            startAutoScroll();
        });

        let isPointerDown = false;
        let dragStartX = 0;
        let dragStartScrollLeft = 0;
        let resumeTimeout = null;

        function scheduleAutoScroll() {
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(startAutoScroll, 8000);
        }

        reviewsSlider.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            dragStartX = e.clientX;
            dragStartScrollLeft = reviewsSlider.scrollLeft;
            if (e.pointerType === 'mouse') {
                reviewsSlider.setPointerCapture(e.pointerId);
            }
            reviewsSlider.style.scrollBehavior = 'auto';
            stopAutoScroll();
        });

        reviewsSlider.addEventListener('pointermove', (e) => {
            if (!isPointerDown || e.pointerType !== 'mouse') return;
            reviewsSlider.scrollLeft = dragStartScrollLeft - (e.clientX - dragStartX);
        });

        function endReviewsDrag(e) {
            if (!isPointerDown) return;
            isPointerDown = false;
            if (reviewsSlider.hasPointerCapture(e.pointerId)) {
                reviewsSlider.releasePointerCapture(e.pointerId);
            }
            reviewsSlider.style.scrollBehavior = '';
            scheduleAutoScroll();
        }

        reviewsSlider.addEventListener('pointerup', endReviewsDrag);
        reviewsSlider.addEventListener('pointercancel', endReviewsDrag);
        reviewsSlider.addEventListener('mouseenter', stopAutoScroll);
        reviewsSlider.addEventListener('mouseleave', scheduleAutoScroll);
        reviewsSlider.addEventListener('focusin', stopAutoScroll);
        reviewsSlider.addEventListener('focusout', scheduleAutoScroll);

        if (allowMotion) startAutoScroll();
    }

    // --- Sticky navigation background once the hero is passed ---
    const siteNav = document.getElementById('site-nav');
    if (siteNav) {
        const syncNav = () => siteNav.classList.toggle('is-scrolled', window.scrollY > 80);
        syncNav();
        window.addEventListener('scroll', syncNav, { passive: true });
    }

    // Initialize
    updateProgress();
});
