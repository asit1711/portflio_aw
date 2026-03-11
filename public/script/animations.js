// animation.js
// Requires GSAP + ScrollTrigger loaded first
gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
  duration: 0.8,
  ease: "power2.out"
});

function setupHeroAnimation() {
  const heroTl = gsap.timeline({ delay: 0.3 });
  heroTl
    .fromTo("#hero-name", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    .fromTo("#hero-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
    .fromTo("#hero-tagline", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .fromTo(".cta-button-wrapper", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }, "-=0.3");

  const heroSection = document.getElementById('hero');
  const heroContentElements = ['#hero-name', '#hero-title', '#hero-tagline'];
  let parallaxTween;

  function handleMouseMove(e) {
    if (window.innerWidth <= 768) {
      if (parallaxTween) parallaxTween.kill();
      gsap.set(heroContentElements, { x: 0, y: 0 });
      return;
    }

    const { clientX, clientY } = e;
    const { offsetWidth, offsetHeight } = heroSection;
    const xPos = (clientX / offsetWidth - 0.5) * 25;
    const yPos = (clientY / offsetHeight - 0.5) * 15;

    parallaxTween = gsap.to(heroContentElements, {
      x: -xPos,
      y: -yPos,
      duration: 1.2,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  }

  let mmTimeout;
  heroSection.addEventListener('mousemove', (e) => {
    clearTimeout(mmTimeout);
    mmTimeout = setTimeout(() => handleMouseMove(e), 16);
  });

  heroSection.addEventListener('mouseleave', () => {
    if (window.innerWidth > 768) {
      gsap.to(heroContentElements, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }
  });

  if (window.innerWidth <= 768) {
    gsap.set(heroContentElements, { x: 0, y: 0 });
  }
}

function setupScrollAnimations() {
  // ensure plugin registered (safe if already registered)
  if (gsap && gsap.registerPlugin) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* already registered */ }
  }

  const defaultEase = 'power2.out';

  // helper to read data- attributes with fallback
  const getData = (el, name, fallback) => {
    const v = el.dataset[name];
    return v !== undefined ? (isNaN(v) ? v : parseFloat(v)) : fallback;
  };

  // MAIN: handle scroll-triggered single element animations
  gsap.utils.toArray('.animate-on-scroll').forEach(element => {
    // read common options from data- attrs
    const duration = getData(element, 'duration', 1);
    const delay = getData(element, 'delay', 0);
    const ease = getData(element, 'ease', defaultEase);
    const once = getData(element, 'once', 'true') === 'true';
    const start = element.dataset.start || 'top 85%';

    // baseline from values
    let fromVars = { opacity: 0 };
    let toVars = { opacity: 1, duration, delay, ease };

    // default translation (your original)
    let xFrom = 0, yFrom = 50, rotationFrom = 0, scaleFrom = 1, skewXFrom = 0;

    // class-based presets (add more as needed)
    if (element.classList.contains('fade-in-left')) { xFrom = -50; yFrom = 0; }
    if (element.classList.contains('fade-in-right')) { xFrom = 50; yFrom = 0; }
    if (element.classList.contains('slide-up')) { yFrom = 40; xFrom = 0; }
    if (element.classList.contains('slide-down')) { yFrom = -40; xFrom = 0; }
    if (element.classList.contains('zoom-in')) { scaleFrom = 0.75; yFrom = 0; }
    if (element.classList.contains('zoom-out')) { scaleFrom = 1.25; yFrom = 0; }
    if (element.classList.contains('rotate-in')) { rotationFrom = 45; }
    if (element.classList.contains('flip-in')) { rotationFrom = 180; }
    if (element.classList.contains('skew-in')) { skewXFrom = 12; }
    if (element.classList.contains('fade-in')) { xFrom = 0; yFrom = 0; }
    if (element.classList.contains('slide-left')) { xFrom = -60; yFrom = 0; }
    if (element.classList.contains('slide-right')) { xFrom = 60; yFrom = 0; }

    // assemble fromVars
    fromVars = {
      opacity: 0,
      x: xFrom,
      y: yFrom,
      rotation: rotationFrom,
      scale: scaleFrom,
      skewX: skewXFrom
    };

    // special case: staggered children
    if (element.classList.contains('stagger-children')) {
      const children = element.querySelectorAll('.stagger-child');
      if (children.length) {
        gsap.fromTo(children,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration, stagger: getData(element, 'stagger', 0.12),
            delay, ease,
            scrollTrigger: {
              trigger: element,
              start,
              toggleActions: 'play none none none',
              once
            }
          }
        );
        return; // done for this element
      }
    }

    // special: reveal by clip (typewriter / text reveal)
    if (element.classList.contains('reveal-clip')) {
      // make sure element has overflow hidden in CSS
      gsap.fromTo(element,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)', duration, delay, ease,
          scrollTrigger: { trigger: element, start, toggleActions: 'play none none none', once }
        }
      );
      return;
    }

    // special: svg stroke drawing (add 'draw-svg' on container or on svg itself)
    if (element.classList.contains('draw-svg')) {
      const paths = element.querySelectorAll('path, circle, line, polyline, rect');
      if (paths.length) {
        paths.forEach(p => {
          const len = p.getTotalLength ? p.getTotalLength() : 0;
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: getData(element, 'duration', 1.5),
          ease,
          stagger: getData(element, 'stagger', 0.06),
          scrollTrigger: { trigger: element, start, toggleActions: 'play none none none', once }
        });
        return;
      }
    }

    // finally do the normal fromTo for element
    gsap.fromTo(element, fromVars, {
      ...toVars,
      x: 0, y: 0, rotation: 0, scale: 1, skewX: 0,
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: 'play none none none',
        once
      }
    });
  });

  // --- RESTORED TIMELINE ANIMATION ---
  const timeline = document.querySelector('.education-timeline .timeline-line-container');
  if (timeline) {
    const line = timeline.querySelector('.timeline-line');
    const items = gsap.utils.toArray('.timeline-item');

    gsap.fromTo(line, { scaleY: 0, transformOrigin: 'top top' }, {
      scaleY: 1, duration: items.length * 0.6, ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: 1 }
    });
    items.forEach((item) => {
      gsap.fromTo(item, { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none', once: true }
      });
    });
  }

  gsap.utils.toArray('.skill-bar-inner').forEach(bar => {
    const level = bar.getAttribute('data-level') || '0%';
    gsap.fromTo(bar, { width: '0%' }, {
      width: level, duration: 1.5, ease: 'power2.inOut',
      scrollTrigger: { trigger: bar.closest('.skill-item'), start: 'top 90%', toggleActions: 'play none none none', once: true }
    });
  });

  const socialIcons = gsap.utils.toArray('.social-icon');
  socialIcons.forEach(icon => {
    const iconTween = gsap.to(icon, { scale: 1.2, rotation: 5, color: 'var(--accent-primary)', duration: 0.2, ease: 'power1.inOut', paused: true });
    icon.addEventListener('mouseenter', () => iconTween.play());
    icon.addEventListener('mouseleave', () => iconTween.reverse());
  });

  // SECONDARY: infinite / loop animations (not scroll-dependent)
  // Examples: .loop-rotate, .pulse, .float
  gsap.utils.toArray('.loop-rotate').forEach(el => {
    const dur = getData(el, 'duration', 8);
    const ease = getData(el, 'ease', 'none');
    gsap.to(el, { rotation: 360, duration: dur, repeat: -1, ease });
  });

  gsap.utils.toArray('.pulse').forEach(el => {
    const dur = getData(el, 'duration', 1.2);
    const scaleTo = getData(el, 'scale', 1.05);
    const yoyo = getData(el, 'yoyo', 'true') === 'true';
    gsap.to(el, { scale: scaleTo, duration: dur, repeat: -1, yoyo, ease: 'sine.inOut' });
  });

  gsap.utils.toArray('.float').forEach(el => {
    const dist = getData(el, 'distance', 10);
    const dur = getData(el, 'duration', 3);
    gsap.to(el, { y: `+=${dist}`, duration: dur, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });

  // OPTIONAL: stagger-in-view for lists (use .list-stagger & children .item)
  gsap.utils.toArray('.list-stagger').forEach(list => {
    const items = list.querySelectorAll('.item');
    if (!items.length) return;
    gsap.fromTo(items, { y: 20, opacity: 0 }, {
      y: 0, opacity: 1, duration: getData(list, 'duration', 0.8),
      stagger: getData(list, 'stagger', 0.12),
      ease: getData(list, 'ease', defaultEase),
      scrollTrigger: {
        trigger: list,
        start: list.dataset.start || 'top 85%',
        once: list.dataset.once !== 'false'
      }
    });
  });

  // If you want to refresh ScrollTrigger when images/fonts load:
  if (typeof ScrollTrigger !== 'undefined') {
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
}

let openMenuTl;

function setupMobileMenuAnimation() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = gsap.utils.toArray('.mobile-nav-link');
  const hamburgerLines = gsap.utils.toArray('.hamburger-line');

  openMenuTl = gsap.timeline({ paused: true, reversed: true });
  openMenuTl
    .set(mobileNav, { display: 'flex' })
    .to(mobileNav, { x: '0%', duration: 0.4, ease: 'power2.inOut' })
    .to(hamburgerLines[0], { rotate: 45, y: 8, duration: 0.3 }, 0)
    .to(hamburgerLines[1], { opacity: 0, duration: 0.3 }, 0)
    .to(hamburgerLines[2], { rotate: -45, y: -8, duration: 0.3 }, 0)
    .fromTo(mobileNavLinks, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power1.out' }, "-=0.2")
    .eventCallback("onReverseComplete", () => {
      gsap.set(mobileNav, { display: 'none' });
    });

  menuToggle.addEventListener('click', () => {
    openMenuTl.reversed() ? openMenuTl.play() : openMenuTl.reverse();
    document.body.classList.toggle('no-scroll', !openMenuTl.reversed());
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!openMenuTl.reversed()) {
        openMenuTl.reverse();
        document.body.classList.remove('no-scroll');
      }
    });
  });
}

window.closeMobileMenu = function () {
  return new Promise((resolve) => {
    if (openMenuTl && !openMenuTl.reversed()) {
      openMenuTl.eventCallback("onReverseComplete", () => {
        gsap.set(document.getElementById('mobile-nav'), { display: 'none' });
        document.body.classList.remove('no-scroll');
        openMenuTl.eventCallback("onReverseComplete", null);
        resolve();
      });
      openMenuTl.reverse();
    } else {
      resolve();
    }
  });
};