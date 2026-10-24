// Work cards and project detail views.

import { projects, disciplines } from './data.js';

const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Draw a project's `flow` as a left-to-right system diagram (returns SVG markup).
export function flowDiagram(flow, width = 400) {
  const stages = flow.map(s => (Array.isArray(s) ? s : [s]));
  const rows = Math.max(...stages.map(s => s.length));
  const gap = 16, boxH = 24, rowGap = 10;
  const boxW = (width - gap * (stages.length - 1)) / stages.length;
  const height = rows * boxH + (rows - 1) * rowGap + 8;
  const pos = stages.map((s, i) => {
    const colH = s.length * boxH + (s.length - 1) * rowGap;
    const top = (height - colH) / 2;
    return s.map((label, j) => ({ label, x: i * (boxW + gap), y: top + j * (boxH + rowGap) }));
  });
  let wires = '', flows = '', boxes = '';
  for (let i = 0; i < pos.length - 1; i++) {
    // Equal-width parallel stages are separate lanes; otherwise fan in/out.
    const lanes = pos[i].length > 1 && pos[i].length === pos[i + 1].length;
    const pairs = lanes
      ? pos[i].map((a, j) => [a, pos[i + 1][j]])
      : pos[i].flatMap(a => pos[i + 1].map(b => [a, b]));
    for (const [a, b] of pairs) {
      const x1 = a.x + boxW, y1 = a.y + boxH / 2, x2 = b.x, y2 = b.y + boxH / 2, mx = x1 + gap / 2;
      const d = `M${x1},${y1} H${mx} V${y2} H${x2}`;
      wires += `<path class="d-wire" d="${d}"/>`;
      flows += `<path class="d-flow" d="${d}" style="animation-delay:${(i * 0.4).toFixed(1)}s"/>`;
    }
  }
  for (const col of pos) for (const n of col) {
    const fs = Math.min(9, (boxW - 8) / (n.label.length * 0.62));
    boxes += `<rect class="d-box" x="${n.x}" y="${n.y}" width="${boxW}" height="${boxH}"/>` +
      `<text class="d-txt" x="${n.x + boxW / 2}" y="${n.y + boxH / 2 + 3}" text-anchor="middle" style="font-size:${fs.toFixed(1)}px">${esc(n.label)}</text>`;
  }
  return `<svg viewBox="-1 -1 ${width + 2} ${height + 2}" aria-hidden="true">${wires}${flows}${boxes}</svg>`;
}

export function initWorks() {
  const list = document.getElementById('works-list');
  const filters = document.getElementById('filters');
  const dialog = document.getElementById('detail');
  const body = document.getElementById('detail-body');

  const firstSentence = s => s.split(/(?<=\.)\s/)[0];
  list.innerHTML = projects.map((p, i) => `
    <button class="card rv${i === 0 ? ' card-feat' : ''}" data-id="${p.id}" data-d="${p.disciplines.join(' ')}" aria-haspopup="dialog">
      <span class="card-shine" aria-hidden="true"></span>
      <div class="card-top">
        <span class="card-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="card-disc">${p.disciplines.map(d => `<i>${d}</i>`).join('')}</span>
        <span class="card-year">${p.year}</span>
      </div>
      <div class="card-diagram">${flowDiagram(p.flow)}</div>
      <div class="card-body">
        <h3>${esc(p.title)}</h3>
        <p class="sub">${esc(p.subtitle)}</p>
        <p class="card-sum">${esc(firstSentence(p.summary))}</p>
        <div class="tags">${p.stack.slice(0, 4).map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <span class="card-cta">View case study <span aria-hidden="true">→</span></span>
      </div>
    </button>`).join('');

  filters.innerHTML = disciplines.map((d, i) => {
    const n = d.id === 'all' ? projects.length : projects.filter(p => p.disciplines.includes(d.id)).length;
    return `<button role="tab" aria-selected="${i === 0}" data-f="${d.id}">${d.label}<sup>${n}</sup></button>`;
  }).join('');

  filters.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) setFilter(b.dataset.f);
  });

  list.addEventListener('click', e => {
    const c = e.target.closest('.card');
    if (c) openProject(c.dataset.id);
  });

  function setFilter(f) {
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.f === f));
    list.querySelectorAll('.card').forEach(c => {
      const hide = f !== 'all' && !c.dataset.d.split(' ').includes(f);
      c.classList.toggle('dim-out', hide);
      c.tabIndex = hide ? -1 : 0;
    });
  }

  function openProject(id) {
    const p = projects.find(p => p.id === id);
    if (!p) return false;
    body.innerHTML = `
      <header class="dt-hero">
        <div class="dt-meta">
          ${p.disciplines.map(d => `<span class="dt-chip">${d}</span>`).join('')}
          <span class="dt-year">${p.year}</span>
          <button class="dt-close" data-close aria-label="Close">esc ✕</button>
        </div>
        <h2 id="detail-title">${esc(p.title)}</h2>
        <p class="sub">${esc(p.subtitle)}</p>
      </header>
      <div class="dt-diagram">${flowDiagram(p.flow, 560)}</div>
      <div class="dt-grid">
        <div class="dt-main">
          <h4>Overview</h4>
          <p>${esc(p.summary)}</p>
          <h4>Highlights</h4>
          <ol>${p.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ol>
        </div>
        <aside class="dt-side">
          <h4>Built with</h4>
          <div class="tags">${p.stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
          <a class="btn btn-solid" href="${p.repo}" target="_blank" rel="noopener">View source <span aria-hidden="true">↗</span></a>
        </aside>
      </div>`;
    dialog.showModal();
    body.querySelector('[data-close]').focus();
    return true;
  }

  dialog.addEventListener('click', e => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });

  return { openProject, setFilter };
}
