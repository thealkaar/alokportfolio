/* ═══════════════════════════════════════════════════
   ALOK KUMAR — Scroll Sequence Engine
   Video scrubbing + GSAP + Lenis
   ═══════════════════════════════════════════════════ */

// ── INIT GSAP PLUGINS ──────────────────────────────
gsap.registerPlugin(ScrollTrigger);
if (typeof Draggable !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

// ── LENIS SMOOTH SCROLLING ──────────────────────────
let lenis;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 0.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ── CUSTOM CURSOR ──────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
const cursorMedia = document.getElementById('cursor-media');
const cursorMediaImg = document.getElementById('cursor-media-img');

let mouseX = -100, mouseY = -100;
let followerX = -100, followerY = -100;
let mediaFollowerX = -100, mediaFollowerY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  }
});

function animateCursor() {
  followerX += (mouseX - followerX) * 0.18;
  followerY += (mouseY - followerY) * 0.18;
  if (follower) {
    follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
  }

  // Cursor media preview inertia (works page)
  if (cursorMedia && cursorMedia.classList.contains('active')) {
    mediaFollowerX += (mouseX - mediaFollowerX) * 0.12;
    mediaFollowerY += (mouseY - mediaFollowerY) * 0.12;
    const deltaX = mouseX - mediaFollowerX;
    const rotateVal = gsap.utils.clamp(-15, 15, deltaX * 0.08);
    cursorMedia.style.transform = `translate(${mediaFollowerX - 210}px, ${mediaFollowerY - 130}px) rotate(${rotateVal}deg)`;
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Default hover states
document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
  el.addEventListener('mouseenter', () => follower?.classList.add('hover'));
  el.addEventListener('mouseleave', () => follower?.classList.remove('hover'));
});

// Works page cursor media loader
document.querySelectorAll('.works-page-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const imageUrl = item.dataset.image;
    if (cursorMediaImg && imageUrl) cursorMediaImg.src = imageUrl;
    if (cursorMedia) {
      cursorMedia.classList.add('active');
      if (mediaFollowerX === -100) { mediaFollowerX = mouseX; mediaFollowerY = mouseY; }
    }
    if (follower) follower.style.opacity = '0';
  });
  item.addEventListener('mouseleave', () => {
    if (cursorMedia) cursorMedia.classList.remove('active');
    if (follower) follower.style.opacity = '1';
  });
});

// ── MAGNETIC INTERACTION ───────────────────────────
document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  });
});

// ── CURSOR HOVER ON PLAYGROUND PROFILE CARDS ─────
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('mouseenter', () => {
    if (follower) {
      follower.classList.add('hover');
    }
  });
  link.addEventListener('mouseleave', () => {
    if (follower) {
      follower.classList.remove('hover');
    }
  });
});

// ══════════════════════════════════════════════════════
// ── SCROLL-CONTROLLED VIDEO SEQUENCE (INDEX PAGE) ────
// ══════════════════════════════════════════════════════
const scrollVideo = document.getElementById('scroll-video');

if (scrollVideo) {
  const loader = document.getElementById('loader');
  const loaderCounter = document.getElementById('loader-counter');

  function waitForVideoFrame() {
    return new Promise((resolve) => {
      const cleanup = () => {
        scrollVideo.removeEventListener('loadeddata', onLoaded);
        scrollVideo.removeEventListener('error', onError);
      };
      const onLoaded = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        console.error('Failed to load homepage video:', scrollVideo.error);
        resolve(false);
      };

      if (scrollVideo.readyState >= 2) {
        resolve(true);
        return;
      }

      scrollVideo.addEventListener('loadeddata', onLoaded);
      scrollVideo.addEventListener('error', onError);
    });
  }

  // ── SCROLL SECTIONS ENGINE ──────────────────────────
  function animateScrollSections() {
    // Nav entrance
    gsap.from('.nav', { y: -40, opacity: 0, duration: 0.8, ease: 'power4.out' });

    // Scroll progress bar
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        }
      });
    }

    // Play the video once on the first downward scroll; reset only at the page top.
    const scrollSections = gsap.utils.toArray('.scroll-section');
    scrollVideo.pause();
    let lastScrollY = window.scrollY;
    let playbackStarted = false;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        if (playbackStarted || scrollVideo.currentTime > 0) {
          scrollVideo.pause();
          scrollVideo.currentTime = 0;
        }
        playbackStarted = false;
      } else if (currentScrollY > lastScrollY && !playbackStarted) {
        playbackStarted = true;
        scrollVideo.play().catch((error) => {
          playbackStarted = false;
          console.error('Failed to play homepage video:', error);
        });
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // ── Scroll section text animations ──
    scrollSections.forEach((section) => {
      const title = section.querySelector('.scroll-section-title');
      const desc = section.querySelector('.scroll-section-desc');

      if (title) {
        gsap.fromTo(title,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            }
          }
        );
      }

      if (desc) {
        gsap.fromTo(desc,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            delay: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            }
          }
        );
      }
    });
  }

  async function initVideoSequence() {
    const videoLoaded = await waitForVideoFrame();
    if (loaderCounter) loaderCounter.textContent = videoLoaded ? '100' : '!';

    if (loader) {
      loader.classList.add('done');
      setTimeout(() => {
        loader.style.display = 'none';
        animateScrollSections();
      }, 800);
    } else {
      animateScrollSections();
    }
  }

  initVideoSequence();

} else {
  // ══════════════════════════════════════════════════
  // ── NON-INDEX PAGES (works, about, contact, etc) ─
  // ══════════════════════════════════════════════════
  const loader = document.getElementById('loader');
  if (loader) {
    const loaderCounter = document.getElementById('loader-counter');
    let count = { val: 0 };
    gsap.to(count, {
      val: 100,
      duration: 2.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (loaderCounter) loaderCounter.textContent = Math.floor(count.val);
      },
      onComplete: () => {
        loader.classList.add('done');
        setTimeout(() => {
          loader.style.display = 'none';
          animateHero();
        }, 800);
      }
    });
  } else {
    animateHero();
  }
}

