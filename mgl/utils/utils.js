const $ = id => document.getElementById(id);
const val = el => { const v = parseFloat(el.value); return Number.isFinite(v) ? v : null; };
const fmt = n => n.toLocaleString('ru-RU');

// ---------- Nether <-> Overworld ----------
{
  const ow = [$('ow-x'), $('ow-z')], ne = [$('ne-x'), $('ne-z')];
  ow.forEach((el, i) => el.addEventListener('input', () => {
    const v = val(el); ne[i].value = v === null ? '' : Math.floor(v / 8);
  }));
  ne.forEach((el, i) => el.addEventListener('input', () => {
    const v = val(el); ow[i].value = v === null ? '' : Math.round(v * 8);
  }));
}

// ---------- Stacks ----------
{
  const count = $('st-count'), size = $('st-size'), out = $('st-out');
  const run = () => {
    const n = val(count);
    if (n === null || n < 0) { out.textContent = 'Введи количество предметов'; return; }
    const s = +size.value, items = Math.floor(n);
    const stacks = Math.floor(items / s), rest = items % s;
    const slots = Math.ceil(items / s);
    const shulkers = Math.ceil(slots / 27), chests = Math.ceil(slots / 54);
    out.innerHTML = `<b>${fmt(stacks)}</b> стаков + <b>${rest}</b> шт.<br>` +
      `Слотов: <b>${fmt(slots)}</b><br>Шалкеров: <b>${fmt(shulkers)}</b> · двойных сундуков: <b>${fmt(chests)}</b>`;
  };
  count.addEventListener('input', run); size.addEventListener('change', run);
}

// ---------- Chunks ----------
{
  const x = $('ch-x'), z = $('ch-z'), out = $('ch-out');
  const run = () => {
    const a = val(x), b = val(z);
    if (a === null || b === null) { out.textContent = 'Введи координаты'; return; }
    const bx = Math.floor(a), bz = Math.floor(b);
    const cx = Math.floor(bx / 16), cz = Math.floor(bz / 16);
    const rx = Math.floor(cx / 32), rz = Math.floor(cz / 32);
    out.innerHTML = `Чанк: <b>${cx}, ${cz}</b><br>В чанке: <b>${bx - cx * 16}, ${bz - cz * 16}</b><br>` +
      `Границы: <b>${cx * 16}…${cx * 16 + 15}</b> / <b>${cz * 16}…${cz * 16 + 15}</b><br>Регион: <b>r.${rx}.${rz}.mca</b>`;
  };
  x.addEventListener('input', run); z.addEventListener('input', run);
}

// ---------- Offline UUID (MD5 of "OfflinePlayer:<name>", UUID v3 layout) ----------
function md5(bytes) {
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);
  const len = bytes.length, total = (((len + 8) >> 6) + 1) * 64;
  const buf = new Uint8Array(total); buf.set(bytes); buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, (len * 8) >>> 0, true);
  dv.setUint32(total - 4, Math.floor(len / 536870912), true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < total; off += 64) {
    const M = Array.from({ length: 16 }, (_, i) => dv.getUint32(off + i * 4, true));
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      const s = S[(i >> 4) * 4 + (i % 4)];
      B = (B + (((F << s) | (F >>> (32 - s))) >>> 0)) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const out = new Uint8Array(16), o = new DataView(out.buffer);
  [a0, b0, c0, d0].forEach((v, i) => o.setUint32(i * 4, v, true));
  return out;
}
function offlineUuid(name) {
  const h = md5(new TextEncoder().encode('OfflinePlayer:' + name));
  h[6] = (h[6] & 0x0f) | 0x30;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = [...h].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
{
  const name = $('uu-name'), out = $('uu-out');
  name.addEventListener('input', () => {
    out.textContent = name.value.trim() ? offlineUuid(name.value.trim()) : 'Введи ник';
  });
}

// ---------- Colored text ----------
{
  const COLORS = {
    0: '#000000', 1: '#0000aa', 2: '#00aa00', 3: '#00aaaa', 4: '#aa0000', 5: '#aa00aa', 6: '#ffaa00', 7: '#aaaaaa',
    8: '#555555', 9: '#5555ff', a: '#55ff55', b: '#55ffff', c: '#ff5555', d: '#ff55ff', e: '#ffff55', f: '#ffffff'
  };
  const input = $('mo-in'), prev = $('mo-prev'), out = $('mo-out'), sw = $('mo-swatches');

  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function render() {
    const src = input.value;
    out.textContent = src.replace(/&([0-9a-fk-or])/gi, '§$1');
    let st = { c: null, b: false, i: false, u: false, s: false }, html = '';
    const parts = src.split(/&([0-9a-fk-or])/i);
    for (let k = 0; k < parts.length; k++) {
      if (k % 2 === 0) {
        if (!parts[k]) continue;
        const css = [st.c ? `color:${st.c}` : '', st.b ? 'font-weight:700' : '', st.i ? 'font-style:italic' : '',
          (st.u || st.s) ? `text-decoration:${[st.u && 'underline', st.s && 'line-through'].filter(Boolean).join(' ')}` : ''].filter(Boolean).join(';');
        html += `<span style="${css}">${esc(parts[k])}</span>`;
      } else {
        const c = parts[k].toLowerCase();
        if (COLORS[c]) st = { c: COLORS[c], b: false, i: false, u: false, s: false };
        else if (c === 'l') st.b = true; else if (c === 'o') st.i = true;
        else if (c === 'n') st.u = true; else if (c === 'm') st.s = true;
        else if (c === 'r') st = { c: null, b: false, i: false, u: false, s: false };
      }
    }
    prev.innerHTML = html || '&nbsp;';
  }
  const add = (code, label, bg, fg) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.title = '&' + code;
    b.style.background = bg; b.style.color = fg;
    b.addEventListener('click', () => {
      const s = input.selectionStart, e = input.selectionEnd;
      input.setRangeText('&' + code, s, e, 'end'); input.focus(); render();
    });
    sw.appendChild(b);
  };
  Object.entries(COLORS).forEach(([k, c]) => add(k, k, c, ['0', '1', '4', '5', '8', '9'].includes(k) ? '#fff' : '#000'));
  [['l', 'B'], ['o', 'I'], ['n', 'U'], ['m', 'S'], ['r', 'R']].forEach(([k, t]) => add(k, t, 'transparent', '#e8ece9'));
  input.addEventListener('input', render);
  render();
}

