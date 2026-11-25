// Memoria de leyendas: match each famous player with the country he played for.
// Round flow: study phase (all cards face up, no timer) -> cards are hidden -> find the pairs.
// A wrong pair stays visible until he taps "Seguir", so he can take his time. There is no clock.
// Player cards use the photo chosen on the "Fotos de jugadores" screen, or a silhouette if there is none.
import { topbar, esc, pick, shuffle } from '../core/ui.js';
import { getTeam, findCountry } from '../core/teams.js';
import { PLAYERS } from '../data/players.js';
import { BACK, playerArt, countrySVG } from '../core/cards.js';
import { load, save } from '../core/store.js';
import * as audio from '../core/audio.js';
import * as progress from '../core/progress.js';
import * as photos from '../core/photos.js';

// Fácil: four pairs and every shirt a different colour, so the colour helps.
// Normal: six pairs from any countries, several shirts look alike, so he has to know the player.
const LEVELS = { easy: { pairs: 4, cols: 4, distinct: true }, normal: { pairs: 6, cols: 3, distinct: false } };

// Countries that have at least one player.
const COUNTRIES = new Set();
PLAYERS.forEach((p) => { COUNTRIES.add(p.c); if (p.alt) COUNTRIES.add(p.alt); });
// Countries whose shirts have a similar main colour; Fácil takes at most one from each group.
const GROUPS = [['por', 'chi', 'esp', 'hun', 'urs'], ['eng', 'ger'], ['fra', 'ita'], ['arg'], ['ned'], ['bra'], ['nir']]
  .map((g) => g.filter((id) => COUNTRIES.has(id))).filter((g) => g.length);

function pickCountries(level) {
  const lv = LEVELS[level];
  const me = getTeam();
  const mine = COUNTRIES.has(me.id) ? me.id : null; // his own national team is in the round when it has players
  if (lv.distinct) {
    const groups = shuffle(GROUPS).slice(0, lv.pairs);
    if (mine) {
      const g = GROUPS.find((x) => x.indexOf(mine) >= 0);
      if (groups.indexOf(g) < 0) groups[0] = g;
    }
    return groups.map((g) => (mine && g.indexOf(mine) >= 0 ? mine : pick(g)));
  }
  const pool = shuffle(Array.from(COUNTRIES).filter((id) => id !== mine));
  return (mine ? [mine] : []).concat(pool).slice(0, lv.pairs);
}

// One player per country. A player who also played for a second country is only used when
// that second country is not in the round, so a pair is never ambiguous.
function assign(ids) {
  const used = new Set(), out = [];
  for (const id of shuffle(ids)) {
    const cand = PLAYERS.filter((p) => (p.c === id || p.alt === id) && !used.has(p.id) &&
      [p.c, p.alt].filter((x) => x && x !== id).every((x) => ids.indexOf(x) < 0));
    if (!cand.length) return null;
    const p = pick(cand); used.add(p.id); out.push({ id, p });
  }
  return out;
}

function buildCards(level, pics) {
  let ids, asg = null;
  for (let t = 0; t < 80 && !asg; t++) { ids = pickCountries(level); asg = assign(ids); }
  if (!asg) { ids = ['arg', 'bra', 'fra', 'ned']; asg = assign(ids); }
  const cards = [];
  asg.forEach((a, i) => {
    const team = findCountry(a.id);
    cards.push({ k: 'p', pair: i, label: a.p.n, team, photo: pics[a.p.id] || null, up: false, done: false });
    cards.push({ k: 'c', pair: i, label: team.name, team, photo: null, up: false, done: false });
  });
  return shuffle(cards);
}

