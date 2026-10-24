// Entry point: binds content, wires the page chrome (dimension lines, active
// nav, theme) and boots each interactive module.

import { profile, projects, stack, layers } from './data.js';
import { initSchematic } from './schematic.js';
import { initWorks } from './works.js';
import { initTerminal } from './terminal.js';
import { initEffects } from './effects.js';

const $ = s => document.querySelector(s);
const root = document.documentElement;

// ---- content binding -------------------------------------------------------
document.querySelectorAll('[data-bind]').forEach(n => { n.textContent = profile[n.dataset.bind] ?? ''; });
$('#year').textContent = new Date().getFullYear();
const mail = $('#mail');
mail.href = `mailto:${profile.email}`;
mail.textContent = profile.email + ' →';
$('#links').innerHTML = profile.links
  .map(l => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}<span aria-hidden="true">↗</span></a></li>`)
  .join('');

// highlights strip, derived from the data so it never goes stale
const pad = n => String(n).padStart(2, '0');
const disciplineCount = new Set(projects.flatMap(p => p.disciplines)).size;
$('#stats').innerHTML = [
  [pad(projects.length), 'Projects built end-to-end'],
  [pad(layers.length), 'Security layers in SmartAgri'],
  [pad(disciplineCount), 'Disciplines — security, AI, hardware'],
  [pad(stack.length), 'Tools in the kit'],
].map(([n, l]) => `<div><dt>${n}</dt><dd>${l}</dd></div>`).join('');

$('#copy').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(profile.email); b.textContent = 'Copied ✓'; }
  catch { b.textContent = profile.email; }
  setTimeout(() => { b.textContent = 'Copy email'; }, 1800);
});

// ---- theme: blueprint / vellum ---------------------------------------------
const themeLabel = $('.theme-label');
const meta = $('meta[name="theme-color"]');
function applyTheme(t) {
  root.dataset.theme = t;
  themeLabel.textContent = t;
  meta.content = t === 'vellum' ? '#f1ece1' : '#0b2a4a';
}
function toggleTheme() {
  const t = root.dataset.theme === 'vellum' ? 'blueprint' : 'vellum';
  applyTheme(t);
  try { localStorage.setItem('theme', t); } catch {}
  return t;
}
applyTheme(root.dataset.theme || 'blueprint');
$('#theme').addEventListener('click', toggleTheme);

// ---- dimension lines on the name -------------------------------------------
const name = $('#name');
function measure() {
  const r = name.getBoundingClientRect();
  $('#dim-w').textContent = `${Math.round(r.width)} px`;
  $('#dim-h').textContent = `${Math.round(r.height)} px`;
}
new ResizeObserver(measure).observe(name);
document.fonts?.ready.then(measure);

// ---- active nav ----------------------------------------------
const sheets = [...document.querySelectorAll('.sheet')];
const navLinks = [...document.querySelectorAll('.sheets a')];
const sheetIO = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const s = e.target;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + s.id));
    if (s.id === 'contact') $('.stamp').classList.add('stamped');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
sheets.forEach(s => sheetIO.observe(s));

// ---- modules ---------------------------------------------------------------
const schematic = initSchematic();
const works = initWorks();
initTerminal({ works, schematic, toggleTheme });
initEffects();

// ---- reveal on scroll ------------------------------------------------------
document.querySelectorAll('.h2, .about-body, .spec, .contact-row, .links').forEach(n => n.classList.add('rv'));
const rio = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach((n, i) => { n.style.transitionDelay = `${(i % 3) * 70}ms`; rio.observe(n); });
