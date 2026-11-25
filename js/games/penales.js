// Penales de multiplicar: answer the multiplication, then take the kick.
import { topbar, esc, rand, pick, shuffle } from '../core/ui.js';
import { createScene } from '../core/scene.js';
import { getTeam } from '../core/teams.js';
import { load, save } from '../core/store.js';
import * as audio from '../core/audio.js';
import * as progress from '../core/progress.js';

const TOTAL = 5;
const factKey = (f) => (f.a <= f.b ? f.a + 'x' + f.b : f.b + 'x' + f.a);

export default {
  title: 'Penales de multiplicar',

  mount(root) {
    const team = getTeam();
    root.innerHTML = topbar('Penales de multiplicar', { back: true }) + `
      <div id="sceneBox"></div>
      <div class="hud" aria-label="Marcador">
        <div class="stat"><span class="lab">Goles</span><span class="val" id="goals">0</span></div>
        <div class="dots" id="dots" aria-hidden="true"></div>
        <div class="stat r"><span class="lab">Racha</span><span class="val" id="streak">0</span></div>
      </div>

      <section class="panel" id="setup">
        <h2>¿Qué tablas quieres practicar hoy?</h2>
        <div class="chips" id="chips" role="group" aria-label="Elegir tablas"></div>
        <p>Son 5 penales. Cada respuesta correcta es un gol y el estadio lo celebra. Si fallas, el arquero ataja y te muestro la respuesta, sin apuro.</p>
        <p>Equipo: <strong>${esc(team.name)}</strong> · <a href="#/equipo">cambiar</a></p>
        <div class="row">
          <button class="btn ghost" id="allBtn" type="button">Elegir todas las tablas</button>
          <button class="btn" id="startBtn" type="button">¡A patear!</button>
        </div>
      </section>

      <section class="panel" id="play" hidden>
        <div class="question" id="q" aria-live="polite"></div>
        <div class="opts" id="opts"></div>
        <div class="fb" id="fb" hidden aria-live="polite"></div>
        <button class="btn" id="next" type="button" hidden>Siguiente tiro</button>
      </section>

      <section class="panel" id="result" hidden>
        <h2 id="rTitle"></h2>
        <div class="big" id="rScore"></div>
        <p id="rBest"></p>
        <div id="rReviewBox" hidden>
          <p style="margin-bottom:8px">Para repasar:</p>
          <ul class="review" id="rReview"></ul>
        </div>
        <div class="row">
          <a class="btn ghost" href="#/">Volver al inicio</a>
          <button class="btn" id="again" type="button">Jugar otra vez</button>
        </div>
      </section>`;

    const $ = (sel) => root.querySelector(sel);
    const scene = createScene($('#sceneBox'));
    scene.applyTeam(team);

    const timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

    let tables = new Set((load('tables', [2, 3, 4, 5]) || []).filter((n) => n >= 1 && n <= 9));
    if (!tables.size) tables = new Set([2, 3, 4, 5]);
    let best = Number(load('best', 0)) || 0;
    let st;

    function freshState() {
      return { goals: 0, streak: 0, results: [], queue: [], missed: [], asked: new Set(), last: null, cur: null, locked: false, sinceMiss: 0 };
    }
    st = freshState();

    /* ---------- setup ---------- */
    function renderChips() {
      const box = $('#chips');
      box.innerHTML = '';
      for (let n = 1; n <= 9; n++) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = n;
        b.setAttribute('aria-label', 'Tabla del ' + n);
        b.setAttribute('aria-pressed', String(tables.has(n)));
        b.addEventListener('click', () => {
          if (tables.has(n)) tables.delete(n); else tables.add(n);
          b.setAttribute('aria-pressed', String(tables.has(n)));
          $('#startBtn').disabled = tables.size === 0;
          save('tables', Array.from(tables));
        });
        box.appendChild(b);
      }
      $('#startBtn').disabled = tables.size === 0;
    }
    $('#allBtn').addEventListener('click', () => {
      for (let n = 1; n <= 9; n++) tables.add(n);
      save('tables', Array.from(tables));
      renderChips();
    });

    /* ---------- questions ---------- */
    // New and shaky facts come up more often; a fact already asked this round much less.
    function pickFact() {
      if (st.queue.length && st.sinceMiss >= 1) return st.queue.shift();
      const pool = [];
      tables.forEach((a) => {
        for (let b = 1; b <= 9; b++) {
          const f = { a, b };
          if (st.last && factKey(st.last) === factKey(f)) continue;
          let w = progress.weight(a, b);
          if (st.asked.has(factKey(f))) w *= 0.15;
          pool.push({ f, w });
        }
      });
      if (!pool.length) return { a: 2, b: 2 };
      let r = Math.random() * pool.reduce((s, p) => s + p.w, 0);
      let chosen = pool[pool.length - 1].f;
      for (const p of pool) { r -= p.w; if (r <= 0) { chosen = p.f; break; } }
      return rand(2) ? { a: chosen.b, b: chosen.a } : { a: chosen.a, b: chosen.b };
    }
    function makeOptions(a, b) {
      const ans = a * b, set = new Set([ans]);
      const cand = shuffle([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ans + 10, ans - 10, ans + 2, ans - 2, ans + 1, ans - 1]);
      for (let i = 0; i < cand.length && set.size < 4; i++) if (cand[i] > 0 && !set.has(cand[i])) set.add(cand[i]);
      while (set.size < 4) set.add(2 + rand(80));
      return shuffle(Array.from(set));
    }

    /* ---------- scoreboard ---------- */
    function renderHud() {
      $('#goals').textContent = st.goals;
      $('#streak').textContent = st.streak;
      const d = $('#dots');
      d.innerHTML = '';
      for (let i = 0; i < TOTAL; i++) {
        const s = document.createElement('span');
        const r = st.results[i];
        s.className = 'dot' + (r === 'g' ? ' g' : r === 'm' ? ' m' : (i === st.results.length ? ' cur' : ''));
        d.appendChild(s);
      }
    }

    /* ---------- flow ---------- */
    function show(id) {
      ['setup', 'play', 'result'].forEach((k) => { $('#' + k).hidden = (k !== id); });
    }
    function startRound() {
      st = freshState();
      scene.reset(); renderHud(); show('play'); nextQuestion();
    }
    function nextQuestion() {
      if (st.results.length >= TOTAL) return showResult();
      st.sinceMiss++;
      st.cur = pickFact(); st.last = st.cur; st.asked.add(factKey(st.cur)); st.locked = false;
      scene.reset();
      $('#q').textContent = st.cur.a + ' × ' + st.cur.b + ' = ?';
      const box = $('#opts'); box.innerHTML = '';
      makeOptions(st.cur.a, st.cur.b).forEach((n) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'opt'; b.textContent = n; b.dataset.n = n;
        b.addEventListener('click', () => answer(n));
        box.appendChild(b);
      });
      $('#fb').hidden = true; $('#next').hidden = true;
      renderHud();
    }
    function answer(n) {
      if (st.locked) return;
      st.locked = true;
      const f = st.cur, right = f.a * f.b, ok = n === right;
      $('#opts').querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (Number(b.dataset.n) === right) b.classList.add('ok');
        else if (Number(b.dataset.n) === n) b.classList.add('no');
      });
      progress.record(f.a, f.b, ok);
      scene.kick(ok);
      if (ok) {
        st.goals++; st.streak++; st.results.push('g');
        st.missed = st.missed.filter((m) => factKey(m) !== factKey(f));
      } else {
        st.streak = 0; st.results.push('m'); st.sinceMiss = -1;
        if (!st.missed.some((m) => factKey(m) === factKey(f))) st.missed.push(f);
        st.queue.push(f);
      }
      later(() => {
        const fb = $('#fb');
        if (ok) {
          scene.banner('¡GOL!', false);
          scene.cheer();
          fb.className = 'fb'; fb.textContent = '¡Correcto! ' + f.a + ' × ' + f.b + ' = ' + right;
          audio.goalChime(); audio.roar();
        } else {
          scene.banner('¡Atajado!', true);
          fb.className = 'fb miss'; fb.textContent = 'Casi. ' + f.a + ' × ' + f.b + ' = ' + right + '. Esta la vamos a repetir.';
          audio.saveSound();
        }
        fb.hidden = false;
        const nx = $('#next');
        nx.textContent = st.results.length >= TOTAL ? 'Ver resultado' : 'Siguiente tiro';
        nx.hidden = false; nx.focus();
        renderHud();
      }, 750);
    }
    function showResult() {
      const g = st.goals;
      if (g > best) { best = g; save('best', best); }
      progress.addSession(g, TOTAL, Array.from(tables));
      $('#rTitle').textContent = g === TOTAL ? '¡Partidazo perfecto!' : g >= 3 ? '¡Muy buen partido!' : 'Buen entrenamiento, vamos de nuevo';
      $('#rScore').textContent = g + ' de ' + TOTAL + ' goles';
      $('#rBest').textContent = 'Tu mejor marcador: ' + best + ' de ' + TOTAL;
      const list = $('#rReview'); list.innerHTML = '';
      st.missed.forEach((m) => {
        const li = document.createElement('li');
        li.textContent = m.a + ' × ' + m.b + ' = ' + (m.a * m.b);
        list.appendChild(li);
      });
      $('#rReviewBox').hidden = st.missed.length === 0;
      scene.reset(); show('result');
      if (g >= 3) audio.winChime();
    }

    $('#startBtn').addEventListener('click', startRound);
    $('#again').addEventListener('click', startRound);
    $('#next').addEventListener('click', nextQuestion);

    renderChips(); renderHud(); show('setup');

    return () => { timers.forEach(clearTimeout); };
  },
};
