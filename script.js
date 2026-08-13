// --- Random hero background video ---
const HERO_VIDEO_OPTIONS = ['1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4'];
const HERO_VIDEO_DIR = 'assets/videos/random/';
const DEFAULT_HERO_VIDEO = HERO_VIDEO_OPTIONS[0];
const heroVideo = document.getElementById('hero-bg-video');

function setHeroVideoSource(src) {
    if (!heroVideo) return;
    while (heroVideo.firstChild) {
        heroVideo.removeChild(heroVideo.firstChild);
    }
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    source.addEventListener('error', () => {
        if (src !== HERO_VIDEO_DIR + DEFAULT_HERO_VIDEO) {
            setHeroVideoSource(HERO_VIDEO_DIR + DEFAULT_HERO_VIDEO);
        }
    });
    heroVideo.appendChild(source);
    heroVideo.load();
}

if (heroVideo) {
    const randomIndex = Math.floor(Math.random() * HERO_VIDEO_OPTIONS.length);
    setHeroVideoSource(HERO_VIDEO_DIR + HERO_VIDEO_OPTIONS[randomIndex]);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    const preloaderProgress = document.getElementById('preloader-progress');

    const assetsToLoad = [
        { type: 'video', el: document.getElementById('hero-bg-video') },
        { type: 'video', el: document.getElementById('hero-cv-1') },
        { type: 'video', el: document.getElementById('hero-cv-2') },
        { type: 'image', el: document.getElementById('hero-img') }
    ];

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;
    let isLoaded = false;

    function finishLoading() {
        if (isLoaded) return;
        isLoaded = true;
        if (preloaderProgress) preloaderProgress.style.width = '100%';
        setTimeout(() => {
            if (preloader) preloader.classList.add('fade-out');
        }, 300);
    }

    function updatePreloaderProgress() {
        loadedCount++;
        const percentage = (loadedCount / totalAssets) * 100;
        if (preloaderProgress) preloaderProgress.style.width = `${percentage}%`;
        if (loadedCount >= totalAssets) {
            finishLoading();
        }
    }

    // Fallback timeout (5 seconds)
    setTimeout(finishLoading, 5000);

    // Track each asset
    assetsToLoad.forEach(asset => {
        if (!asset.el) {
            updatePreloaderProgress();
            return;
        }

        if (asset.type === 'video') {
            if (asset.el.readyState >= 3) { // HAVE_FUTURE_DATA
                updatePreloaderProgress();
            } else {
                asset.el.addEventListener('canplaythrough', updatePreloaderProgress, { once: true });
                asset.el.addEventListener('error', updatePreloaderProgress, { once: true });
            }
        } else if (asset.type === 'image') {
            if (asset.el.complete) {
                updatePreloaderProgress();
            } else {
                asset.el.addEventListener('load', updatePreloaderProgress, { once: true });
                asset.el.addEventListener('error', updatePreloaderProgress, { once: true });
            }
        }
    });

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
        progressText.textContent = `${currentStep}/${totalSteps}`;
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
            chip.addEventListener('click', () => {
                // Remove selected from all
                chips.forEach(c => c.classList.remove('selected'));
                // Add to clicked
                chip.classList.add('selected');

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

        // Redirect
        window.location.href = waUrl;
    });

    // --- Gallery & Lightbox Logic ---
    const marqueeContainer = document.querySelector('.marquee-container');
    const marqueeContent = document.querySelector('.marquee-content');
    const galleryImages = Array.from(marqueeContent.querySelectorAll('img'));

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

    function animateMarquee() {
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

    // Start auto-scroll
    setTimeout(() => {
        animationId = requestAnimationFrame(animateMarquee);
    }, 100);

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
                    openLightbox(idx % uniqueImages.length);
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
    const uniqueImages = galleryImages.slice(0, galleryImages.length / 2);

    function openLightbox(index) {
        currentLightboxIndex = index;
        lightboxImg.src = uniqueImages[currentLightboxIndex].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNextImage() {
        currentLightboxIndex = (currentLightboxIndex + 1) % uniqueImages.length;
        lightboxImg.src = uniqueImages[currentLightboxIndex].src;
    }

    function showPrevImage() {
        currentLightboxIndex = (currentLightboxIndex - 1 + uniqueImages.length) % uniqueImages.length;
        lightboxImg.src = uniqueImages[currentLightboxIndex].src;
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

    // --- Cookie Policy Banner Logic ---
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

    if (cookieBanner && cookieAcceptBtn) {
        // Show banner if consent hasn't been saved yet
        if (!localStorage.getItem('sage_cookie_consent')) {
            setTimeout(() => {
                cookieBanner.classList.remove('hidden');
            }, 600);
        }

        cookieAcceptBtn.addEventListener('click', () => {
            cookieBanner.classList.add('hidden');
            localStorage.setItem('sage_cookie_consent', 'accepted');
        });
    }

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

        reviewsSlider.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            dragStartX = e.clientX;
            dragStartScrollLeft = reviewsSlider.scrollLeft;
            reviewsSlider.setPointerCapture(e.pointerId);
            reviewsSlider.style.scrollBehavior = 'auto';
            stopAutoScroll();
        });

        reviewsSlider.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            reviewsSlider.scrollLeft = dragStartScrollLeft - (e.clientX - dragStartX);
        });

        function endReviewsDrag(e) {
            if (!isPointerDown) return;
            isPointerDown = false;
            if (reviewsSlider.hasPointerCapture(e.pointerId)) {
                reviewsSlider.releasePointerCapture(e.pointerId);
            }
            reviewsSlider.style.scrollBehavior = '';
            startAutoScroll();
        }

        reviewsSlider.addEventListener('pointerup', endReviewsDrag);
        reviewsSlider.addEventListener('pointercancel', endReviewsDrag);
        reviewsSlider.addEventListener('mouseenter', stopAutoScroll);
        reviewsSlider.addEventListener('mouseleave', startAutoScroll);

        startAutoScroll();
    }

    // Initialize
    updateProgress();
});
