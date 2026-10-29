import { LEVELS } from '../src/levels/levelData.js';

for (let id = 19; id <= 30; id++) {
  const lvl = LEVELS.find(l => l.id === id);
  console.log(`\n=== LEVEL ${lvl.id}: ${lvl.title} (${lvl.world}) ===`);
  console.log('Par:', lvl.parCards);
  console.log('Concept:', lvl.concept);
  console.log('Hint:', lvl.hint);
  console.log('Available:', lvl.availableCards);
  console.log('Start:', lvl.startPos);
  console.log('Finish:', lvl.finishPos);
  console.log('Crystals:', lvl.crystals);
  console.log('Switches:', lvl.switches);
  const H = lvl.layout.length;
  const W = lvl.layout[0].length;
  for (let y = 0; y < H; y++) {
    let row = '';
    for (let x = 0; x < W; x++) {
      let c = lvl.layout[y][x];
      if (x === lvl.startPos.x && y === lvl.startPos.y) c = 'B';
      else if (x === lvl.finishPos.x && y === lvl.finishPos.y) c = 'F';
      else if (lvl.crystals && lvl.crystals.some(cr => cr.x === x && cr.y === y)) c = '*';
      else if (lvl.switches && lvl.switches.some(s => s.x === x && s.y === y)) c = 'S';
      row += String(c).padStart(2, ' ') + ' ';
    }
    console.log(y + ': ' + row);
  }
}

