// Command line: press "/" anywhere to navigate the portfolio by typing.

import { profile, projects, stack } from './data.js';

export function initTerminal({ works, schematic, toggleTheme }) {
  const dlg = document.getElementById('term');
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-input');
  const history = [];
  let hi = 0;

  const print = (html, cls = '') => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const go = id => { dlg.close(); document.getElementById(id).scrollIntoView(); };

  const cmds = {
    help: () => print(
      '<span class="c">whoami</span>      who is this\n' +
      '<span class="c">ls</span>          list projects\n' +
      '<span class="c">open</span> &lt;id&gt;   open a project\n' +
      '<span class="c">stack</span>       skills & tools\n' +
      '<span class="c">attack</span>      fire an attack at FIG. 01\n' +
      '<span class="c">contact</span>     email &amp; links\n' +
      '<span class="c">about · work · goto &lt;section&gt;</span>\n' +
      '<span class="c">theme</span>       switch blueprint / vellum\n' +
      '<span class="c">github · linkedin · clear · exit</span>'),
    whoami: () => print(`${profile.name} — ${profile.role}\n<span class="m">${profile.tagline}</span>`),
    ls: () => print(projects.map(p => `<span class="c">${p.id.padEnd(12)}</span>${p.title} <span class="m">(${p.disciplines.join(', ')})</span>`).join('\n') + '\n<span class="m">→ open &lt;id&gt;</span>'),
    open: ([id]) => {
      if (!id) return print('usage: open &lt;id&gt; — try <span class="c">ls</span>', 'e');
      dlg.close();
      if (!works.openProject(id)) { dlg.showModal(); print(`no project "${id}" — try <span class="c">ls</span>`, 'e'); }
    },
    stack: () => print(stack.map(s => `${s.item} <span class="m">(${s.kind})</span>`).join('\n')),
    contact: () => print(`<a href="mailto:${profile.email}">${profile.email}</a>\n` + profile.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join(' · ')),
    email: () => { location.href = `mailto:${profile.email}`; },
    about: () => go('about'),
    work: () => go('works'),
    goto: ([s]) => { const el = s && document.getElementById(s === 'work' ? 'works' : s); el ? go(el.id) : print('sections: cover about works contact', 'e'); },
    attack: () => { go('cover'); setTimeout(() => schematic?.attack(), 500); },
    theme: () => { const t = toggleTheme(); print(`medium → ${t}`, 'g'); },
    github: () => window.open(profile.links[0].href, '_blank', 'noopener'),
    linkedin: () => window.open(profile.links[1].href, '_blank', 'noopener'),
    clear: () => { out.innerHTML = ''; },
    exit: () => dlg.close(),
    sudo: args => args.join(' ').startsWith('hire')
      ? print(`permission granted ✓ — drafting email…`, 'g') || setTimeout(() => { location.href = `mailto:${profile.email}?subject=Let's%20talk`; }, 700)
      : print('nice try.', 'e'),
  };
  cmds.projects = cmds.ls;
  cmds.cd = cmds.goto;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    history.push(raw); hi = history.length;
    print(`<span class="c">$</span> ${raw.replace(/</g, '&lt;')}`);
    const [cmd, ...args] = raw.split(/\s+/);
    const fn = cmds[cmd.toLowerCase()];
    fn ? fn(args) : print(`command not found: ${cmd.replace(/</g, '&lt;')} — type <span class="c">help</span>`, 'e');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hi > 0) { input.value = history[--hi]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const [c, a] = input.value.split(' ');
      if (a !== undefined) { const m = projects.find(p => p.id.startsWith(a)); if (m) input.value = `${c} ${m.id}`; }
      else { const m = Object.keys(cmds).find(k => k.startsWith(c)); if (m) input.value = m + ' '; }
    }
  });

  const open = () => {
    if (dlg.open) return;
    dlg.showModal();
    if (!out.childElementCount) print('portfolio shell v2026.10 — type <span class="c">help</span>', 'm');
    input.focus();
  };
  document.getElementById('open-term').addEventListener('click', open);
  document.getElementById('term-x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); open(); }
  });
}
