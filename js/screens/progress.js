// Progress for the parent: which multiplications are secure, which are still being practised.
import { topbar } from '../core/ui.js';
import * as progress from '../core/progress.js';

const LABEL = ['todavía no la ha visto', 'la está practicando', 'la sabe segura'];
const GAME_LABEL = { penales: 'Penales', liga: 'Tabla', memoria: 'Memoria' };

function dateLabel(t) {
  try { return new Date(t).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }); }
  catch (e) { return ''; }
}

export default {
  title: 'Mi progreso',

  mount(root) {
    const s = progress.summary();
    let head = '<tr><th scope="col"><span class="lab">×</span></th>';
    for (let b = 1; b <= 9; b++) head += `<th scope="col">${b}</th>`;
    head += '</tr>';
    let rows = '';
    for (let a = 1; a <= 9; a++) {
      rows += `<tr><th scope="row">${a}</th>`;
      for (let b = 1; b <= 9; b++) {
        const l = progress.level(a, b);
        rows += `<td class="l${l}" aria-label="${a} por ${b} igual ${a * b}, ${LABEL[l]}">${a * b}</td>`;
      }
      rows += '</tr>';
    }
    const sessions = s.sessions.length
      ? `<ul class="sessions">${s.sessions.map((x) =>
        `<li><span>${dateLabel(x.t)} · ${GAME_LABEL[x.game] || 'Penales'}</span><span>${x.info ? x.info : x.goals + ' de ' + x.total}</span></li>`).join('')}</ul>`
      : '<p>Aún no hay partidos. Cuando juegue el primero, aparece aquí.</p>';

    root.innerHTML = topbar('Mi progreso', { back: true }) + `
      <section class="panel">
        <div class="counts">
          <div class="count"><span class="num">${s.secure}</span><span class="lab">Seguras</span></div>
          <div class="count"><span class="num">${s.practising}</span><span class="lab">Practicando</span></div>
          <div class="count"><span class="num">${s.fresh}</span><span class="lab">Sin ver</span></div>
        </div>
        <p>Cuenta las 45 multiplicaciones distintas del 1 al 9 (3 × 7 y 7 × 3 son la misma).</p>
      </section>
      <section class="panel">
        <h2>Tabla completa</h2>
        <div class="gridwrap"><table class="mgrid">${head}${rows}</table></div>
        <div class="legend">
          <span><i class="l2"></i>Segura</span>
          <span><i class="l1"></i>Practicando</span>
          <span><i></i>Sin ver</span>
        </div>
      </section>
      <section class="panel">
        <h2>Últimos partidos</h2>
        ${sessions}
      </section>`;
  },
};