export default {
  title: 'Memoria de leyendas',

  mount(root) {
    root.innerHTML = topbar('Memoria de leyendas', { back: true }) + `
      <div class="hud memhud" aria-label="Marcador">
        <div class="stat"><span class="lab">Parejas</span><span class="val" id="found">0 / 0</span></div>
        <div class="stat r"><span class="lab">Intentos</span><span class="val" id="tries">0</span></div>
      </div>

      <div class="mcards" id="cards" hidden></div>

      <section class="panel" id="setup">
        <h2>Une cada jugador con su país</h2>
        <p>Primero miras todas las cartas con calma. Después se esconden y buscas las parejas: un jugador y el país con el que jugó. No hay reloj.</p>
        <div class="seg" role="group" aria-label="Nivel">
          <button type="button" id="lvEasy">Fácil</button>
          <button type="button" id="lvNormal">Normal</button>
        </div>
        <p id="lvHelp"></p>
        <p id="photoInfo"></p>
        <button class="btn" id="startBtn" type="button">¡A jugar!</button>
      </section>

      <section class="panel" id="study" hidden>
        <h2>Mira las cartas con calma</h2>
        <p>Fíjate en cada jugador y en su país. Cuando quieras, esconde las cartas.</p>
        <button class="btn" id="hideBtn" type="button">Esconder las cartas</button>
      </section>

      <section class="panel" id="play" hidden>
        <p id="hint">Toca dos cartas: un jugador y su país.</p>
        <div class="fb" id="fb" hidden aria-live="polite"></div>
        <button class="btn" id="next" type="button" hidden>Seguir</button>
        <button class="btn" id="finish" type="button" hidden>Ver resultado</button>
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
    let level = load('memoria-level', 'easy'); if (!LEVELS[level]) level = 'easy';
    let cards = [], els = [], phase = 'setup', locked = false, flipped = [], tries = 0, found = 0, pairs = 0;

    function paintLevel() {
      $('#lvEasy').setAttribute('aria-pressed', String(level === 'easy'));
      $('#lvNormal').setAttribute('aria-pressed', String(level === 'normal'));
      $('#lvHelp').textContent = level === 'easy'
        ? 'Fácil: 4 parejas. Cada camiseta es de un color distinto, así que el color te ayuda.'
        : 'Normal: 6 parejas. Hay camisetas parecidas, tienes que conocer al jugador.';
    }
    $('#lvEasy').addEventListener('click', () => { level = 'easy'; save('memoria-level', level); paintLevel(); });
    $('#lvNormal').addEventListener('click', () => { level = 'normal'; save('memoria-level', level); paintLevel(); });

    photos.getAll().then((pics) => {
      const n = PLAYERS.filter((p) => pics[p.id]).length;
      $('#photoInfo').innerHTML = `Jugadores con foto: ${n} de ${PLAYERS.length}. <a href="#/fotos">${n ? 'Cambiar fotos' : 'Agregar fotos'}</a>`;
    });

    function show(id) { ['setup', 'study', 'play', 'result'].forEach((k) => { $('#' + k).hidden = (k !== id); }); }
    function renderHud() { $('#found').textContent = found + ' / ' + pairs; $('#tries').textContent = tries; }

    function paintCard(i) {
      const c = cards[i], el = els[i];
      el.classList.toggle('up', c.up || c.done);
      el.classList.toggle('done', c.done);
      el.setAttribute('aria-label', c.up || c.done ? (c.k === 'p' ? 'Jugador: ' : 'País: ') + c.label : 'Carta escondida');
    }

    function renderCards() {
      const box = $('#cards');
      box.style.setProperty('--cols', LEVELS[level].cols);
      box.dataset.cols = LEVELS[level].cols;
      box.innerHTML = '';
      els = cards.map((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mcard ' + c.k;
        b.dataset.pair = c.pair; b.dataset.k = c.k;
        const art = c.k === 'p' ? playerArt(c.team, 'p' + i, c.photo) : countrySVG(c.team, 'c' + i);
        b.innerHTML = `<span class="minner"><span class="mface mback">${BACK}</span>` +
          `<span class="mface mfront"><span class="mlab">${c.k === 'p' ? 'Jugador' : 'País'}</span>${art}<span class="mname">${esc(c.label)}</span></span></span>`;
        b.addEventListener('click', () => tap(i));
        box.appendChild(b);
        return b;
      });
      box.hidden = false;
      cards.forEach((_, i) => paintCard(i));
    }

    async function startRound() {
      const pics = await photos.getAll();
      cards = buildCards(level, pics);
      pairs = cards.length / 2; found = 0; tries = 0; flipped = []; locked = false;
      renderCards();
      cards.forEach((c, i) => { c.up = true; paintCard(i); }); // study phase: everything face up
      phase = 'study'; renderHud(); show('study');
      $('#hideBtn').focus();
    }

    function hideAll() {
      cards.forEach((c, i) => { c.up = false; paintCard(i); });
      phase = 'play'; flipped = []; locked = false;
      $('#hint').hidden = false; $('#fb').hidden = true; $('#next').hidden = true; $('#finish').hidden = true;
      show('play');
    }

    function tap(i) {
      const c = cards[i];
      if (phase !== 'play' || locked || c.up || c.done) return;
      c.up = true; paintCard(i); flipped.push(i);
      if (flipped.length < 2) { $('#fb').hidden = true; $('#hint').hidden = false; return; }
      tries++;
      const a = cards[flipped[0]], b = cards[flipped[1]];
      const fb = $('#fb');
      $('#hint').hidden = true;
      if (a.k !== b.k && a.pair === b.pair) {
        a.done = b.done = true; found++;
        flipped.forEach((j) => paintCard(j)); flipped = [];
        fb.className = 'fb'; fb.textContent = '¡Pareja! ' + (a.k === 'p' ? a.label : b.label) + ' juega con ' + (a.k === 'c' ? a.label : b.label) + '.';
        audio.goalChime();
        if (found === pairs) { phase = 'done'; $('#finish').hidden = false; $('#finish').focus(); }
      } else {
        locked = true;
        const p = a.k === 'p' ? a : b.k === 'p' ? b : null;
        const k = a.k === 'c' ? a : b.k === 'c' ? b : null;
        fb.className = 'fb miss';
        fb.textContent = p && k ? 'Casi. ' + p.label + ' no es de ' + k.label + '.'
          : 'Son dos ' + (a.k === 'p' ? 'jugadores' : 'países') + '. Busca un jugador y su país.';
        els[flipped[0]].classList.add('bad'); els[flipped[1]].classList.add('bad');
        audio.saveSound();
        $('#next').hidden = false; $('#next').focus();
      }
      fb.hidden = false; renderHud();
    }

    $('#next').addEventListener('click', () => {
      flipped.forEach((j) => { cards[j].up = false; els[j].classList.remove('bad'); paintCard(j); });
      flipped = []; locked = false;
      $('#fb').hidden = true; $('#next').hidden = true; $('#hint').hidden = false;
    });

    function showResult() {
      const key = 'memoria-best-' + level;
      const prev = Number(load(key, 0)) || 0;
      if (!prev || tries < prev) save(key, tries);
      const best = Math.min(prev || tries, tries);
      progress.addSession(pairs, pairs, [], 'memoria', tries + ' intentos');
      const perfect = tries === pairs;
      $('#rTitle').textContent = perfect ? '¡Memoria perfecta!' : '¡Encontraste todas las parejas!';
      $('#rScore').textContent = pairs + ' parejas en ' + tries + ' intentos';
      $('#rBest').textContent = 'Tu mejor marca en este nivel: ' + best + ' intentos';
      $('#cards').hidden = true;
      show('result');
      audio.winChime();
    }
    $('#finish').addEventListener('click', showResult);
    $('#hideBtn').addEventListener('click', hideAll);
    $('#startBtn').addEventListener('click', startRound);
    $('#again').addEventListener('click', () => { $('#cards').hidden = true; startRound(); });

    paintLevel(); show('setup');
  },
};
