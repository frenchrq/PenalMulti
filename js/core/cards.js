// Drawings for the memory-game cards and the photo screen.
import { shirtInner } from './teams.js';

// Back of a card: a soccer ball on the dark stand colour.
export const BACK = '<svg class="msvg" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="14" fill="#ffffff" fill-opacity=".92"/>' +
  '<polygon points="20,13 26,17.5 23.5,25 16.5,25 14,17.5" fill="#1b1b1b"/></svg>';

// Plain silhouette in the national shirt (used when a player has no photo).
export function playerSVG(team, uid) {
  return `<svg class="msvg" viewBox="0 0 40 52" aria-hidden="true"><circle cx="20" cy="9" r="7.5" fill="var(--muted)"/>` +
    `<svg x="0" y="15" width="40" height="37" viewBox="0 0 40 38">${shirtInner(team, uid)}</svg></svg>`;
}

export function countrySVG(team, uid) {
  return `<svg class="msvg" viewBox="0 0 40 38" aria-hidden="true">${shirtInner(team, uid)}</svg>`;
}

// With a photo: the picture with a small shirt badge in the corner, so the shirt colour still helps.
// `photo` is always a data URL checked by photos.js, so it is safe to put in the markup.
export function playerArt(team, uid, photo) {
  if (!photo) return playerSVG(team, uid);
  return `<span class="mphoto"><img src="${photo}" alt=""><svg class="mbadge" viewBox="0 0 40 38" aria-hidden="true">${shirtInner(team, uid)}</svg></span>`;
}