// ══════════════════════════════════════════════════════
// ── SHARED ANIMATIONS (ALL PAGES) ────────────────────
// ══════════════════════════════════════════════════════

// ── Hero entrance (non-canvas pages) ──
function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  if (document.querySelector('.hero-line-inner')) {
    tl.to('.hero-line-inner', { y: 0, duration: 1.2, stagger: 0.12 });
  }
  if (document.querySelector('.hero-tag')) {
    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 0.6 }, '-=0.6');
  }
  if (document.querySelector('.hero-bottom')) {
    tl.to('.hero-bottom', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
  }
  if (document.querySelector('.hero-image-wrapper')) {
    tl.to('.hero-image-wrapper', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.8');
  }

  tl.call(startTypewriter, [], '-=0.5');
  gsap.from('.nav', { y: -40, opacity: 0, duration: 0.8, ease: 'power4.out' });
}

// ── Typewriter ──
const roles = ['Web Developer', 'Problem Solver', 'DSA Enthusiast', 'Creative Builder', 'Team Leader'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const heroRole = document.getElementById('hero-role');

function startTypewriter() { if (heroRole) type(); }

function type() {
  const current = roles[roleIndex];
  if (!isDeleting) {
    if (heroRole) heroRole.textContent = '> ' + current.slice(0, charIndex + 1) + '_';
    charIndex++;
    if (charIndex === current.length) {
      setTimeout(() => { isDeleting = true; type(); }, 2000);
      return;
    }
    setTimeout(type, 70);
  } else {
    if (heroRole) heroRole.textContent = '> ' + current.slice(0, charIndex - 1) + '_';
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, 35);
  }
}

// ── Scroll reveals ──
document.querySelectorAll('[data-reveal]').forEach(el => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    },
    opacity: 1, y: 0, duration: 0.9, ease: 'power4.out',
  });
});

// ── Stat counters ──
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    duration: 2,
    ease: 'power2.out',
    onUpdate: function () { el.textContent = Math.floor(this.progress() * target); },
  });
});

// ── Project hover color ──
document.querySelectorAll('.project-item').forEach(item => {
  const color = item.dataset.color;
  if (color) {
    item.addEventListener('mouseenter', () => {
      gsap.to(item.querySelector('.project-name'), { color, duration: 0.3 });
      gsap.to(item.querySelector('.project-arrow'), { color, duration: 0.3 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item.querySelector('.project-name'), { color: '#f5f5f5', duration: 0.3 });
      gsap.to(item.querySelector('.project-arrow'), { color: '#333', duration: 0.3 });
    });
  }
});

// ── Marquee speed change on scroll ──
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion && canHover) {
  const tiltTargets = document.querySelectorAll('.skills-card, .course-card, .project-item, .contact-link');
  tiltTargets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateX: relY * -4,
        rotateY: relX * 5,
        y: -4,
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 900,
        transformOrigin: 'center',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.55)',
        clearProps: 'transform',
      });
    });
  });

  document.querySelectorAll('.skill-pill, .footer-social-link, .mobile-link').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { y: -3, scale: 1.035, duration: 0.28, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { y: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.55)' });
    });
  });
}

if (document.querySelector('.marquee-section')) {
  ScrollTrigger.create({
    trigger: '.marquee-section',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const speed = 1 + Math.abs(self.getVelocity()) / 5000;
      gsap.to('.marquee-track', { animationDuration: `${20 / speed}s`, overwrite: true });
    }
  });
}

// ── Hero parallax (non-canvas pages) ──
if (document.querySelector('.hero-image')) {
  gsap.to('.hero-image', {
    yPercent: 15,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });
}

// ── Draggable playground canvas ──
const playgroundCanvas = document.getElementById('playground-canvas');
if (playgroundCanvas && typeof Draggable !== 'undefined') {
  Draggable.create(playgroundCanvas, {
    type: 'x,y',
    edgeResistance: 0.4,
    bounds: {
      minX: -window.innerWidth * 1.5,
      maxX: 0,
      minY: -window.innerHeight * 1.5,
      maxY: 0,
    },
    inertia: true,
    onDragStart: function () { playgroundCanvas.style.cursor = 'grabbing'; },
    onDragEnd: function () { playgroundCanvas.style.cursor = 'grab'; },
  });

  Draggable.create('.playground-item', {
    bounds: playgroundCanvas,
    inertia: true,
    onDragStart: function (e) {
      e.stopPropagation();
      this.target.style.zIndex = 1000;
    },
    onDragEnd: function () { this.target.style.zIndex = ''; },
  });
}

// ── Mobile menu ──
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuBtn.classList.toggle('active');
  });
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.classList.remove('active');
    });
  });
}

// ── Active nav link highlight ──
const currentPath = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
  const linkPath = link.getAttribute('href');
  if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
    link.classList.add('active');
  }
});
