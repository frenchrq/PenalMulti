# PenalMulti

Penales de multiplicar: a soccer-themed learning app for practising the multiplication tables (1 to 9).
Built for an 8-year-old autistic child, with predictability and sensory control in mind. The app itself is in Spanish.

It is a plain web app (no build step, no dependencies) that works offline and can be added to the
home screen of a phone or tablet.

## What is in it

- **Penales de multiplicar**: answer the multiplication, take the kick. A right answer is a goal, a wrong one is saved by the keeper and that fact comes back a couple of shots later.
- **Tabla de posiciones**: a four-team league table (PJ, G, E, P, Pts). Five questions per round, one of each kind: points from wins and draws (a multiplication by 3), games played, the table after a new result, how many points a team is behind another, and who leads. Two levels: Fácil and Normal.
- **Memoria de leyendas**: two modes. **Cartas iguales** is the classic memory game (find the two identical cards of each player, best with photos). **Jugador y país** matches each famous retired player with the country he played for. Every round starts with a calm study phase (all cards face up, no timer), then the cards are hidden. A wrong pair stays visible until he taps "Seguir". Two levels: Fácil (4 pairs, every shirt a different colour) and Normal (6 pairs, similar shirts). The player list is in `js/data/players.js`: add your own favourites there. Player cards show the photo chosen on the **Fotos de jugadores** screen, or a plain silhouette in the national shirt colours when there is none.
- **Fotos de jugadores**: the parent picks a photo from the device for each player. Photos are shrunk and kept only in that browser (IndexedDB). They are never stored in this repository and never uploaded. "Guardar copia" / "Cargar una copia" move them to another device through a `.json` file. Pick pictures you are allowed to use.
- **Team picker**: 20 teams (10 national teams, 10 clubs) with plain home-kit colours (no crests or logos). The player and the crowd wear the chosen colours.
- **Progress**: tracks the 45 distinct facts from 1x1 to 9x9 as not seen / practising / secure, shown to the parent as a 9x9 grid. New and shaky facts are asked more often.
- **Settings**: sound on/off, and a calm mode with no animations.

All data (team, progress, settings) stays in the device's `localStorage`. Nothing is sent anywhere.

## Run it locally

ES modules need a web server (opening `index.html` with a double click will not work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

1. In the repository go to **Settings → Pages**.
2. Under **Build and deployment** choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the app is at `https://<user>.github.io/<repo>/`.

Note: GitHub Pages on a *private* repository needs a paid GitHub plan. On a free account, make the repository public (there is no personal data in it).

On the phone or tablet, open that address and use **Add to Home Screen** (Safari: Share menu; Chrome: menu).

## Project layout

```
index.html              page shell
css/app.css             all styles (colour tokens, light and dark)
js/app.js               hash router
js/core/                shared by every game
  teams.js              team list and kit colours (edit here to fix or add a team)
  scene.js              stadium, crowd, player, keeper and ball
  progress.js           per-fact tracking and weighting
  settings.js, audio.js, store.js, ui.js
js/games/               one file per game, listed in games/index.js
js/screens/             home, team picker, progress, settings
sw.js                   offline cache (bump VERSION when files change)
manifest.webmanifest    install on home screen
icons/
```

## Adding a game

1. Create `js/games/<id>.js` exporting `default { title, mount(root) }`. `mount` fills `root` and may return a cleanup function. Use `createScene`, `progress`, `audio` and `settings` from `js/core/`.
2. Import it in `js/app.js` and add it to `ROUTES`.
3. Add an entry to `js/games/index.js` so the home screen shows it.
4. Add the new file to `ASSETS` in `sw.js` and bump `VERSION`.

## Design principles

- Same layout every time, no surprises; the child decides when to move on ("Siguiente tiro").
- A wrong answer is a save, never a punishment: the right answer is shown and that fact returns later.
- No flashing, short sounds at a low volume, everything can be turned off.
- Big touch targets, works in portrait and landscape.

## Ideas for later

- Goal difference in the league table (needs negative numbers).
- Build a team: collect players by finishing rounds.
- Division, and mixed practice.
- Export or import progress between devices.
