function setupCarousel() {
    const carouselContainer = document.querySelector(".logos-carousel-container");
    if (!carouselContainer) return;

    // Check for user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    carouselContainer.querySelectorAll(".logos-slide").forEach((scroller) => {
        const scrollerInner = scroller.querySelector(".grayscale-logos");
        if (!scrollerInner) return;

        // Clone elements for the infinite loop effect
        const scrollerContent = Array.from(scrollerInner.children);
        scrollerContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute("aria-hidden", true);
            scrollerInner.appendChild(duplicatedItem);
        });

        // Add the attribute to trigger the animation from CSS, unless motion is disabled
        if (!prefersReducedMotion) {
            scroller.setAttribute("data-animated", "true");
        }
    });

    console.log("Tech stack carousel initialized.");
}