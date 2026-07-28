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

    // Initialize
    updateProgress();
});
