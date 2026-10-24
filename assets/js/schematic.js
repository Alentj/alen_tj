// FIG. 01 — interactive model of the SmartAgri 7-layer security matrix.
// Clean readings travel from the ESP8266 node through every layer to storage;
// attacks enter from the left and are dropped at the layer built to stop them.

import { layers, attacks } from './data.js';

const NS = 'http://www.w3.org/2000/svg';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};

// Geometry (viewBox 520 x 440)
const STACK_X = 200, STACK_W = 130, L_TOP = 100, L_H = 34, L_GAP = 8;
const CX = STACK_X + STACK_W / 2;
const layerY = i => L_TOP + i * (L_H + L_GAP) + L_H / 2;
const lastY = layerY(layers.length - 1);

const nodes = {
  esp:    { x: 20,  y: 20,  label: 'ESP8266',  sub: 'edge node',  info: 'ESP8266 sensor node — reads soil moisture and posts it upstream.' },
  tunnel: { x: 200, y: 20,  label: 'Tunnel',   sub: 'transport',  info: 'Secure tunnel — the only way in from the field.' },
  threat: { x: 20,  y: L_TOP - 8, label: 'Attacker', sub: 'untrusted', info: 'Untrusted traffic. Every attack it sends is stopped by exactly one layer.', bad: true },
  db:     { x: 380, y: lastY - 25, label: 'MongoDB', sub: 'persist', info: 'MongoDB — only validated readings are ever written.' },
  dash:   { x: 380, y: L_TOP,  label: 'Dashboard', sub: 'chart.js', info: 'Dashboard — live charts and automated irrigation control.' },
};
const W = 130, H = 50;

const okPath = [
  [nodes.esp.x + W / 2, nodes.esp.y + H / 2],
  [CX, nodes.tunnel.y + H / 2],
  ...layers.map((_, i) => [CX, layerY(i)]),
  [nodes.db.x + 60, lastY],
  [nodes.dash.x + 60, nodes.dash.y + H / 2],
];
const badStart = [[nodes.threat.x + W / 2, layerY(0)], [CX, layerY(0)]];

