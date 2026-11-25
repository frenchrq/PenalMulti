// Tabla de posiciones: a small league table with four teams, and five questions about it.
// Uses addition, subtraction and the 3 points per win (a multiplication by 3).
// Rules shown on screen: win = 3 points, draw = 1, loss = 0.
import { topbar, esc, rand, pick, shuffle } from '../core/ui.js';
import { TEAMS, getTeam, shirtSVG } from '../core/teams.js';
import { load, save } from '../core/store.js';
import * as audio from '../core/audio.js';
import * as progress from '../core/progress.js';

const TOTAL = 5;
// One question of each kind per round, in random order.
const TYPES = ['pts', 'pj', 'after', 'gap', 'top'];
const LEVELS = { easy: { g: 3, e: 2, p: 2 }, normal: { g: 5, e: 3, p: 3 } };
const COLS = ['pj', 'g', 'e', 'p', 'pts'];

const pts = (r) => 3 * r.g + r.e;
const pj = (r) => r.g + r.e + r.p;
const cellValue = (r, c) => (c === 'pj' ? pj(r) : c === 'pts' ? pts(r) : r[c]);

/* ---------- data ---------- */
function genRows(level) {
  const me = getTeam();
  const others = shuffle(TEAMS.sel.concat(TEAMS.club).filter((t) => t.id !== me.id)).slice(0, 3);
  const lv = LEVELS[level] || LEVELS.easy;
  for (let tries = 0; tries < 300; tries++) {
    const rows = [me].concat(others).map((team) => ({ team, g: rand(lv.g + 1), e: rand(lv.e + 1), p: rand(lv.p + 1) }));
    const ps = rows.map(pts), max = Math.max.apply(null, ps);
    // Played at least 2 each, a single leader, and at least 3 different point totals.
    if (rows.every((r) => pj(r) >= 2) && ps.filter((x) => x === max).length === 1 && new Set(ps).size >= 3 && max >= 3) return rows;
  }
  const fixed = [[3, 1, 0], [2, 2, 1], [1, 1, 2], [0, 2, 2]];
  return [me].concat(others).map((team, i) => ({ team, g: fixed[i][0], e: fixed[i][1], p: fixed[i][2] }));
}

function numOptions(ans, extras) {
  const set = new Set([ans]);
  shuffle(extras).forEach((x) => { if (Number.isInteger(x) && x >= 0 && !set.has(x) && set.size < 4) set.add(x); });
  for (let d = 1; set.size < 4; d++) {
    [ans + d, ans - d].forEach((x) => { if (x >= 0 && !set.has(x) && set.size < 4) set.add(x); });
  }
  return shuffle(Array.from(set)).map((n) => ({ label: String(n), value: n }));
}

// Builds one question from the current table. hidden = the cell shown as "?", hl = cells to point at.
function makeQuestion(type, rows) {
  const idx = rows.map((_, i) => i);

  if (type === 'pts') {
    const cand = idx.filter((i) => rows[i].g >= 1);
    if (!cand.length) return makeQuestion('pj', rows);
    const i = pick(cand), t = rows[i], ans = pts(t);
    return {
      type, kind: 'num', answer: ans,
      text: `¿Cuántos puntos tiene ${t.team.name}?`,
      options: numOptions(ans, [3 * t.g, t.g + t.e, 3 + t.e, 3 * t.e + t.g, ans + 3, ans - 3]),
      hidden: { row: i, col: 'pts' },
      hl: [{ row: i, col: 'g' }, { row: i, col: 'e' }],
      explain: `Ganó ${t.g}: ${t.g} × 3 = ${3 * t.g}. Más ${t.e} empate${t.e === 1 ? '' : 's'}: ${ans} puntos.`,
    };
  }

  if (type === 'pj') {
    const i = pick(idx.filter((k) => pj(rows[k]) >= 2)), t = rows[i], ans = pj(t);
    return {
      type, kind: 'num', answer: ans,
      text: `¿Cuántos partidos jugó ${t.team.name}?`,
      options: numOptions(ans, [t.g + t.e, t.g + t.p, t.e + t.p, ans + 1, ans - 1]),
      hidden: { row: i, col: 'pj' },
      hl: [{ row: i, col: 'g' }, { row: i, col: 'e' }, { row: i, col: 'p' }],
      explain: `${t.g} + ${t.e} + ${t.p} = ${ans} partidos jugados.`,
    };
  }

  if (type === 'after') {
    const i = pick(idx), t = rows[i], won = rand(2) === 0, add = won ? 3 : 1, cur = pts(t), ans = cur + add;
    return {
      type, kind: 'num', answer: ans,
      text: `Hoy ${t.team.name} ${won ? 'ganó' : 'empató'}. ¿Cuántos puntos tiene ahora?`,
      options: numOptions(ans, [cur + (won ? 1 : 3), cur, ans + 1, ans - 1, ans + 2]),
      hidden: null,
      hl: [{ row: i, col: 'pts' }],
      explain: `Tenía ${cur} puntos. ${won ? 'Ganar da 3' : 'Empatar da 1'}: ${cur} + ${add} = ${ans}.`,
      apply() { if (won) t.g++; else t.e++; },
    };
  }

  if (type === 'gap') {
    const pairs = [];
    idx.forEach((i) => idx.forEach((j) => { if (pts(rows[i]) < pts(rows[j])) pairs.push([i, j]); }));
    if (!pairs.length) return makeQuestion('pj', rows);
    const pr = pick(pairs), x = rows[pr[0]], y = rows[pr[1]], ans = pts(y) - pts(x);
    return {
      type, kind: 'num', answer: ans,
      text: `¿Cuántos puntos le faltan a ${x.team.name} para alcanzar a ${y.team.name}?`,
      options: numOptions(ans, [pts(x) + pts(y), ans + 1, ans - 1, ans + 2, pts(y)]),
      hidden: null,
      hl: [{ row: pr[0], col: 'pts' }, { row: pr[1], col: 'pts' }],
      explain: `${pts(y)} − ${pts(x)} = ${ans}.`,
    };
  }

  // 'top'
  const ps = rows.map(pts), max = Math.max.apply(null, ps);
  const leaders = idx.filter((i) => ps[i] === max);
  if (leaders.length !== 1) return makeQuestion('pj', rows);
  return {
    type, kind: 'team', answer: leaders[0],
    text: '¿Quién tiene más puntos?',
    options: shuffle(rows.map((r, i) => ({ label: r.team.name, value: i, team: r.team }))),
    hidden: null,
    hl: idx.map((i) => ({ row: i, col: 'pts' })),
    explain: `${rows[leaders[0]].team.name} tiene ${max} puntos, nadie tiene más.`,
  };
}

