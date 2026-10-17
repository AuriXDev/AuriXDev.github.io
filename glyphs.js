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

