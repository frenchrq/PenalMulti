// Team picker: choosing a team changes the player's kit and the crowd right away.
import { topbar, esc } from '../core/ui.js';
import { createScene } from '../core/scene.js';
import { TEAMS, getTeam, setTeam, groupOf, shirtSVG } from '../core/teams.js';

export default {
  title: 'Elige tu equipo',

  mount(root) {
    let team = getTeam();
    let tab = groupOf(team);
    root.innerHTML = topbar('Elige tu equipo', { back: true }) + `
      <div id="sceneBox"></div>
      <section class="panel">
        <div class="seg" role="group" aria-label="Tipo de equipo">
          <button type="button" id="tabSel">Selecciones</button>
          <button type="button" id="tabClub">Clubes</button>
        </div>
        <div class="teams" id="teams" role="group" aria-label="Equipos"></div>
        <a class="btn" href="#/">Listo</a>
      </section>`;
    const $ = (sel) => root.querySelector(sel);
    const scene = createScene($('#sceneBox'));
    scene.applyTeam(team);

    function render() {
      $('#tabSel').setAttribute('aria-pressed', String(tab === 'sel'));
      $('#tabClub').setAttribute('aria-pressed', String(tab === 'club'));
      const box = $('#teams'); box.innerHTML = '';
      TEAMS[tab].forEach((t) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'team';
        b.setAttribute('aria-pressed', String(t.id === team.id));
        b.innerHTML = shirtSVG(t) + `<span>${esc(t.name)}</span>`;
        b.addEventListener('click', () => { team = t; setTeam(t.id); scene.applyTeam(t); render(); });
        box.appendChild(b);
      });
    }
    $('#tabSel').addEventListener('click', () => { tab = 'sel'; render(); });
    $('#tabClub').addEventListener('click', () => { tab = 'club'; render(); });
    render();
  },
};
