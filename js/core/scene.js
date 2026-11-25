// The stadium scene shared by games: crowd, goal, keeper, a player in the chosen team's kit and the ball.
//   const scene = createScene(container);
//   scene.applyTeam(team);  scene.kick(true);  scene.cheer();  scene.reset();
const NS = 'http://www.w3.org/2000/svg';

const BALL_HOME = 'translate(200px,226px) scale(1) rotate(0deg)';
const KEEPER_HOME = 'translate(200px,134px) rotate(0deg)';
const KICKER_HOME = 'translate(164px,230px)';
const KICKER_KICK = 'translate(178px,229px)';
const GOAL_T = { L: [112, 92], R: [288, 92], C: [200, 80] };
const KEEP_T = {
  L: 'translate(128px,128px) rotate(-68deg)',
  R: 'translate(272px,128px) rotate(68deg)',
  C: 'translate(200px,134px) rotate(0deg)',
};

const MARKUP = `
<svg viewBox="0 0 400 260" role="img" aria-label="Estadio con público, arco de fútbol, arquero y un jugador junto a la pelota en el punto penal">
  <defs>
    <pattern id="net" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M0 0H10M0 0V10" stroke="#ffffff" stroke-opacity=".38" stroke-width=".8" fill="none"/>
    </pattern>
    <clipPath id="kclip"><rect x="-12" y="-30" width="24" height="27" rx="6"/></clipPath>
  </defs>
  <rect class="stand" x="0" y="0" width="400" height="56"/>
  <g class="crowd"></g>
  <rect x="0" y="0" width="400" height="7" fill="#000000" fill-opacity=".35"/>
  <g fill="#fff3c4" fill-opacity=".9">
    <circle cx="14" cy="3.5" r="1.8"/><circle cx="22" cy="3.5" r="1.8"/><circle cx="30" cy="3.5" r="1.8"/>
    <circle cx="370" cy="3.5" r="1.8"/><circle cx="378" cy="3.5" r="1.8"/><circle cx="386" cy="3.5" r="1.8"/>
  </g>
  <g>
    <rect x="0" y="50" width="50" height="6" fill="#1d4e89"/><rect x="50" y="50" width="50" height="6" fill="#e9eef2"/>
    <rect x="100" y="50" width="50" height="6" fill="#2a2f35"/><rect x="150" y="50" width="50" height="6" fill="#c9d3da"/>
    <rect x="200" y="50" width="50" height="6" fill="#1d4e89"/><rect x="250" y="50" width="50" height="6" fill="#e9eef2"/>
    <rect x="300" y="50" width="50" height="6" fill="#2a2f35"/><rect x="350" y="50" width="50" height="6" fill="#c9d3da"/>
  </g>
  <rect class="pa" x="0" y="56" width="400" height="204"/>
  <rect class="pb" x="0" y="104" width="400" height="38"/>
  <rect class="pb" x="0" y="184" width="400" height="38"/>
  <rect x="80" y="62" width="240" height="108" fill="#000000" fill-opacity=".2"/>
  <rect x="80" y="62" width="240" height="108" fill="url(#net)"/>
  <path d="M20 170H380" stroke="#ffffff" stroke-opacity=".85" stroke-width="2" fill="none"/>
  <path d="M110 170V198H290V170" stroke="#ffffff" stroke-opacity=".85" stroke-width="2" fill="none"/>
  <circle cx="200" cy="226" r="3" fill="#ffffff"/>
  <path d="M80 170V62H320V170" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <g class="sc-keeper" style="transform: ${KEEPER_HOME}">
    <line x1="-5" y1="10" x2="-7" y2="30" stroke="#16222b" stroke-width="5" stroke-linecap="round"/>
    <line x1="5" y1="10" x2="7" y2="30" stroke="#16222b" stroke-width="5" stroke-linecap="round"/>
    <line class="gks" x1="-11" y1="-14" x2="-25" y2="-3" stroke-width="6" stroke-linecap="round"/>
    <line class="gks" x1="11" y1="-14" x2="25" y2="-3" stroke-width="6" stroke-linecap="round"/>
    <rect class="gkf" x="-11" y="-20" width="22" height="32" rx="7"/>
    <circle cx="-26" cy="-2" r="4" fill="#ffffff"/>
    <circle cx="26" cy="-2" r="4" fill="#ffffff"/>
    <circle cx="0" cy="-29" r="9" fill="#d9a679"/>
  </g>

  <g class="sc-kicker" style="transform: ${KICKER_HOME}">
    <ellipse cx="0" cy="27" rx="13" ry="3" fill="#000000" fill-opacity=".18"/>
    <line class="kos" x1="-5" y1="8" x2="-5" y2="24" stroke-width="5" stroke-linecap="round"/>
    <line class="kos" x1="5" y1="8" x2="5" y2="24" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="-5" cy="26" rx="4.5" ry="2.4" fill="#16222b"/>
    <ellipse cx="5" cy="26" rx="4.5" ry="2.4" fill="#16222b"/>
    <rect class="khf" x="-11" y="-5" width="22" height="14" rx="4"/>
    <line x1="-14" y1="-20" x2="-16" y2="-7" stroke="#d9a679" stroke-width="4" stroke-linecap="round"/>
    <line x1="14" y1="-20" x2="16" y2="-7" stroke="#d9a679" stroke-width="4" stroke-linecap="round"/>
    <rect class="ksf" x="-12" y="-30" width="24" height="27" rx="6"/>
    <g clip-path="url(#kclip)">
      <g class="k-str"><rect class="kaf" x="-7.2" y="-30" width="4.8" height="27"/><rect class="kaf" x="2.4" y="-30" width="4.8" height="27"/></g>
      <rect class="kaf k-band" x="-2.4" y="-30" width="4.8" height="27"/>
    </g>
    <rect class="kslv" x="-18" y="-29" width="8" height="11" rx="3"/>
    <rect class="kslv" x="10" y="-29" width="8" height="11" rx="3"/>
    <circle cx="0" cy="-37" r="7.5" fill="#3a2a20"/>
  </g>

  <g class="sc-ball" style="transform: ${BALL_HOME}">
    <circle r="11" fill="#ffffff" stroke="#1b1b1b" stroke-width="1.2"/>
    <polygon points="0,-5 4.8,-1.5 3,4 -3,4 -4.8,-1.5" fill="#1b1b1b"/>
  </g>
</svg>
<div class="banner" hidden aria-live="polite"></div>`;

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function createScene(container) {
  container.classList.add('scene');
  container.innerHTML = MARKUP;
  const svg = container.querySelector('svg');
  const q = (sel) => container.querySelector(sel);
  const ball = q('.sc-ball'), keeper = q('.sc-keeper'), kicker = q('.sc-kicker'), banner = q('.banner');

  function drawCrowd(t) {
    const g = q('.crowd'); g.innerHTML = '';
    const rnd = mulberry(hash(t.id));
    const mine = [t.shirt, t.shirt, t.alt, t.shorts];
    const neutral = ['#2b3a45', '#44586a', '#7f8f9b', '#c7d0d6', '#e8ecef', '#1c2730', '#586b7a'];
    for (let r = 0; r < 6; r++) {
      const row = document.createElementNS(NS, 'g');
      row.setAttribute('class', 'crow');
      const y = 14 + r * 6.6;
      for (let x = 3 + (r % 2) * 3; x < 400; x += 6) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', (x + rnd() * 1.4 - 0.7).toFixed(1));
        c.setAttribute('cy', (y + rnd() * 1.2 - 0.6).toFixed(1));
        c.setAttribute('r', '2.3');
        c.setAttribute('fill', rnd() < 0.62 ? mine[Math.floor(rnd() * mine.length)] : neutral[Math.floor(rnd() * neutral.length)]);
        row.appendChild(c);
      }
      g.appendChild(row);
    }
  }

  return {
    el: container,

    applyTeam(t) {
      const k = kicker.style;
      k.setProperty('--ks', t.shirt); k.setProperty('--ka', t.alt); k.setProperty('--kh', t.shorts);
      k.setProperty('--ko', t.socks); k.setProperty('--kslv', t.pat === 'sleeves' ? t.alt : t.shirt);
      q('.k-str').style.display = t.pat === 'stripes' ? '' : 'none';
      q('.k-band').style.display = t.pat === 'band' ? '' : 'none';
      keeper.style.setProperty('--gk', t.gk || '#f2a516');
      drawCrowd(t);
    },

    // ok = true: the ball goes into the net and the keeper dives the wrong way.
    // ok = false: the keeper dives to the right side and saves it.
    kick(ok) {
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      let side, kside, bx, by, bs = 0.6;
      if (ok) {
        side = pick(['L', 'R', 'C']);
        kside = side === 'L' ? 'R' : side === 'R' ? 'L' : pick(['L', 'R']);
        bx = GOAL_T[side][0]; by = GOAL_T[side][1];
      } else {
        side = pick(['L', 'R']); kside = side;
        bx = side === 'L' ? 124 : 276; by = 108; bs = 0.7;
      }
      kicker.style.transform = KICKER_KICK;
      ball.style.transform = `translate(${bx}px,${by}px) scale(${bs}) rotate(540deg)`;
      keeper.style.transform = KEEP_T[kside];
    },

    cheer() { svg.classList.add('cheer'); },

    banner(text, miss) {
      banner.textContent = text;
      banner.className = 'banner' + (miss ? ' miss' : '');
      banner.hidden = false;
    },

    reset() {
      const els = [ball, keeper, kicker];
      els.forEach((e) => e.classList.add('snap'));
      ball.style.transform = BALL_HOME; keeper.style.transform = KEEPER_HOME; kicker.style.transform = KICKER_HOME;
      svg.classList.remove('cheer');
      void ball.getBoundingClientRect();
      els.forEach((e) => e.classList.remove('snap'));
      banner.hidden = true;
    },
  };
}
