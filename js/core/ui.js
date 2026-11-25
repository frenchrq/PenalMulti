// Small helpers shared by the screens.

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Page header. opts.back adds a "back to start" link, opts.links adds pill links.
export function topbar(title, opts = {}) {
  let right = '';
  if (opts.back) right = '<a class="pill" href="#/">‹ Inicio</a>';
  if (opts.links) {
    right = '<nav class="links">' + opts.links.map(([href, label]) =>
      `<a class="pill" href="${href}">${esc(label)}</a>`).join('') + '</nav>';
  }
  return `<header class="top"><h1>${esc(title)}</h1>${right}</header>`;
}

export const rand = (n) => Math.floor(Math.random() * n);
export const pick = (a) => a[rand(a.length)];
export function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
