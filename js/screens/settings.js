// Settings: sensory options and a way to start over.
import { topbar } from '../core/ui.js';
import { settings } from '../core/settings.js';
import * as progress from '../core/progress.js';
import * as audio from '../core/audio.js';

export default {
  title: 'Ajustes',

  mount(root) {
    root.innerHTML = topbar('Ajustes', { back: true }) + `
      <section class="panel">
        <div class="setrow">
          <div><strong>Sonido</strong><small>Tonos suaves y el público cuando hay gol.</small></div>
          <button class="switch" id="sound" type="button" role="switch" aria-label="Sonido"></button>
        </div>
        <div class="setrow">
          <div><strong>Modo tranquilo</strong><small>Sin animaciones: la pelota y el público no se mueven.</small></div>
          <button class="switch" id="calm" type="button" role="switch" aria-label="Modo tranquilo"></button>
        </div>
      </section>
      <section class="panel">
        <h2>Empezar de cero</h2>
        <p>Borra el progreso guardado en este dispositivo: multiplicaciones practicadas y partidos. El equipo y los ajustes se quedan.</p>
        <button class="btn ghost danger" id="reset" type="button">Borrar progreso</button>
      </section>
      <section class="panel">
        <h2>Sobre PenalMulti</h2>
        <p>Todo se guarda solo en este dispositivo. La aplicación no envía datos a ningún servidor.</p>
      </section>`;
    const $ = (sel) => root.querySelector(sel);
    const timers = [];

    function paint() {
      const s = $('#sound'), c = $('#calm');
      s.setAttribute('aria-checked', String(settings.sound)); s.textContent = settings.sound ? 'Sí' : 'No';
      c.setAttribute('aria-checked', String(settings.calm)); c.textContent = settings.calm ? 'Sí' : 'No';
    }
    $('#sound').addEventListener('click', () => {
      settings.setSound(!settings.sound); paint();
      if (settings.sound) audio.tone(523, 0.25, 0, 0.06);
    });
    $('#calm').addEventListener('click', () => { settings.setCalm(!settings.calm); paint(); });

    // Two taps to delete, so it cannot happen by accident.
    let armed = false;
    $('#reset').addEventListener('click', (e) => {
      const b = e.currentTarget;
      if (!armed) {
        armed = true; b.textContent = '¿Seguro? Toca otra vez para borrar';
        timers.push(setTimeout(() => { armed = false; b.textContent = 'Borrar progreso'; }, 4000));
      } else {
        progress.reset(); armed = false; b.textContent = 'Progreso borrado';
      }
    });
    paint();
    return () => timers.forEach(clearTimeout);
  },
};