/* ---------- game ---------- */
export default {
  title: 'Tabla de posiciones',

  mount(root) {
    root.innerHTML = topbar('Tabla de posiciones', { back: true }) + `
      <div class="hud" aria-label="Marcador">
        <div class="stat"><span class="lab">Aciertos</span><span class="val" id="goals">0</span></div>
        <div class="dots" id="dots" aria-hidden="true"></div>
        <div class="stat r"><span class="lab">Racha</span><span class="val" id="streak">0</span></div>
      </div>

      <section class="panel tight">
        <table class="liga" id="table"></table>
        <div class="rules">
          <span><strong>PJ</strong> partidos jugados · <strong>G</strong> ganados · <strong>E</strong> empatados · <strong>P</strong> perdidos · <strong>Pts</strong> puntos</span>
          <span>Ganar da 3 puntos, empatar 1 y perder 0.</span>
        </div>
      </section>

      <section class="panel" id="setup">
        <h2>Lee la tabla y responde</h2>
        <p>Son 5 preguntas sobre cuatro equipos: puntos, partidos jugados, quién va primero y cuánto falta para alcanzar a otro. Sin apuro.</p>
        <div class="seg" role="group" aria-label="Nivel">
          <button type="button" id="lvEasy">Fácil</button>
          <button type="button" id="lvNormal">Normal</button>
        </div>
        <p id="lvHelp"></p>
        <button class="btn" id="startBtn" type="button">¡A jugar!</button>
      </section>

      <section class="panel" id="play" hidden>
        <div class="qtext" id="q" aria-live="polite"></div>
        <div class="opts" id="opts"></div>
        <div class="fb" id="fb" hidden aria-live="polite"></div>
        <button class="btn" id="next" type="button" hidden>Siguiente pregunta</button>
      </section>

      <section class="panel" id="result" hidden>
        <h2 id="rTitle"></h2>
        <div class="big" id="rScore"></div>
        <p id="rBest"></p>
        <div class="row">
          <a class="btn ghost" href="#/">Volver al inicio</a>
          <button class="btn" id="again" type="button">Jugar otra vez</button>
        </div>
      </section>`;

    const $ = (sel) => root.querySelector(sel);
    let level = load('liga-level', 'easy'); if (!LEVELS[level]) level = 'easy';
    let best = Number(load('liga-best', 0)) || 0;
    let st = null;
    let rows = genRows(level);

    function renderTable(hidden, hl) {
      let h = '<thead><tr><th scope="col" class="tn">Equipo</th>' +
        '<th scope="col">PJ</th><th scope="col">G</th><th scope="col">E</th><th scope="col">P</th><th scope="col">Pts</th></tr></thead><tbody>';
      rows.forEach((r, i) => {
        h += `<tr${i === 0 ? ' class="me"' : ''}><th scope="row" class="tn"><div class="tcell">${shirtSVG(r.team)}<span>${esc(r.team.name)}</span></div></th>`;
        COLS.forEach((c) => {
          const isQ = hidden && hidden.row === i && hidden.col === c;
          const isHl = (hl || []).some((x) => x.row === i && x.col === c);
          h += `<td class="${isQ ? 'q' : isHl ? 'hl' : ''}${c === 'pts' ? ' pt' : ''}">${isQ ? '?' : cellValue(r, c)}</td>`;
        });
        h += '</tr>';
      });
      $('#table').innerHTML = h + '</tbody>';
    }

    function paintLevel() {
      $('#lvEasy').setAttribute('aria-pressed', String(level === 'easy'));
      $('#lvNormal').setAttribute('aria-pressed', String(level === 'normal'));
      $('#lvHelp').textContent = level === 'easy'
        ? 'Fácil: hasta 3 partidos ganados por equipo.'
        : 'Normal: hasta 5 partidos ganados por equipo.';
    }
    function setLevel(l) { level = l; save('liga-level', l); paintLevel(); rows = genRows(level); renderTable(null, []); }
    $('#lvEasy').addEventListener('click', () => setLevel('easy'));
    $('#lvNormal').addEventListener('click', () => setLevel('normal'));

    function renderHud() {
      const s = st || { goals: 0, streak: 0, results: [] };
      $('#goals').textContent = s.goals;
      $('#streak').textContent = s.streak;
      const d = $('#dots'); d.innerHTML = '';
      for (let i = 0; i < TOTAL; i++) {
        const dot = document.createElement('span');
        const r = s.results[i];
        dot.className = 'dot' + (r === 'g' ? ' g' : r === 'm' ? ' m' : (i === s.results.length ? ' cur' : ''));
        d.appendChild(dot);
      }
    }
    function show(id) { ['setup', 'play', 'result'].forEach((k) => { $('#' + k).hidden = (k !== id); }); }

    function startRound() {
      rows = genRows(level);
      st = { order: shuffle(TYPES), goals: 0, streak: 0, results: [], cur: null, locked: false };
      renderHud(); show('play'); nextQuestion();
    }

    function nextQuestion() {
      if (st.results.length >= TOTAL) return showResult();
      const q = makeQuestion(st.order[st.results.length], rows);
      st.cur = q; st.locked = false;
      renderTable(q.hidden, q.hl);
      $('#q').textContent = q.text;
      const box = $('#opts'); box.innerHTML = '';
      q.options.forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button'; b.dataset.v = o.value;
        if (q.kind === 'team') { b.className = 'opt team'; b.innerHTML = shirtSVG(o.team) + `<span>${esc(o.label)}</span>`; }
        else { b.className = 'opt'; b.textContent = o.label; }
        b.addEventListener('click', () => answer(o.value));
        box.appendChild(b);
      });
      $('#fb').hidden = true; $('#next').hidden = true;
      renderHud();
    }

    function answer(v) {
      if (st.locked) return;
      st.locked = true;
      const q = st.cur, ok = v === q.answer;
      $('#opts').querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (Number(b.dataset.v) === q.answer) b.classList.add('ok');
        else if (Number(b.dataset.v) === v) b.classList.add('no');
      });
      if (q.apply) q.apply();
      renderTable(null, q.hl);
      st.results.push(ok ? 'g' : 'm');
      if (ok) { st.goals++; st.streak++; audio.goalChime(); } else { st.streak = 0; audio.saveSound(); }
      const fb = $('#fb');
      fb.className = 'fb' + (ok ? '' : ' miss');
      fb.textContent = (ok ? '¡Correcto! ' : 'Casi. ') + q.explain;
      fb.hidden = false;
      const nx = $('#next');
      nx.textContent = st.results.length >= TOTAL ? 'Ver resultado' : 'Siguiente pregunta';
      nx.hidden = false; nx.focus();
      renderHud();
    }

    function showResult() {
      const g = st.goals;
      if (g > best) { best = g; save('liga-best', best); }
      progress.addSession(g, TOTAL, [], 'liga');
      $('#rTitle').textContent = g === TOTAL ? '¡Campeón de la tabla!' : g >= 3 ? '¡Muy bien leído!' : 'Buen entrenamiento, vamos de nuevo';
      $('#rScore').textContent = g + ' de ' + TOTAL + ' respuestas correctas';
      $('#rBest').textContent = 'Tu mejor marcador: ' + best + ' de ' + TOTAL;
      show('result');
      if (g >= 3) audio.winChime();
    }

    $('#startBtn').addEventListener('click', startRound);
    $('#again').addEventListener('click', startRound);
    $('#next').addEventListener('click', nextQuestion);

    paintLevel(); renderTable(null, []); renderHud(); show('setup');
  },
};
