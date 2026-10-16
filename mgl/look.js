// "Фон, который выбираешь ты": a living background for each tab.
// Everything is drawn with circles; snakes, landscape and dot-font move frame by frame.
(() => {
  const look = document.querySelector('.look');
  const canvas = look.querySelector('.look-bg');
  const ctx = canvas.getContext('2d');
  const tabs = [...look.querySelectorAll('.tab')];
  const screens = [...look.querySelectorAll('.screens img')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0;
  // where the screenshot sits inside the canvas — scenes draw around it
  let SHOT = { top: 0, bottom: 0 };
  const shotEl = look.querySelector(".screens");
  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = n => Math.floor(Math.random() * n);
  const pick = arr => arr[irand(arr.length)];
  const wrap = (v, n) => (v + n) % n;

  // above the screenshot the text lives on the left — keep the drawing quieter there
  const side = (x, y) => y > SHOT.top ? 1 : 0.2 + 0.8 * Math.min(1, Math.max(0, (x - W * 0.3) / (W * 0.4)));

  function dot(x, y, r, color, alpha = 1) {
    if (r <= 0 || alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- 1. Snakes chasing apples ----------
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const Snakes = {
    every: 120,
    colors: ['#4caf6e', '#6fd08f', '#34a0a3', '#52b69a'],

    reset() {
      this.cell = W < 640 ? 22 : 28;
      this.cols = Math.max(8, Math.floor(W / this.cell));
      this.rows = Math.max(8, Math.floor(H / this.cell));
      this.ox = (W - this.cols * this.cell) / 2;
      this.oy = (H - this.rows * this.cell) / 2;
      this.snakes = [];
      this.apples = [];
      this.pops = [];
      const n = W < 640 ? 3 : 4;
      for (let i = 0; i < n; i++) this.snakes.push(this.spawn(i));
      for (let i = 0; i < n + 2; i++) this.apples.push(this.freeCell());
    },
    key(x, y) { return y * this.cols + x; },
    occupied() {
      const set = new Set();
      for (const s of this.snakes) if (!s.dead) for (const p of s.body) set.add(this.key(p.x, p.y));
      return set;
    },
    freeCell() {
      const occ = this.occupied();
      const apples = new Set(this.apples.map(a => this.key(a.x, a.y)));
      for (let t = 0; t < 300; t++) {
        const x = irand(this.cols), y = irand(this.rows), k = this.key(x, y);
        if (!occ.has(k) && !apples.has(k)) return { x, y };
      }
      return { x: irand(this.cols), y: irand(this.rows) };
    },
    spawn(i) {
      const c = this.freeCell();
      return {
        body: Array.from({ length: 4 }, () => ({ x: c.x, y: c.y })),
        grow: 0, dead: 0, dir: pick(DIRS), color: this.colors[i % this.colors.length]
      };
    },
    distToApple(x, y) {
      let best = Infinity;
      for (const a of this.apples) {
        const dx = Math.abs(a.x - x), dy = Math.abs(a.y - y);
        best = Math.min(best, Math.min(dx, this.cols - dx) + Math.min(dy, this.rows - dy));
      }
      return best;
    },
    step() {
      const occ = this.occupied();
      this.pops = this.pops.filter(p => ++p.t < 5);

      this.snakes.forEach((s, i) => {
        if (s.dead) {
          if (++s.dead > 14) Object.assign(s, this.spawn(i));
          return;
        }
        const head = s.body[0], tail = s.body[s.body.length - 1];
        let best = null, bestScore = Infinity;

        for (const d of DIRS) {
          if (d[0] === -s.dir[0] && d[1] === -s.dir[1]) continue;
          const nx = wrap(head.x + d[0], this.cols), ny = wrap(head.y + d[1], this.rows);
          const freesTail = s.grow === 0 && nx === tail.x && ny === tail.y;
          if (occ.has(this.key(nx, ny)) && !freesTail) continue;
          let room = 0;
          for (const e of DIRS) if (!occ.has(this.key(wrap(nx + e[0], this.cols), wrap(ny + e[1], this.rows)))) room++;
          const score = this.distToApple(nx, ny) - room * 0.7 + Math.random() * 0.9 - (d === s.dir ? 0.25 : 0);
          if (score < bestScore) { bestScore = score; best = { d, nx, ny }; }
        }

        if (!best) { s.dead = 1; return; }
        s.dir = best.d;
        s.body.unshift({ x: best.nx, y: best.ny });
        occ.add(this.key(best.nx, best.ny));

        const ai = this.apples.findIndex(a => a.x === best.nx && a.y === best.ny);
        if (ai >= 0) {
          if (s.body.length < 26) s.grow += 3;
          this.pops.push({ x: best.nx, y: best.ny, t: 0 });
          this.apples[ai] = this.freeCell();
        }
        if (s.grow > 0) s.grow--;
        else s.body.pop();
      });
    },
    draw() {
      const c = this.cell, cx = x => this.ox + (x + 0.5) * c, cy = y => this.oy + (y + 0.5) * c;

      for (const a of this.apples) {
        const q = side(cx(a.x), cy(a.y));
        dot(cx(a.x), cy(a.y), c * 0.44, "#d7793d", 0.16 * q);
        dot(cx(a.x), cy(a.y), c * 0.26, "#d7793d", q);
      }
      for (const p of this.pops) {
        ctx.globalAlpha = 1 - p.t / 5;
        ctx.strokeStyle = '#e3a04f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx(p.x), cy(p.y), c * (0.3 + p.t * 0.28), 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const s of this.snakes) {
        const fade = s.dead ? 1 - s.dead / 14 : 1;
        const n = s.body.length;
        for (let i = n - 1; i >= 0; i--) {
          const p = s.body[i], k = i / Math.max(1, n - 1);
          dot(cx(p.x), cy(p.y), c * (0.38 - k * 0.17), s.color, (1 - k * 0.6) * fade * side(cx(p.x), cy(p.y)));
        }
        const h = s.body[0];
        dot(cx(h.x) + s.dir[0] * c * 0.14, cy(h.y) + s.dir[1] * c * 0.14, c * 0.09, '#0b0d0c', fade * side(cx(h.x), cy(h.y)));
      }
    }
  };

  // ---------- 2. Photo: a dotted landscape drifting by ----------
  const Landscape = {
    every: 140,
    layers: [
      { lift: 150, amp: 70, speed: 0.25, color: '#24543a', r: 0.17, seed: 0 },
      { lift: 85, amp: 50, speed: 0.5, color: '#3f8a57', r: 0.21, seed: 3 },
      { lift: 25, amp: 32, speed: 1, color: '#4caf6e', r: 0.25, seed: 7 }
    ],
    reset() {
      this.gap = W < 640 ? 13 : 16;
      this.cols = Math.ceil(W / this.gap) + 1;
      this.rows = Math.ceil(H / this.gap) + 1;
      this.t = 0;
      this.clouds = Array.from({ length: W < 640 ? 2 : 4 }, () => ({
        x: irand(this.cols), y: 2 + irand(Math.max(3, Math.floor(this.rows * 0.25))), w: 4 + irand(6)
      }));
    },
    hill(l, i) {
      const x = i + this.t * l.speed + l.seed * 40;
      const n = Math.sin(x * 0.045) * 0.55 + Math.sin(x * 0.11 + l.seed) * 0.25 + Math.sin(x * 0.019 + 2 * l.seed) * 0.6;
      return SHOT.top - l.lift - n * l.amp;
    },
    step() {
      this.t++;
      if (this.t % 3 === 0) for (const c of this.clouds) {
        c.x--;
        if (c.x + c.w < 0) { c.x = this.cols + irand(8); c.y = 2 + irand(Math.max(3, Math.floor(this.rows * 0.25))); }
      }
    },
    draw() {
      const g = this.gap;
      const sun = { x: W * 0.84, y: Math.max(70, SHOT.top - 300), r: Math.min(W, 900) * 0.07 };
      for (let i = 0; i < this.cols; i++) {
        const tops = this.layers.map(l => this.hill(l, i));
        for (let j = 0; j < this.rows; j++) {
          const x = i * g, y = j * g;
          let layer = -1;
          for (let k = this.layers.length - 1; k >= 0; k--) if (y > tops[k]) { layer = k; break; }
          if (layer >= 0) {
            const l = this.layers[layer];
            dot(x, y, g * l.r, l.color, 0.9 * side(x, y));
          } else if (Math.hypot(x - sun.x, y - sun.y) < sun.r) {
            dot(x, y, g * 0.24, "#e3a04f", 0.85 * side(x, y));
          } else {
            dot(x, y, 1, '#e8ece9', 0.08);
          }
        }
      }
      for (const c of this.clouds) {
        for (let k = 0; k < c.w; k++) dot((c.x + k) * g, c.y * g, g * 0.22, "#e8ece9", 0.35 * side((c.x + k) * g, 0));
        for (let k = 1; k < c.w - 1; k++) dot((c.x + k) * g, (c.y - 1) * g, g * 0.2, "#e8ece9", 0.25 * side((c.x + k) * g, 0));
      }
    }
  };

  // ---------- 3. Light theme: visualizer driven by game sounds ----------
  const Visualizer = {
    sounds: [
      'step.grass', 'block.stone.break', 'entity.creeper.primed', 'block.note_block.harp',
      'entity.experience_orb.pickup', 'ambient.cave', 'block.chest.open', 'entity.zombie.ambient',
      'block.lava.pop', 'entity.player.levelup', 'block.wood.place', 'entity.item.pickup'
    ],
    reset() {
      this.bw = W < 640 ? 7 : 10;
      this.gap = W < 640 ? 5 : 7;
      this.n = Math.max(8, Math.floor((W + this.gap) / (this.bw + this.gap)));
      this.ox = (W - (this.n * (this.bw + this.gap) - this.gap)) / 2;
      this.v = new Float32Array(this.n);
      this.target = new Float32Array(this.n);
      this.labels = [];
      this.next = 0;
      this.time = 0;
    },
    emit() {
      const c = irand(this.n), w = rand(2, 12), a = rand(0.3, 1);
      for (let i = 0; i < this.n; i++) {
        const d = (i - c) / w;
        this.target[i] = Math.max(this.target[i], a * Math.exp(-d * d) * rand(0.7, 1.2));
      }
      this.labels.push({ i: c, a, text: pick(this.sounds), life: 1 });
      if (this.labels.length > 6) this.labels.shift();
    },
    step(dt) {
      this.time += dt;
      this.next -= dt;
      if (this.next <= 0) { this.emit(); this.next = rand(160, 620); }
      const decay = Math.pow(0.93, dt / 16), ease = Math.min(1, dt / 16 * 0.22);
      for (let i = 0; i < this.n; i++) {
        this.target[i] *= decay;
        this.v[i] += (this.target[i] - this.v[i]) * ease;
      }
      for (const l of this.labels) l.life -= dt / 2200;
      this.labels = this.labels.filter(l => l.life > 0);
    },
    // bars stand on the screenshot's top edge and rise into the header,
    // plus a shorter row along the bottom of the section
    bars(base, maxH, gain) {
      if (maxH < 20) return;
      const step = this.bw + this.gap;
      const grad = ctx.createLinearGradient(0, base - maxH, 0, base);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      for (let i = 0; i < this.n; i++) {
        const x = this.ox + i * step;
        const idle = 0.04 + 0.03 * Math.sin(this.time / 380 + i * 0.55);
        const h = Math.max(this.bw, Math.min(1, (this.v[i] * gain + idle)) * maxH);
        ctx.globalAlpha = 0.9 * side(x, base - 1);
        ctx.beginPath();
        ctx.roundRect(x, base - h, this.bw, h, this.bw / 2);
        ctx.fill();
      }
    },
    draw() {
      const step = this.bw + this.gap;
      const topBase = SHOT.top - 18, topMax = SHOT.top - 70;
      this.bars(topBase, topMax, 1);
      this.bars(H - 14, H - SHOT.bottom - 40, 0.6);

      ctx.font = '500 12px ui-monospace, Consolas, monospace';
      ctx.textAlign = 'center';
      for (const l of this.labels) {
        const x = Math.min(W - 100, Math.max(100, this.ox + l.i * step + this.bw / 2));
        const y = Math.max(24, topBase - Math.min(1, this.v[l.i] + 0.06) * topMax - 16 - (1 - l.life) * 22);
        ctx.globalAlpha = Math.min(1, l.life * 1.5) * side(x, y);
        ctx.fillStyle = '#e9d5ff';
        ctx.fillText('♪ ' + l.text, x, y);
      }
    }
  };

  // ---------- 4. Pixel font: words typed in a dot matrix ----------
  const FONT = {
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '.': ['000', '000', '000', '000', '000', '000', '010'],
    0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
    ':': ['000', '010', '010', '000', '010', '010', '000'],
    ')': ['100', '010', '001', '001', '001', '010', '100'],
    ' ': ['00', '00', '00', '00', '00', '00', '00']
  };
  const DotFont = {
    every: 60,
    words: ['MGL', ':)', 'PLAY', 'v 2.0', '26.3', 'MODS', '1.8.9'],
    reset() {
      this.gap = W < 640 ? 12 : 16;
      this.cols = Math.ceil(W / this.gap) + 1;
      this.rows = Math.ceil(H / this.gap) + 1;
      this.wi = 0;
      this.setWord();
    },
    setWord() {
      const word = this.words[this.wi++ % this.words.length];
      const cells = [];
      let col = 0;
      for (const ch of word) {
        const g = FONT[ch];
        g.forEach((row, y) => [...row].forEach((b, x) => { if (b === '1') cells.push([col + x, y]); }));
        col += g[0].length + 1;
      }
      // big letters on the background lattice: every font pixel is an s×s block of dots
      const g = this.gap, s = W < 900 ? 1 : 2, width = (col - 1) * s;
      const x0 = W < 900 ? Math.max(1, Math.floor((this.cols - width) / 2)) : this.cols - width - 4;
      const y0 = W < 900 ? 2 : 4;
      this.lit = [];
      for (const [x, y] of cells)
        for (let a = 0; a < s; a++) for (let b = 0; b < s; b++)
          this.lit.push([(x0 + x * s + a) * g, (y0 + y * s + b) * g]);
      this.lit.sort(() => Math.random() - 0.5);
      this.per = s * s * 2;
      this.on = 0;
      this.hold = 0;
      this.phase = 'in';
    },
    step() {
      const per = this.per;
      if (this.phase === 'in') {
        this.on = Math.min(this.lit.length, this.on + per);
        if (this.on === this.lit.length) this.phase = 'hold';
      } else if (this.phase === 'hold') {
        if (++this.hold > 40) this.phase = 'out';
      } else {
        this.on = Math.max(0, this.on - per * 1.5);
        if (this.on === 0) this.setWord();
      }
    },
    draw() {
      const g = this.gap;
      for (let i = 0; i < this.cols; i++)
        for (let j = 0; j < this.rows; j++) dot(i * g, j * g, 1.1, '#e8ece9', 0.1);
      const fresh = this.phase === 'in' ? this.on - this.per : Infinity;
      for (let k = 0; k < this.on; k++) {
        const [x, y] = this.lit[k];
        dot(x, y, g * 0.36, k >= fresh ? '#e3a04f' : '#4caf6e', 0.95);
      }
    }
  };

  // ---------- engine ----------
  const SCENES = [Snakes, Landscape, Visualizer, DotFont];
  let scene = SCENES[0], current = 0, running = false, visible = false;
  let last = 0, acc = 0, raf = 0, tabTimer = 0, userPicked = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    const s = shotEl.getBoundingClientRect();
    SHOT = { top: s.top - r.top, bottom: s.bottom - r.top, textRight: 0 };
    for (const el of look.querySelectorAll(".sec-head h2, .sec-head .lead")) {
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const rect of range.getClientRects()) SHOT.textRight = Math.max(SHOT.textRight, rect.right - r.left);
    }
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene.reset();
    if (reduce) staticFrame();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    scene.draw();
    ctx.globalAlpha = 1;
  }

  function staticFrame() {
    for (let i = 0; i < 40; i++) scene.step(scene.every || 16);
    render();
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(100, t - (last || t));
    last = t;
    if (scene.every) {
      acc += dt;
      let stepped = false;
      while (acc >= scene.every) { scene.step(); acc -= scene.every; stepped = true; }
      if (stepped) render();
    } else {
      scene.step(dt);
      render();
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true; last = 0; acc = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function setScene(i) {
    canvas.classList.add('is-fading');
    setTimeout(() => {
      scene = SCENES[i];
      scene.reset();
      reduce ? staticFrame() : render();
      canvas.classList.remove('is-fading');
    }, 350);
  }

  function showTab(i) {
    if (i === current) return;
    current = i;
    tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i); });
    screens.forEach((s, k) => s.classList.toggle('is-active', k === i));
    setScene(i);
  }

  function autoRotate(on) {
    clearInterval(tabTimer);
    if (on && !userPicked && !reduce) tabTimer = setInterval(() => showTab((current + 1) % tabs.length), 9000);
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => { userPicked = true; autoRotate(false); showTab(i); }));

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? start() : stop();
    autoRotate(visible);
  }, { threshold: 0.1 }).observe(look);
})();
