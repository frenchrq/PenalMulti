// Teams and their plain home colours. No crests, logos or sponsor marks, only colours and
// a simple pattern (solid, stripes, centre band or coloured sleeves).
// To fix or add a team, edit the lists below. `gk` is an optional goalkeeper colour.
import { load, save } from './store.js';

export const TEAMS = {
  sel: [
    { id: 'por', name: 'Portugal', shirt: '#c8102e', alt: '#0b6b3a', pat: 'solid', shorts: '#0b6b3a', socks: '#c8102e' },
    { id: 'chi', name: 'Chile', shirt: '#d52b1e', alt: '#ffffff', pat: 'solid', shorts: '#0a3a9c', socks: '#ffffff' },
    { id: 'fra', name: 'Francia', shirt: '#1b3a8c', alt: '#ffffff', pat: 'solid', shorts: '#ffffff', socks: '#c8102e' },
    { id: 'eng', name: 'Inglaterra', shirt: '#ffffff', alt: '#1b2a5c', pat: 'solid', shorts: '#1b2a5c', socks: '#ffffff' },
    { id: 'ger', name: 'Alemania', shirt: '#ffffff', alt: '#111111', pat: 'solid', shorts: '#111111', socks: '#ffffff' },
    { id: 'esp', name: 'España', shirt: '#c8102e', alt: '#f2c200', pat: 'solid', shorts: '#1b2a5c', socks: '#c8102e' },
    { id: 'arg', name: 'Argentina', shirt: '#74acdf', alt: '#ffffff', pat: 'stripes', shorts: '#111111', socks: '#ffffff' },
    { id: 'ned', name: 'Países Bajos', shirt: '#f36c21', alt: '#ffffff', pat: 'solid', shorts: '#ffffff', socks: '#f36c21' },
    { id: 'bel', name: 'Bélgica', shirt: '#c8102e', alt: '#f2c200', pat: 'solid', shorts: '#c8102e', socks: '#c8102e' },
    { id: 'bra', name: 'Brasil', shirt: '#f9d71c', alt: '#1a7a3c', pat: 'solid', shorts: '#1c4aa0', socks: '#ffffff', gk: '#2a9d8f' },
  ],
  club: [
    { id: 'rma', name: 'Real Madrid', shirt: '#ffffff', alt: '#c9b27c', pat: 'solid', shorts: '#ffffff', socks: '#ffffff' },
    { id: 'bar', name: 'Barcelona', shirt: '#004d98', alt: '#a50044', pat: 'stripes', shorts: '#0a2a6b', socks: '#a50044' },
    { id: 'psg', name: 'PSG', shirt: '#0a1f44', alt: '#da291c', pat: 'band', shorts: '#0a1f44', socks: '#0a1f44' },
    { id: 'mun', name: 'Manchester United', shirt: '#da291c', alt: '#ffffff', pat: 'solid', shorts: '#ffffff', socks: '#111111' },
    { id: 'ars', name: 'Arsenal', shirt: '#e5322d', alt: '#ffffff', pat: 'sleeves', shorts: '#ffffff', socks: '#e5322d' },
    { id: 'liv', name: 'Liverpool', shirt: '#c8102e', alt: '#ffffff', pat: 'solid', shorts: '#c8102e', socks: '#c8102e' },
    { id: 'bay', name: 'Bayern Múnich', shirt: '#dc052d', alt: '#ffffff', pat: 'solid', shorts: '#ffffff', socks: '#dc052d' },
    { id: 'col', name: 'Colo-Colo', shirt: '#ffffff', alt: '#111111', pat: 'solid', shorts: '#111111', socks: '#ffffff' },
    { id: 'mci', name: 'Manchester City', shirt: '#6cabdd', alt: '#ffffff', pat: 'solid', shorts: '#ffffff', socks: '#6cabdd' },
    { id: 'rom', name: 'AS Roma', shirt: '#8e1f2f', alt: '#f0a30a', pat: 'solid', shorts: '#ffffff', socks: '#8e1f2f' },
  ],
};

const ALL = TEAMS.sel.concat(TEAMS.club);

export function findTeam(id) {
  return ALL.find((t) => t.id === id) || null;
}

export function getTeam() {
  return findTeam(load('team', 'chi')) || findTeam('chi');
}

export function setTeam(id) {
  if (findTeam(id)) save('team', id);
}

export function groupOf(team) {
  return TEAMS.club.indexOf(team) >= 0 ? 'club' : 'sel';
}

// Small shirt icon used on the team cards.
const SHIRT = 'M12 3 L3 8 L0 17 L8 20 L10 15 V35 H30 V15 L32 20 L40 17 L37 8 L28 3 C25 8 15 8 12 3Z';
export function shirtSVG(t) {
  const id = 'sc-' + t.id;
  let extra = '';
  if (t.pat === 'stripes') extra = `<rect x="8" y="0" width="8" height="40" fill="${t.alt}"/><rect x="24" y="0" width="8" height="40" fill="${t.alt}"/>`;
  if (t.pat === 'band') extra = `<rect x="16" y="0" width="8" height="40" fill="${t.alt}"/>`;
  if (t.pat === 'sleeves') extra = `<rect x="0" y="0" width="10" height="40" fill="${t.alt}"/><rect x="30" y="0" width="10" height="40" fill="${t.alt}"/>`;
  return `<svg viewBox="0 0 40 38" aria-hidden="true"><defs><clipPath id="${id}"><path d="${SHIRT}"/></clipPath></defs>` +
    `<path d="${SHIRT}" fill="${t.shirt}"/><g clip-path="url(#${id})">${extra}</g>` +
    `<path d="${SHIRT}" fill="none" style="stroke:var(--fg);stroke-opacity:.4" stroke-width="1"/></svg>`;
}
