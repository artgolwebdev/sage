document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll reveal animations (GSAP + ScrollTrigger) ---
    // Only opacity/transform are animated; all text is present in the DOM
    // from page load, so the page stays crawlable without JS.
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('[data-reveal]').forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        });
    }

    // --- Global WhatsApp CTA Visibility (same pattern as homepage) ---
    const globalCta = document.querySelector('.global-cta');
    const heroSection = document.getElementById('hero');

    if (globalCta && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
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
});
