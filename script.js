document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- nav scroll state + tide progress ---------- */
const nav = document.getElementById('nav');
const tideFill = document.getElementById('tideFill');

function onScroll(){
  nav.classList.toggle('is-scrolled', window.scrollY > 12);
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  tideFill.style.width = Math.min(100, Math.max(0, scrolled * 100)) + '%';
}
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile menu ---------- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  // safety net: force-reveal anything still hidden after 2.5s
  // (covers edge cases like elements that never intersect)
  setTimeout(() => revealEls.forEach(el => el.classList.add('is-visible')), 2500);
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

/* ---------- ambient hero canvas: slow drifting "tide lines" + plankton points ---------- */
const canvas = document.getElementById('tideCanvas');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let points = [];
  let waveOffset = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.floor((w * h) / 26000);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.15 + 0.03,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.5 ? '201,162,39' : '79,167,154'
    }));
  }

  function drawWaveLine(yBase, amplitude, wavelength, alpha, color) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = yBase + Math.sin((x / wavelength) + waveOffset) * amplitude;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${color},${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    // drifting plankton points
    points.forEach(p => {
      p.phase += p.speed * 0.02;
      const dy = Math.sin(p.phase) * 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y + dy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${0.35 + Math.sin(p.phase) * 0.2})`;
      ctx.fill();
    });

    // horizon tide lines, lower third of hero
    drawWaveLine(h * 0.82, 14, 220, 0.14, '79,167,154');
    drawWaveLine(h * 0.88, 10, 160, 0.10, '201,162,39');
    drawWaveLine(h * 0.94, 18, 260, 0.08, '242,238,226');

    waveOffset += 0.004;
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}
