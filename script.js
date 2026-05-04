// ── custom cursor ──
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; 
  my = e.clientY;
  
  // Update CSS variables for interactive grid background
  document.documentElement.style.setProperty('--mx', mx + 'px');
  document.documentElement.style.setProperty('--my', my + 'px');
});

(function animCursor() {
  if (cur && ring) {
    cur.style.left = mx + 'px'; 
    cur.style.top = my + 'px';
    rx += (mx - rx) * 0.15; 
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px'; 
    ring.style.top = ry + 'px';
  }
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a, button, .btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// (Trance graphics canvas removed in favor of pure CSS fluid gradients)


// ── scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), (i % 3) * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => io.observe(el));
