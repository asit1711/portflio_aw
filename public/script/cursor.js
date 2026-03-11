function setupCustomCursor() {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    if (!cursorDot || !cursorOutline) {
        console.warn('Custom cursor elements not found. Aborting setup.');
        return;
    }

    if (window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 768px)").matches) {
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
        return;
    }

    gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 });

    window.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;

        gsap.to(cursorDot, {
            x: clientX,
            y: clientY,
            duration: 0.1,
            ease: "power2.out"
        });

        gsap.to(cursorOutline, {
            x: clientX,
            y: clientY,
            duration: 0.4,
            ease: "power2.out"
        });
    });

    const handleMouseEnter = () => cursorOutline.classList.add('hovering');
    const handleMouseLeave = () => cursorOutline.classList.remove('hovering');

    function addHoverListeners() {
        const interactiveElements = document.querySelectorAll(
            'a, button, .project-card, .social-icon, .theme-toggle-btn, .menu-toggle-btn, .logos-slide img'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
            el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        });
    }

    document.body.addEventListener('mouseenter', () => {
        gsap.to([cursorDot, cursorOutline], { opacity: 1, duration: 0.3 });
    });

    document.body.addEventListener('mouseleave', () => {
        gsap.to([cursorDot, cursorOutline], { opacity: 0, duration: 0.3 });
    });

    addHoverListeners();
    console.log('Custom cursor initialized.');

    window.refreshCursorListeners = addHoverListeners;

}
