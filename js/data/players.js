// Famous retired players for the memory game and the photo screen.
//   id      short unique name (photos are saved under it)
//   n       name shown on the cards
//   c       national team id (por, chi, fra, eng, ger, esp, arg, ned, bel, bra, ita, hun, nir, urs)
//   alt     optional second national team he also played for (the game never puts both in one round)
//   pos     position
//   legacy  one-line achievement (not shown yet)
// To add a favourite, add a line here (and a kit in js/core/teams.js if the country is new).
export const PLAYERS = [
  { id: 'messi', n: 'Messi', c: 'arg', pos: 'Delantero', legacy: 'Máximo ganador del Balón de Oro (8), campeón del mundo (2022) y líder histórico de títulos.' },
  { id: 'pele', n: 'Pelé', c: 'bra', pos: 'Delantero', legacy: 'Único jugador en ganar tres Copas del Mundo (1958, 1962 y 1970).' },
  { id: 'maradona', n: 'Maradona', c: 'arg', pos: 'Mediocampista', legacy: 'Campeón y Balón de Oro del Mundial 1986; ícono máximo de Napoli y Argentina.' },
  { id: 'cr7', n: 'Cristiano Ronaldo', c: 'por', pos: 'Delantero', legacy: 'Máximo goleador histórico del fútbol oficial y 5 veces ganador del Balón de Oro.' },
  { id: 'cruyff', n: 'Cruyff', c: 'ned', pos: 'Delantero', legacy: '3 Balones de Oro y estandarte del "Fútbol Total" con Ajax, Barcelona y su selección.' },
  { id: 'zidane', n: 'Zidane', c: 'fra', pos: 'Mediocampista', legacy: 'Campeón del Mundial 1998, Eurocopa 2000 y Champions League con el Real Madrid.' },
  { id: 'beckenbauer', n: 'Beckenbauer', c: 'ger', pos: 'Defensa', legacy: '"El Kaiser", campeón del mundo como jugador (1974) y entrenador (1990); 2 Balones de Oro.' },
  { id: 'distefano', n: 'Di Stéfano', c: 'arg', alt: 'esp', pos: 'Delantero', legacy: '2 Balones de Oro y motor de las 5 Copas de Europa consecutivas del Real Madrid.' },
  { id: 'ronaldo', n: 'Ronaldo Nazário', c: 'bra', pos: 'Delantero', legacy: 'Bicampeón mundial (1994 y 2002) y doble ganador del Balón de Oro.' },
  { id: 'puskas', n: 'Puskás', c: 'hun', alt: 'esp', pos: 'Delantero', legacy: 'Capitán del "Equipo de Oro" húngaro y multicampeón de Europa con el Real Madrid.' },
  { id: 'platini', n: 'Platini', c: 'fra', pos: 'Mediocampista', legacy: 'Ganador de tres Balones de Oro consecutivos (1983–1985) y campeón de la Eurocopa 1984.' },
  { id: 'garrincha', n: 'Garrincha', c: 'bra', pos: 'Extremo', legacy: 'Bicampeón mundial (1958 y 1962) y referente histórico del regate.' },
  { id: 'ronaldinho', n: 'Ronaldinho', c: 'bra', pos: 'Mediocampista', legacy: 'Campeón mundial (2002), Balón de Oro 2005 y símbolo de magia en el FC Barcelona.' },
  { id: 'best', n: 'George Best', c: 'nir', pos: 'Extremo', legacy: 'Balón de Oro 1968 y leyenda del Manchester United campeón de Europa.' },
  { id: 'muller', n: 'Gerd Müller', c: 'ger', pos: 'Delantero', legacy: 'Campeón mundial (1974), Balón de Oro 1970 y goleador histórico del Bayern de Múnich.' },
  { id: 'vanbasten', n: 'Van Basten', c: 'ned', pos: 'Delantero', legacy: '3 Balones de Oro y campeón de la Eurocopa 1988 con el AC Milan y Países Bajos.' },
  { id: 'eusebio', n: 'Eusébio', c: 'por', pos: 'Delantero', legacy: '"La Pantera Negra", Balón de Oro 1965 y figura histórica del Benfica.' },
  { id: 'zico', n: 'Zico', c: 'bra', pos: 'Mediocampista', legacy: 'Máximo ídolo del Flamengo y cerebro de la selección brasileña de los años 80.' },
  { id: 'maldini', n: 'Maldini', c: 'ita', pos: 'Defensa', legacy: '5 Copas de Europa y referente de longevidad defensiva en el AC Milan.' },
  { id: 'iniesta', n: 'Iniesta', c: 'esp', pos: 'Mediocampista', legacy: 'Autor del gol del Mundial 2010, bicampeón de Eurocopa y 4 veces campeón de Champions.' },
  { id: 'romario', n: 'Romário', c: 'bra', pos: 'Delantero', legacy: 'Campeón y Balón de Oro del Mundial 1994; más de 700 goles oficiales.' },
  { id: 'xavi', n: 'Xavi', c: 'esp', pos: 'Mediocampista', legacy: 'Eje del juego de posesión de España (Mundial 2010, Eurocopas 2008 y 2012) y Barcelona.' },
  { id: 'charlton', n: 'Bobby Charlton', c: 'eng', pos: 'Mediocampista', legacy: 'Campeón mundial (1966), Balón de Oro el mismo año y leyenda del Manchester United.' },
  { id: 'yashin', n: 'Yashin', c: 'urs', pos: 'Portero', legacy: '"La Araña Negra", único arquero en ganar el Balón de Oro (1963).' },
  { id: 'matthaus', n: 'Matthäus', c: 'ger', pos: 'Mediocampista', legacy: 'Campeón mundial (1990), Balón de Oro y récord de cinco Mundiales disputados en su época.' },
  { id: 'baresi', n: 'Baresi', c: 'ita', pos: 'Defensa', legacy: 'Campeón mundial (1982), 3 Copas de Europa y capitán histórico del AC Milan.' },
  { id: 'baggio', n: 'Baggio', c: 'ita', pos: 'Delantero', legacy: 'Balón de Oro 1993 y figura determinante de Italia en el Mundial 1994.' },
  { id: 'meazza', n: 'Meazza', c: 'ita', pos: 'Delantero', legacy: 'Bicampeón mundial (1934 y 1938) y máxima leyenda temprana del fútbol italiano.' },
  { id: 'gullit', n: 'Gullit', c: 'ned', pos: 'Mediocampista', legacy: 'Balón de Oro 1987, campeón de la Eurocopa 1988 y pilar del gran AC Milan.' },
  { id: 'buffon', n: 'Buffon', c: 'ita', pos: 'Portero', legacy: 'Campeón mundial (2006) y referente de regularidad bajo los tres palos durante más de dos décadas.' },

  // Chilean legends, so a round always has players for Chile.
  { id: 'zamorano', n: 'Zamorano', c: 'chi', pos: 'Delantero', legacy: '' },
  { id: 'salas', n: 'Marcelo Salas', c: 'chi', pos: 'Delantero', legacy: '' },
  { id: 'figueroa', n: 'Elías Figueroa', c: 'chi', pos: 'Defensa', legacy: '' },
  { id: 'caszely', n: 'Caszely', c: 'chi', pos: 'Delantero', legacy: '' },
];
