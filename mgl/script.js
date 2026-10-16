// Abstract "build icons" — same idea as the launcher: every name gets its own soft composition.
const GREENS = ['#1f4a31', '#2f6b45', '#3f8a57', '#4caf6e', '#6fbf86'];
const ACCENTS = ['#d7793d', '#b8622e', '#e3a04f'];
let glyphId = 0;

function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glyph(seed) {
  const r = seeded(seed);
  const between = (a, b) => a + r() * (b - a);
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const id = 'g' + glyphId++;
  const count = 3 + Math.floor(r() * 3);
  let shapes = '';

  for (let i = 0; i < count; i++) {
    const accent = i === count - 1 && r() < 0.55;
    const fill = accent ? pick(ACCENTS) : pick(GREENS);
    const x = between(15, 85), y = between(15, 85);
    const s = accent ? between(9, 16) : between(18, 40);
    const type = accent ? 'c' : pick(['c', 'c', 'c', 't', 'r']);
    const op = between(0.75, 1).toFixed(2);

    if (type === 'c') {
      shapes += `<circle cx="${x}" cy="${y}" r="${s}" fill="${fill}" opacity="${op}"/>`;
    } else if (type === 't') {
      const a = between(0, Math.PI * 2);
      const pts = [0, 1, 2].map(k => {
        const ang = a + k * (Math.PI * 2 / 3);
        return `${(x + Math.cos(ang) * s * 1.2).toFixed(1)},${(y + Math.sin(ang) * s * 1.2).toFixed(1)}`;
      }).join(' ');
      shapes += `<polygon points="${pts}" fill="${fill}" opacity="${op}"/>`;
    } else {
      shapes += `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="${s / 5}" fill="${fill}" opacity="${op}" transform="rotate(${between(-40, 40).toFixed(0)} ${x} ${y})"/>`;
    }
  }

  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${between(0.6, 1.8).toFixed(2)}"/></filter></defs>
    <rect width="100" height="100" fill="#151b17"/>
    <g filter="url(#${id})">${shapes}</g>
  </svg>`;
}

document.querySelectorAll('.glyph[data-seed]').forEach(el => { el.innerHTML = glyph(el.dataset.seed); });

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
