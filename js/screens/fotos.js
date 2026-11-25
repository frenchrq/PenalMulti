// Photos for the memory game. Chosen from the device, kept only on the device.
import { topbar, esc } from '../core/ui.js';
import { PLAYERS } from '../data/players.js';
import { findCountry } from '../core/teams.js';
import { playerSVG } from '../core/cards.js';
import * as photos from '../core/photos.js';

export default {
  title: 'Fotos de jugadores',

  mount(root) {
    root.innerHTML = topbar('Fotos de jugadores', { back: true }) + `
      <section class="panel">
        <p id="count"></p>
        <p>Elige una foto de la galería para cada jugador. Se guardan solo en este dispositivo: no se suben a internet ni se publican. Un jugador sin foto se ve como una silueta.</p>
        <div class="row">
          <button class="btn ghost sm" id="exp" type="button">Guardar copia de las fotos</button>
          <button class="btn ghost sm" id="imp" type="button">Cargar una copia</button>
        </div>
        <p id="msg" aria-live="polite"></p>
        <input type="file" id="file" accept="image/*" hidden>
        <input type="file" id="impfile" accept="application/json,.json" hidden>
      </section>
      <section class="panel plist" id="list"></section>`;

    const $ = (sel) => root.querySelector(sel);
    let all = {};
    let target = null;
    const say = (t) => { $('#msg').textContent = t; };

    function paint() {
      const n = PLAYERS.filter((p) => all[p.id]).length;
      $('#count').innerHTML = `<strong>${n} de ${PLAYERS.length}</strong> jugadores con foto.`;
      $('#list').innerHTML = PLAYERS.map((p) => {
        const team = findCountry(p.c);
        const has = !!all[p.id];
        const thumb = has ? `<img src="${all[p.id]}" alt="">` : playerSVG(team, 'f' + p.id);
        return `<div class="prow" data-id="${p.id}">
          <div class="pthumb">${thumb}</div>
          <div class="pinfo"><strong>${esc(p.n)}</strong><small>${esc(team.name)} · ${esc(p.pos)}</small></div>
          <div class="pbtns">
            <button class="btn ghost sm" type="button" data-act="pick">${has ? 'Cambiar' : 'Elegir foto'}</button>
            ${has ? '<button class="btn ghost sm danger" type="button" data-act="del">Quitar</button>' : ''}
          </div></div>`;
      }).join('');
    }

    async function refresh() { all = await photos.getAll(); paint(); }

    $('#list').addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const id = b.closest('.prow').dataset.id;
      if (b.dataset.act === 'pick') { target = id; $('#file').value = ''; $('#file').click(); }
      else { try { await photos.remove(id); say('Foto quitada.'); } catch (err) { say('No se pudo quitar la foto.'); } refresh(); }
    });

    $('#file').addEventListener('change', async () => {
      const f = $('#file').files[0];
      if (!f || !target) return;
      try {
        await photos.put(target, await photos.fileToThumb(f));
        const p = PLAYERS.find((x) => x.id === target);
        say('Foto guardada para ' + (p ? p.n : '') + '.');
      } catch (err) { say('No se pudo guardar esa foto. Prueba con otra imagen.'); }
      refresh();
    });

    $('#exp').addEventListener('click', async () => {
      try {
        const blob = new Blob([await photos.exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'penalmulti-fotos.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        say('Copia guardada. Para usarla en otro dispositivo, abre "Cargar una copia" allí.');
      } catch (err) { say('No se pudo guardar la copia.'); }
    });

    $('#imp').addEventListener('click', () => { $('#impfile').value = ''; $('#impfile').click(); });
    $('#impfile').addEventListener('change', async () => {
      const f = $('#impfile').files[0];
      if (!f) return;
      try {
        const n = await photos.importJSON(await f.text(), PLAYERS.map((p) => p.id));
        say(n + ' foto' + (n === 1 ? '' : 's') + ' cargada' + (n === 1 ? '' : 's') + '.');
      } catch (err) { say('Ese archivo no es una copia válida de PenalMulti.'); }
      refresh();
    });

    paint(); refresh();
  },
};