// ---------- Circle ----------
{
  const d = $('ci-d'), mode = $('ci-mode'), cv = $('ci-cv'), out = $('ci-out');
  const draw = () => {
    const n = Math.min(128, Math.max(3, Math.round(val(d) || 3)));
    const inside = (i, j) => {
      if (i < 0 || j < 0 || i >= n || j >= n) return false;
      const x = i + 0.5 - n / 2, y = j + 0.5 - n / 2;
      return x * x + y * y <= (n / 2) * (n / 2);
    };
    const cell = Math.max(3, Math.min(18, Math.floor(420 / n)));
    cv.width = cv.height = n * cell;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    let count = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      if (!inside(i, j)) continue;
      const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
      if (mode.value === 'ring' && !edge) continue;
      count++;
      ctx.fillStyle = edge ? '#4caf6e' : '#24543a';
      ctx.fillRect(i * cell, j * cell, cell - 1, cell - 1);
    }
    out.innerHTML = `Диаметр <b>${n}</b> · блоков: <b>${fmt(count)}</b> (<b>${Math.floor(count / 64)}</b> стаков + ${count % 64})`;
  };
  d.addEventListener('input', draw); mode.addEventListener('change', draw);
  draw();
}

// ---------- Copy buttons ----------
document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const text = $(btn.dataset.copy).textContent;
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Скопировано'; }
  catch { btn.textContent = 'Не удалось'; }
  setTimeout(() => { btn.textContent = old; }, 1400);
}));
// ---------- Custom dropdowns (replace native <select>) ----------
document.querySelectorAll('select').forEach(sel => {
  const wrap = document.createElement('div');
  wrap.className = 'dd';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'dd-btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  const list = document.createElement('ul');
  list.className = 'dd-list'; list.setAttribute('role', 'listbox');
  wrap.append(btn, list);

  const items = [...sel.options].map((o, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    const m = o.textContent.match(/^(.*?)\s*\((.*)\)$/);
    li.innerHTML = m ? `<span>${m[1]}<small> · ${m[2]}</small></span>` : `<span>${o.textContent}</span>`;
    li.addEventListener('click', () => { choose(i); close(); btn.focus(); });
    list.appendChild(li);
    return li;
  });

  let hot = sel.selectedIndex;
  const label = () => { const m = sel.selectedOptions[0].textContent.match(/^(.*?)\s*\(/); return m ? m[1] : sel.selectedOptions[0].textContent; };
  const paint = () => {
    btn.textContent = label();
    items.forEach((li, i) => { li.setAttribute('aria-selected', i === sel.selectedIndex); li.classList.toggle('is-hot', i === hot); });
  };
  function choose(i) {
    if (i === sel.selectedIndex) return;
    sel.selectedIndex = i; hot = i; paint();
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const open = () => { hot = sel.selectedIndex; paint(); wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', () => wrap.classList.contains('is-open') ? close() : open());
  btn.addEventListener('keydown', e => {
    const isOpen = wrap.classList.contains('is-open');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return open();
      hot = (hot + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; paint();
    } else if ((e.key === 'Enter' || e.key === ' ') && isOpen) {
      e.preventDefault(); choose(hot); close();
    } else if (e.key === 'Escape' || e.key === 'Tab') close();
  });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  paint();
});

