// Versions marquee — from the very first alpha to fresh snapshots
const VERSIONS = [
  ['c0.0.11a', 'Classic'], ['inf-20100618', 'Infdev'], ['b1.0', 'Beta'], ['b1.6', 'Beta'],
  ['Forge 1.8.9', 'Forge'], ['1.11', 'Vanilla'], ['1.12.2', 'Forge'], ['1.16.5', 'Vanilla'],
  ['fabric-1.20.1', 'Fabric'], ['1.21.1', 'Vanilla'], ['neoforge-21.1.262', 'NeoForge'],
  ['26.3', 'Vanilla'], ['26.4-snapshot-4', 'Snapshot']
];
const track = document.getElementById('marquee');
const row = VERSIONS.map(([name, kind]) =>
  `<div class="ver"><span class="glyph">${glyph(name)}</span><span><b>${name}</b><small>${kind}</small></span></div>`
).join('');
track.innerHTML = row + row;
[...track.children].slice(VERSIONS.length).forEach(n => n.setAttribute('aria-hidden', 'true'));

// Nav background on scroll
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 20);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Hero parallax
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.querySelector('.hero');
if (!reduce && matchMedia('(pointer: fine)').matches) {
  const shapes = hero.querySelectorAll('.sh[data-depth]');
  hero.addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    shapes.forEach(s => {
      const d = +s.dataset.depth;
      s.style.setProperty('--px', `${(-x * d).toFixed(1)}px`);
      s.style.setProperty('--py', `${(-y * d).toFixed(1)}px`);
    });
  });
}

// GitHub links — вставь ссылку на репозиторий сюда, она подставится во все кнопки GitHub
const GITHUB_URL = '';
if (GITHUB_URL) {
  document.querySelectorAll('[data-github]').forEach(a => {
    a.href = GITHUB_URL; a.target = '_blank'; a.rel = 'noopener';
  });
}

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-zoom]');
  if (img) { lbImg.src = img.src; lbImg.alt = img.alt; lb.hidden = false; return; }
  if (!lb.hidden && e.target.closest('#lightbox')) lb.hidden = true;
});
addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

// Registered users counter — public JSON, we only use the number of registrations
(async () => {
  const box = document.getElementById('users');
  if (!box) return;
  try {
    const res = await fetch('https://gist.githubusercontent.com/AuriXDev/664e23438029adb3993d89fa2213dbfe/raw/data.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    const ids = new Set((data.registrations_meta || []).map(r => r.launcher_id));
    const total = ids.size;
    if (!total) return;

    const n = document.getElementById('users-n');
    const plural = (k, a, b, c) => k % 10 === 1 && k % 100 !== 11 ? a : [2, 3, 4].includes(k % 10) && ![12, 13, 14].includes(k % 100) ? b : c;
    document.getElementById('users-label').textContent =
      `${plural(total, 'пользователь уже', 'пользователя уже', 'пользователей уже')} с нами`;
    box.hidden = false;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { n.textContent = total; return; }
    const t0 = performance.now(), dur = 1200;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      n.textContent = Math.round(total * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } catch { /* offline or blocked — counter just stays hidden */ }
})();
