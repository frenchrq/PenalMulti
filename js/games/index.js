// Registry of games. To add a game: create js/games/<id>.js that exports a default
// { mount(root) } and register it in js/app.js and here so the home screen lists it.
export const GAMES = [
  {
    id: 'penales',
    title: 'Penales de multiplicar',
    blurb: 'Responde la multiplicación y patea al arco. Cada acierto es un gol.',
  },
];
