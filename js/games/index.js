// Registry of games. To add a game: create js/games/<id>.js that exports a default
// { mount(root) } and register it in js/app.js and here so the home screen lists it.
export const GAMES = [
  {
    id: 'penales',
    title: 'Penales de multiplicar',
    blurb: 'Responde la multiplicación y patea al arco. Cada acierto es un gol.',
  },
  {
    id: 'liga',
    title: 'Tabla de posiciones',
    blurb: 'Lee la tabla de la liga: suma puntos, cuenta partidos y descubre quién va primero.',
  },
];