export function initSchematic() {
  const svg = document.getElementById('schem');
  if (!svg) return;
  const log = document.getElementById('schem-log');
  const cPass = document.getElementById('c-pass');
  const cBlock = document.getElementById('c-block');
  const auto = document.getElementById('auto');
  let pass = 0, block = 0;

  // wires
  el('polyline', { class: 's-wire', points: okPath.map(p => p.join(',')).join(' ') }, svg);
  el('polyline', { class: 's-wire', points: badStart.map(p => p.join(',')).join(' '), style: 'stroke: var(--red); opacity:.5' }, svg);

  // server frame
  el('rect', { class: 's-frame', x: STACK_X - 14, y: L_TOP - 22, width: STACK_W + 28, height: lastY - L_TOP + L_H / 2 + 36 }, svg);
  el('text', { class: 's-frame-label', x: STACK_X - 10, y: L_TOP - 10 }, svg).textContent = 'SERVER · 7-LAYER MATRIX';

  const nodeEls = {};
  const addNode = (key, x, y, w, h, label, sub, info, id) => {
    const g = el('g', { class: 's-node', tabindex: 0, role: 'button', 'aria-label': `${label}: ${info}` }, svg);
    el('rect', { class: 's-box', x, y, width: w, height: h, style: key === 'threat' ? 'stroke: var(--red)' : '' }, g);
    if (id) {
      el('text', { class: 's-id', x: x + 10, y: y + h / 2 + 4 }, g).textContent = id;
      el('text', { class: 's-label', x: x + 36, y: y + h / 2 + 4 }, g).textContent = label;
    } else {
      el('text', { class: 's-label', x: x + 12, y: y + 21 }, g).textContent = label;
      el('text', { class: 's-sub', x: x + 12, y: y + 36 }, g).textContent = sub;
    }
    const show = () => say(info);
    g.addEventListener('click', show);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
    nodeEls[key] = g;
    return g;
  };

  for (const [k, n] of Object.entries(nodes)) addNode(k, n.x, n.y, W, H, n.label, n.sub, n.info);
  layers.forEach((l, i) => {
    const info = l.stops ? `${l.id} ${l.name} — stops: ${l.msg.split(' — ')[0]}.` : `${l.id} ${l.name} — alerts the owner over Telegram on every blocked event.`;
    addNode(l.id, STACK_X, L_TOP + i * (L_H + L_GAP), STACK_W, L_H, l.name, '', info, l.id);
  });

  const pktLayer = el('g', {}, svg);

  function say(html) { log.innerHTML = '» ' + html; }

  function flash(key, kind) {
    const g = nodeEls[key];
    if (!g) return;
    g.classList.remove('flash-ok', 'flash-bad');
    void g.getBBox();
    g.classList.add(kind === 'bad' ? 'flash-bad' : 'flash-ok');
    setTimeout(() => g.classList.remove('flash-ok', 'flash-bad'), 650);
  }

  // build a path-walker from a list of points
  const segs = pts => {
    const out = []; let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
      const len = Math.hypot(x2 - x1, y2 - y1);
      out.push({ x1, y1, x2, y2, len, start: total });
      total += len;
    }
    return { out, total };
  };
  const at = (path, d) => {
    const s = path.out.find(s => d <= s.start + s.len) || path.out[path.out.length - 1];
    const t = Math.min(1, (d - s.start) / s.len);
    return [s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t];
  };

  const live = [];
  const SPEED = 190; // svg units per second

  function send(bad) {
    if (bad) {
      const type = attacks[Math.floor(Math.random() * attacks.length)];
      const idx = layers.findIndex(l => l.stops === type);
      const pts = [...badStart, ...layers.slice(1, idx + 1).map((_, i) => [CX, layerY(i + 1)])];
      const path = segs(pts);
      const dot = el('rect', { class: 's-pkt bad', width: 9, height: 9, x: -20, y: -20 }, pktLayer);
      live.push({ dot, path, d: 0, bad: true, idx, type, passed: -1 });
      say(`<span class="bad">incoming ${type}</span> attack…`);
      if (reduceMotion) finish(live[live.length - 1]);
    } else {
      const path = segs(okPath);
      const dot = el('circle', { class: 's-pkt', r: 5, cx: -20, cy: -20 }, pktLayer);
      live.push({ dot, path, d: 0, bad: false, passed: -1 });
      if (reduceMotion) finish(live[live.length - 1]);
    }
  }

  function finish(p) {
    p.done = true;
    p.dot.remove();
    if (p.bad) {
      const l = layers[p.idx];
      flash(l.id, 'bad');
      const y = layerY(p.idx);
      const x = el('g', {}, pktLayer);
      el('line', { class: 's-x', x1: CX - 7, y1: y - 7, x2: CX + 7, y2: y + 7 }, x);
      el('line', { class: 's-x', x1: CX + 7, y1: y - 7, x2: CX - 7, y2: y + 7 }, x);
      setTimeout(() => x.remove(), 900);
      flash('L3', 'bad'); // Telegram shield raises an alert
      cBlock.textContent = ++block;
      say(`<span class="bad">[${l.id} ${l.name}] DROPPED</span> — ${l.msg}`);
    } else {
      flash('db', 'ok'); flash('dash', 'ok');
      cPass.textContent = ++pass;
      say(`<span class="good">reading stored</span> — passed all 7 layers · moisture ${(30 + Math.random() * 40).toFixed(1)}%`);
    }
  }

  let last = 0, timer = 0, visible = true;
  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    for (const p of live) {
      if (p.done) continue;
      p.d += SPEED * dt;
      const [x, y] = at(p.path, p.d);
      if (p.bad) { p.dot.setAttribute('x', x - 4.5); p.dot.setAttribute('y', y - 4.5); }
      else { p.dot.setAttribute('cx', x); p.dot.setAttribute('cy', y); }
      // flash each layer as a clean packet crosses it
      if (!p.bad) {
        const i = layers.findIndex((_, i) => Math.abs(y - layerY(i)) < 3 && Math.abs(x - CX) < 1);
        if (i > p.passed) { p.passed = i; flash(layers[i].id, 'ok'); }
      }
      if (p.d >= p.path.total) finish(p);
    }
    for (let i = live.length - 1; i >= 0; i--) if (live[i].done) live.splice(i, 1);

    if (auto.checked && visible && !reduceMotion) {
      timer += dt;
      if (timer > 1.7) { timer = 0; send(Math.random() < 0.38); }
    }
    requestAnimationFrame(tick);
  }

  document.getElementById('send-ok').addEventListener('click', () => send(false));
  document.getElementById('send-bad').addEventListener('click', () => send(true));
  if (reduceMotion) auto.checked = false;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(svg);
  requestAnimationFrame(tick);

  return { attack: () => send(true), send: () => send(false) };
}
