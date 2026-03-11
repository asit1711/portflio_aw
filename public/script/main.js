document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio Initialized");
    let lenis;
    let swiper;

    function setupLenis() {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        console.log("Lenis initialized.");

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#' || !document.querySelector(targetId)) return;

                if (typeof window.closeMobileMenu === 'function' && document.body.classList.contains('no-scroll')) {
                    window.closeMobileMenu().then(() => {
                        lenis.scrollTo(targetId);
                    });
                } else {
                    lenis.scrollTo(targetId);
                }
            });
        });
    }

    function setupNavIndicator() {
        const navLinks = gsap.utils.toArray('.main-nav a');
        const navPill = document.querySelector('.nav-active-pill');

        if (!navLinks.length || !navPill) return;

        // Set initial position to be hidden
        gsap.set(navPill, { width: 0 });

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(navPill, {
                    width: link.offsetWidth,
                    left: link.offsetLeft,
                    duration: 0.4,
                    ease: 'power3.out'
                });
            });
        });

        document.querySelector('.main-nav').addEventListener('mouseleave', () => {
            const currentActiveLink = document.querySelector('.main-nav a.active');
            if (currentActiveLink) {
                gsap.to(navPill, {
                    width: currentActiveLink.offsetWidth,
                    left: currentActiveLink.offsetLeft,
                    duration: 0.4,
                    ease: 'power3.out'
                });
            } else {
                // If no link is active (like on the hero section), hide the pill
                gsap.to(navPill, {
                    width: 0,
                    duration: 0.4,
                    ease: 'power3.out'
                });
            }
        });
    }

    function setupNavScrollspy() {
        const sections = gsap.utils.toArray('section[id]');
        const navLinks = gsap.utils.toArray('.main-nav a');
        const navPill = document.querySelector('.nav-active-pill');

        if (!sections.length || !navLinks.length) return;

        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    const sectionId = section.getAttribute('id');
                    const correspondingLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);

                    if (self.isActive) {
                        navLinks.forEach(link => link.classList.remove('active'));

                        // Don't set any link as active on the hero section
                        if (sectionId === 'hero') {
                            gsap.to(navPill, {
                                width: 0,
                                duration: 0.4,
                                ease: 'power3.out'
                            });
                            return;
                        }

                        if (correspondingLink) {
                            correspondingLink.classList.add('active');
                            // Trigger pill animation to the active link
                            gsap.to(navPill, {
                                width: correspondingLink.offsetWidth,
                                left: correspondingLink.offsetLeft,
                                duration: 0.4,
                                ease: 'power3.out'
                            });
                        }
                    }
                }
            });
        });
    }

    // function initializeSwiper() {
    //     if (typeof Swiper === 'undefined') {
    //         console.error('Swiper library is not loaded.');
    //         return;
    //     }
    //     swiper = new Swiper('.swiper', {
    //         effect: 'coverflow',
    //         grabCursor: true,
    //         centeredSlides: true,
    //         slidesPerView: 'auto',
    //         loop: true,
    //         coverflowEffect: {
    //             rotate: 50,
    //             stretch: 0,
    //             depth: 100,
    //             modifier: 1,
    //             slideShadows: true,
    //         },
    //         pagination: {
    //             el: '.swiper-pagination',
    //             clickable: true,
    //         },
    //         navigation: {
    //             nextEl: '.swiper-button-next',
    //             prevEl: '.swiper-button-prev',
    //         },
    //         autoplay: {
    //             delay: 4000,
    //             disableOnInteraction: false,
    //         },
    //     });
    //     console.log("Project carousel initialized.");
    // }
    // function initProjectSection() {
    //     // This function is now called from api.js when DOM is loaded
    //     // Keeping it here for reference but the actual initialization happens in api.js
    //     console.log("Project section initialized");
    // }
    // initProjectSection();

    function setupBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            lenis ? lenis.scrollTo(0, { duration: 1.5 }) : window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupScrollProgressBar() {
        const progressBar = document.getElementById('scroll-progress-bar');
        if (!progressBar) return;

        const updateProgressBar = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        };

        window.addEventListener('scroll', updateProgressBar, { passive: true });
        // Also update on resize to handle content changes
        window.addEventListener('resize', updateProgressBar, { passive: true });
    }

    function initializeSite() {
        const currentYearSpan = document.getElementById('current-year');

        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        if (typeof initializeSecurityPopup === 'function') {
            initializeSecurityPopup();
        }

        setupLenis();
        setupBackToTopButton();
        setupScrollProgressBar();
        if (typeof setupClickSounds === 'function') {
            setupClickSounds();
        }
        if (typeof setupCustomCursor === 'function') setupCustomCursor();
        if (typeof setupCarousel === 'function') setupCarousel();

        setupHeroAnimation();
        setupMobileMenuAnimation(); // Restored
        setupScrollAnimations();
        setupNavIndicator(); // New
        setupNavScrollspy(); // New



        console.log("Site initialization complete.");
    }

    requestAnimationFrame(() => {
        setTimeout(initializeSite, 100);
    });

    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', function (event) {
        if (event.key === "F12" || (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase())) || (event.ctrlKey && event.key.toUpperCase() === 'U')) {
            event.preventDefault();
        }
    });
});
