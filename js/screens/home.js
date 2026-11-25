// Start screen: his team in the stadium, the games, and a short progress line.
import { topbar, esc } from '../core/ui.js';
import { createScene } from '../core/scene.js';
import { getTeam } from '../core/teams.js';
import { GAMES } from '../games/index.js';
import * as progress from '../core/progress.js';

export default {
  title: 'PenalMulti',

  mount(root) {
    const team = getTeam();
    const s = progress.summary();
    root.innerHTML = topbar('PenalMulti', { links: [['#/progreso', 'Progreso'], ['#/ajustes', 'Ajustes']] }) + `
      <div id="sceneBox"></div>
      <section class="panel teamrow">
        <div><span class="lab">Tu equipo</span><strong>${esc(team.name)}</strong></div>
        <a class="btn ghost" href="#/equipo">Cambiar equipo</a>
      </section>
      <h2 class="sec">Juegos</h2>
      ${GAMES.map((g) => `
        <a class="gamecard" href="#/${g.id}">
          <span class="gname">${esc(g.title)}</span>
          <span class="gdesc">${esc(g.blurb)}</span>
          <span class="gplay">Jugar ›</span>
        </a>`).join('')}
      <a class="gamecard" href="#/progreso">
        <span class="gname">Mis multiplicaciones</span>
        <span class="gdesc">${s.secure} de ${s.total} ya las sabe seguras.</span>
        <span class="gplay">Ver progreso ›</span>
      </a>`;
    const scene = createScene(root.querySelector('#sceneBox'));
    scene.applyTeam(team);
  },
};
