/* ═══════════════════════════════════════════════════
   ALOK KUMAR — Premium 3D Scroll Sequence Engine
   Canvas frame scrubbing + GSAP + Lenis
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
    duration: 1.2,
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
// ── 3D CANVAS SCROLL SEQUENCE (INDEX PAGE ONLY) ─────
// ══════════════════════════════════════════════════════
const canvas3D = document.getElementById('3d-canvas');

if (canvas3D) {
  const ctx = canvas3D.getContext('2d');

  // ── Frame image paths (sorted by rotation angle: 0° → 360°) ──
  let frameFiles = [
    // ─── 0° FRONT (dead center) ───
    'public/Frontal_view_of_subject_2K_202607022247.jpeg',
    'public/Frontal_view_subject_photography_2K_202607022246.jpeg',
    'public/Frontal_view_of_subject_2K_202607022303.jpeg',
    'public/Frontal_view_subject_photography_2K_202607022304.jpeg',
    'public/Front_view_of_subject_2K_202607022304.jpeg',
    'public/Front_view_of_subject_2K_202607022304 (1).jpeg',

    // ─── ~20°–45° ANGLED (slight right turn) ───
    'public/Angled_view_of_subject_2K_202607022246.jpeg',
    'public/Angled_view_of_subject_2K_202607022302.jpeg',
    'public/Angled_view_of_subject_2K_202607022246 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022302 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022246 (2).jpeg',
    'public/Angled_view_of_subject_2K_202607022302 (2).jpeg',
    'public/Angled_view_of_subject_2K_202607022247.jpeg',
    'public/Angled_view_of_subject_2K_202607022303.jpeg',

    // ─── ~36°–60° THREE-QUARTERS ───
    'public/View_of_subject_36_degrees_202607022247.jpeg',
    'public/Three-quarters_view_portfolio_shot_2K_202607022247.jpeg',
    'public/Angled_view_of_subject_2K_202607022303 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022303 (2).jpeg',

    // ─── ~70°–90° SIDE PROFILE ───
    'public/Side-angled_view_of_subject_2K_202607022246.jpeg',
    'public/Side_profile_view_subject_2K_202607022247.jpeg',
    'public/Side_view_subject_90_degrees_202607022303.jpeg',
    'public/Side_view_of_subject_2K_202607022304.jpeg',

    // ─── ~120°–150° BACK-ANGLED ───
    'public/Back-angled_view_of_subject_2K_202607022246.jpeg',
    'public/Back-angled_view_of_subject_2K_202607022247.jpeg',
    'public/Back-angled_view_of_subject_2K_202607022247 (1).jpeg',
    'public/Back_view_subject_144_degrees_202607022304.jpeg',

    // ─── ~180° BACK (dead rear) ───
    'public/Back_view_of_subject_2K_202607022247.jpeg',
    'public/Back_view_of_subject_2K_202607022303.jpeg',
    'public/Back_view_of_subject_2K_202607022303 (1).jpeg',
    'public/View_from_behind_subject_2K_202607022304.jpeg',
    'public/Back_view_of_subject_2K_202607022304.jpeg',
    'public/Back_view_of_subject_2K_202607022304 (1).jpeg',

    // ─── ~240°–290° OPPOSITE SIDE (left profile) ───
    'public/Opposite_side_view_subject_2K_202607022246.jpeg',
    'public/Front_view_subject_288_rotation_202607022304.jpeg',
    'public/Opposite_front-angled_view_subject_2K_202607022246.jpeg',
  ];

  frameFiles = [
    // Front-facing frames first, then a gradual clockwise 360-degree turn.
    'public/Frontal_view_of_subject_2K_202607022247.jpeg',
    'public/Frontal_view_subject_photography_2K_202607022246.jpeg',
    'public/Frontal_view_of_subject_2K_202607022303.jpeg',
    'public/Frontal_view_subject_photography_2K_202607022304.jpeg',
    'public/Front_view_of_subject_2K_202607022304.jpeg',
    'public/Front_view_of_subject_2K_202607022304 (1).jpeg',
    'public/View_of_subject_36_degrees_202607022247.jpeg',
    'public/Three-quarters_view_portfolio_shot_2K_202607022247.jpeg',
    'public/Angled_view_of_subject_2K_202607022246.jpeg',
    'public/Angled_view_of_subject_2K_202607022246 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022246 (2).jpeg',
    'public/Angled_view_of_subject_2K_202607022247.jpeg',
    'public/Angled_view_of_subject_2K_202607022302.jpeg',
    'public/Angled_view_of_subject_2K_202607022302 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022302 (2).jpeg',
    'public/Angled_view_of_subject_2K_202607022303.jpeg',
    'public/Angled_view_of_subject_2K_202607022303 (1).jpeg',
    'public/Angled_view_of_subject_2K_202607022303 (2).jpeg',
    'public/Side-angled_view_of_subject_2K_202607022246.jpeg',
    'public/Side_profile_view_subject_2K_202607022247.jpeg',
    'public/Side_view_subject_90_degrees_202607022303.jpeg',
    'public/Side_view_of_subject_2K_202607022304.jpeg',
    'public/Back-angled_view_of_subject_2K_202607022246.jpeg',
    'public/Back-angled_view_of_subject_2K_202607022247.jpeg',
    'public/Back-angled_view_of_subject_2K_202607022247 (1).jpeg',
    'public/Back_view_subject_144_degrees_202607022304.jpeg',
    'public/Back_view_of_subject_2K_202607022247.jpeg',
    'public/Back_view_of_subject_2K_202607022303.jpeg',
    'public/Back_view_of_subject_2K_202607022303 (1).jpeg',
    'public/View_from_behind_subject_2K_202607022304.jpeg',
    'public/Back_view_of_subject_2K_202607022304.jpeg',
    'public/Back_view_of_subject_2K_202607022304 (1).jpeg',
    'public/Opposite_side_view_subject_2K_202607022246.jpeg',
    'public/Opposite_front-angled_view_subject_2K_202607022246.jpeg',
    'public/Front_view_subject_288_rotation_202607022304.jpeg',
    'public/Frontal_view_subject_photography_2K_202607022246.jpeg',
    'public/Frontal_view_of_subject_2K_202607022247.jpeg',
  ];

  const frameCount = frameFiles.length;
  const images = [];
  let imagesLoaded = 0;
  let currentFrameIndex = 0;
  let currentFrameFloat = 0; // fractional frame for smooth blending

  // ── Canvas sizing (retina-aware) ──
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas3D.width = window.innerWidth * dpr;
    canvas3D.height = window.innerHeight * dpr;
    canvas3D.style.width = window.innerWidth + 'px';
    canvas3D.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrame(currentFrameFloat);
  }

  // ── Draw a single image cover-fit ──
  function getCoverRect(img, canvasW, canvasH) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;
    let drawW, drawH, drawX, drawY;
    if (imgRatio > canvasRatio) {
      drawH = canvasH;
      drawW = drawH * imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    } else {
      drawW = canvasW;
      drawH = drawW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    }
    return { drawX, drawY, drawW, drawH };
  }

  function getContainRect(img, canvasW, canvasH) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const maxW = isMobile ? canvasW * 1.12 : canvasW;
    const maxH = isMobile ? canvasH * 0.68 : canvasH;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = (canvasW - drawW) / 2;
    const drawY = isMobile ? canvasH * 0.14 : (canvasH - drawH) / 2;
    return { drawX, drawY, drawW, drawH };
  }

  function drawImageCover(img, alpha) {
    if (!img || !img.complete) return;
    const canvasW = window.innerWidth;
    const canvasH = window.innerHeight;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      const bg = getCoverRect(img, canvasW, canvasH);
      ctx.save();
      ctx.globalAlpha = alpha * 0.42;
      ctx.filter = 'blur(18px) brightness(0.72) saturate(1.05)';
      ctx.drawImage(img, bg.drawX - 24, bg.drawY - 24, bg.drawW + 48, bg.drawH + 48);
      ctx.restore();

      const fg = getContainRect(img, canvasW, canvasH);
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, fg.drawX, fg.drawY, fg.drawW, fg.drawH);
      ctx.globalAlpha = 1.0;
      return;
    }

    const { drawX, drawY, drawW, drawH } = getCoverRect(img, canvasW, canvasH);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.globalAlpha = 1.0;
  }

  // ── Render with cross-fade blending between adjacent frames ──
  function renderFrame(frameFloat) {
    const canvasW = window.innerWidth;
    const canvasH = window.innerHeight;
    ctx.clearRect(0, 0, canvasW, canvasH);

    const floorIdx = Math.floor(frameFloat);
    const ceilIdx = Math.min(floorIdx + 1, frameCount - 1);
    const blend = frameFloat - floorIdx; // 0.0 – 1.0

    // Draw base frame at full opacity
    drawImageCover(images[floorIdx], 1.0);

    // Blend next frame on top if between two frames
    if (blend > 0.01 && ceilIdx !== floorIdx) {
      drawImageCover(images[ceilIdx], blend);
    }
  }

  // ── Preload all images ──
  const loader = document.getElementById('loader');
  const loaderCounter = document.getElementById('loader-counter');

  function preloadImages() {
    return new Promise((resolve) => {
      frameFiles.forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imagesLoaded++;
          // Update loader counter with real image progress
          const progress = Math.floor((imagesLoaded / frameCount) * 100);
          if (loaderCounter) loaderCounter.textContent = progress;
          if (imagesLoaded === frameCount) {
            resolve();
          }
        };
        img.onerror = () => {
          console.warn('Failed to load frame:', src);
          imagesLoaded++;
          if (imagesLoaded === frameCount) resolve();
        };
        images[i] = img;
      });
    });
  }

  // ── Boot sequence ──
  async function init3DSequence() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    await preloadImages();

    // Draw initial frame
    renderFrame(0);

    // Dismiss loader
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

  // ── ScrollTrigger: scrub frame index across full page scroll ──
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

    // Main frame scrubber — maps scroll progress to fractional frame index
    const scrollSections = gsap.utils.toArray('.scroll-section');
    // Calculate total scroll distance for smooth animation
    // Using fixed viewport height multiplier to show all frames smoothly
    const totalScrollHeight = window.innerHeight * 7.5;

    gsap.to({ frame: 0 }, {
      frame: frameCount - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: () => '+=' + totalScrollHeight,
        scrub: 0.08,
        pin: false,
      },
      onUpdate: function () {
        const frameFloat = this.targets()[0].frame;
        currentFrameFloat = frameFloat;
        currentFrameIndex = Math.round(frameFloat);
        renderFrame(frameFloat);
      }
    });

    // ── Scroll section text animations ──
    scrollSections.forEach((section, i) => {
      const title = section.querySelector('.scroll-section-title');
      const desc = section.querySelector('.scroll-section-desc');

      if (title) {
        // Fade IN
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          }
        });

        // Fade OUT (only for non-last sections)
        if (i < scrollSections.length - 1) {
          gsap.to(title, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: 'power2.in',
            scrollTrigger: {
              trigger: section,
              start: 'bottom 40%',
              toggleActions: 'play none none reverse',
            }
          });
        }
      }

      if (desc) {
        // Always show/hide description on scroll with reverse on scroll back
        gsap.to(desc, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'bottom 30%',
            toggleActions: 'play none none reverse',
          }
        });
      }
    });
  }

  // Fire the boot
  init3DSequence();

} else {
  // ══════════════════════════════════════════════════
  // ── NON-INDEX PAGES (works, about, contact, etc) ─
  // ══════════════════════════════════════════════════

  // Pre-loader (if present on a non-canvas page)
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

// ══════════════════════════════════════════════════════
// ── FOOTER SCROLL EFFECT (Canvas translation) ────────
// ══════════════════════════════════════════════════════
const footer = document.querySelector('footer.home-footer');
const canvasContainer = document.querySelector('.canvas-container');

if (footer && canvasContainer) {
  // Create a scroll trigger that tracks footer entry
  gsap.registerEffect({
    name: 'footerScroll',
    effect: (targets, config) => {
      return gsap.to(targets, config);
    }
  });

  // Main scroll listener using GSAP
  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'top top',
    onUpdate: (self) => {
      // self.progress goes from 0 (footer not visible) to 1 (footer at top of viewport)
      const progress = self.progress;
      
      // Translate canvas up by 30% of viewport height (reduced from full height)
      const translateAmount = progress * window.innerHeight * 0.3;
      
      gsap.set(canvasContainer, {
        y: -translateAmount,
        overwrite: 'auto'
      });
    },
    scrub: 0.8 // Reduced scrub for subtler effect
  });

  // Optional: Reset on window resize
  window.addEventListener('resize', () => {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === footer) {
        trigger.refresh();
      }
    });
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
