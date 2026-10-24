// Pointer effects: a soft spotlight that follows the mouse, cards that tilt
// toward the cursor with a moving glow, and magnetic primary buttons.

const fine = matchMedia('(pointer: fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initEffects() {
  if (!fine) return;
  const root = document.documentElement;

  // page spotlight
  let mx = innerWidth / 2, my = innerHeight / 3, queued = false;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        root.style.setProperty('--mx', `${mx}px`);
        root.style.setProperty('--my', `${my}px`);
      });
    }
  }, { passive: true });

  // glow + tilt on any surface that opts in
  const surfaces = '.card, .schematic, .stats > div, .links a, .spec, .dt-diagram, .name-wrap';
  document.addEventListener('pointermove', e => {
    const el = e.target.closest(surfaces);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    if (!reduce && el.classList.contains('card')) {
      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width) - 0.5) * 8;
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    }
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const el = e.target.closest?.('.card');
    if (el && !el.contains(e.relatedTarget)) {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
  });

  // magnetic buttons
  if (reduce) return;
  document.querySelectorAll('.btn-solid, .btn-lg').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}
