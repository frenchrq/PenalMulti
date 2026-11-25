// Sensory settings shared by every game: sound and "calm mode" (no animations).
import { load, save } from './store.js';

const state = {
  sound: load('sound', true) !== false,
  calm: load('calm', false) === true,
};

export const settings = {
  get sound() { return state.sound; },
  setSound(v) { state.sound = !!v; save('sound', state.sound); },
  get calm() { return state.calm; },
  setCalm(v) { state.calm = !!v; save('calm', state.calm); applySettings(); },
};

export function applySettings() {
  document.documentElement.dataset.calm = state.calm ? 'on' : 'off';
}
